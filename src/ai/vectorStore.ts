// Vector Store Implementation for Semantic Search and RAG
// Implements vector embeddings and similarity search for intelligent data retrieval

export interface VectorEmbedding {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
  content: string;
  timestamp: string;
}

export interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
  relevance: number;
}

export interface RAGContext {
  query: string;
  context: SearchResult[];
  generatedResponse: string;
  confidence: number;
  sources: string[];
}

class VectorStore {
  private embeddings: Map<string, VectorEmbedding> = new Map();
  private index: Map<string, number[]> = new Map();
  private dimension = 384; // Using sentence-transformers dimension

  constructor() {
    this.initializeVectorStore();
  }

  // Initialize vector store with sample data
  private async initializeVectorStore(): Promise<void> {
    const sampleData = [
      {
        id: 'competitor-analysis-1',
        content: 'Tanishq is a leading jewelry brand with strong market presence in India, focusing on gold and diamond jewelry with premium positioning.',
        metadata: { type: 'competitor', category: 'premium', region: 'national' }
      },
      {
        id: 'market-trend-1',
        content: 'Digital jewelry shopping is growing rapidly with AR try-on features becoming essential for online jewelry retailers.',
        metadata: { type: 'trend', category: 'technology', impact: 'high' }
      },
      {
        id: 'persona-insight-1',
        content: 'Young professionals aged 25-35 prefer minimalist jewelry designs with sustainable and ethical sourcing practices.',
        metadata: { type: 'persona', segment: 'young-professionals', age: '25-35' }
      },
      {
        id: 'content-strategy-1',
        content: 'Instagram reels with jewelry styling tips and behind-the-scenes content generate 3x higher engagement than static posts.',
        metadata: { type: 'content', platform: 'instagram', format: 'reel' }
      }
    ];

    for (const data of sampleData) {
      await this.addEmbedding(data.id, data.content, data.metadata);
    }
  }

  // Generate embeddings using a simple hash-based approach (in production, use proper embedding service)
  private generateEmbedding(text: string): number[] {
    // Simple hash-based embedding for demo (replace with actual embedding service)
    const hash = this.hashString(text);
    const embedding = new Array(this.dimension).fill(0);
    
    for (let i = 0; i < this.dimension; i++) {
      embedding[i] = Math.sin(hash + i) * 0.5 + 0.5; // Normalize to 0-1
    }
    
    return embedding;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Add embedding to vector store
  async addEmbedding(id: string, content: string, metadata: Record<string, any>): Promise<void> {
    const vector = this.generateEmbedding(content);
    const embedding: VectorEmbedding = {
      id,
      vector,
      metadata,
      content,
      timestamp: new Date().toISOString()
    };

    this.embeddings.set(id, embedding);
    this.index.set(id, vector);
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Search for similar embeddings
  async search(query: string, limit: number = 5, threshold: number = 0.7): Promise<SearchResult[]> {
    const queryVector = this.generateEmbedding(query);
    const results: SearchResult[] = [];

    for (const [id, vector] of this.index.entries()) {
      const similarity = this.cosineSimilarity(queryVector, vector);
      
      if (similarity >= threshold) {
        const embedding = this.embeddings.get(id);
        if (embedding) {
          results.push({
            id,
            content: embedding.content,
            metadata: embedding.metadata,
            similarity,
            relevance: this.calculateRelevance(query, embedding.content, embedding.metadata)
          });
        }
      }
    }

    // Sort by relevance score (combination of similarity and metadata relevance)
    results.sort((a, b) => b.relevance - a.relevance);
    
    return results.slice(0, limit);
  }

  // Calculate relevance score based on similarity and metadata matching
  private calculateRelevance(query: string, content: string, metadata: Record<string, any>): number {
    const similarityWeight = 0.7;
    const metadataWeight = 0.3;

    // Base similarity score
    const queryVector = this.generateEmbedding(query);
    const contentVector = this.generateEmbedding(content);
    const similarity = this.cosineSimilarity(queryVector, contentVector);

    // Metadata relevance score
    const queryLower = query.toLowerCase();
    let metadataScore = 0;
    
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string' && queryLower.includes(value.toLowerCase())) {
        metadataScore += 0.2;
      }
    }

    return similarity * similarityWeight + Math.min(metadataScore, 1) * metadataWeight;
  }

  // Batch add embeddings
  async addBatch(embeddings: Array<{ id: string; content: string; metadata: Record<string, any> }>): Promise<void> {
    for (const embedding of embeddings) {
      await this.addEmbedding(embedding.id, embedding.content, embedding.metadata);
    }
  }

  // Get embedding by ID
  getEmbedding(id: string): VectorEmbedding | undefined {
    return this.embeddings.get(id);
  }

  // Update embedding
  async updateEmbedding(id: string, content: string, metadata: Record<string, any>): Promise<void> {
    await this.addEmbedding(id, content, metadata);
  }

  // Delete embedding
  deleteEmbedding(id: string): void {
    this.embeddings.delete(id);
    this.index.delete(id);
  }

  // Get all embeddings
  getAllEmbeddings(): VectorEmbedding[] {
    return Array.from(this.embeddings.values());
  }

  // Search by metadata filters
  async searchByMetadata(filters: Record<string, any>, limit: number = 10): Promise<VectorEmbedding[]> {
    const results: VectorEmbedding[] = [];

    for (const embedding of this.embeddings.values()) {
      let matches = true;
      
      for (const [key, value] of Object.entries(filters)) {
        if (embedding.metadata[key] !== value) {
          matches = false;
          break;
        }
      }

      if (matches) {
        results.push(embedding);
      }
    }

    return results.slice(0, limit);
  }

  // Get statistics about the vector store
  getStats(): {
    totalEmbeddings: number;
    averageVectorLength: number;
    metadataTypes: Record<string, number>;
    lastUpdated: string;
  } {
    const totalEmbeddings = this.embeddings.size;
    let totalVectorLength = 0;
    const metadataTypes: Record<string, number> = {};
    let lastUpdated = '';

    for (const embedding of this.embeddings.values()) {
      totalVectorLength += embedding.vector.length;
      
      for (const key of Object.keys(embedding.metadata)) {
        metadataTypes[key] = (metadataTypes[key] || 0) + 1;
      }

      if (!lastUpdated || embedding.timestamp > lastUpdated) {
        lastUpdated = embedding.timestamp;
      }
    }

    return {
      totalEmbeddings,
      averageVectorLength: totalEmbeddings > 0 ? totalVectorLength / totalEmbeddings : 0,
      metadataTypes,
      lastUpdated
    };
  }
}

// Export singleton instance
export const vectorStore = new VectorStore();