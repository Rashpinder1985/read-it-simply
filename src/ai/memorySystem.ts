// AI Memory System for Context Retention and Learning
// Implements persistent memory with context awareness and learning capabilities

export interface MemoryItem {
  id: string;
  type: 'conversation' | 'preference' | 'fact' | 'insight' | 'pattern';
  content: string;
  context: Record<string, any>;
  importance: number; // 0-100
  accessCount: number;
  lastAccessed: string;
  createdAt: string;
  expiresAt?: string;
  tags: string[];
  relationships: string[]; // IDs of related memories
}

export interface MemoryQuery {
  type?: string;
  tags?: string[];
  context?: Record<string, any>;
  minImportance?: number;
  limit?: number;
}

export interface LearningPattern {
  id: string;
  pattern: string;
  confidence: number;
  frequency: number;
  examples: string[];
  lastUpdated: string;
}

export interface ContextualMemory {
  currentContext: Record<string, any>;
  relevantMemories: MemoryItem[];
  patterns: LearningPattern[];
  confidence: number;
}

class AIMemorySystem {
  private memories: Map<string, MemoryItem> = new Map();
  private patterns: Map<string, LearningPattern> = new Map();
  private contextHistory: Array<Record<string, any>> = [];
  private maxMemories = 1000;
  private maxContextHistory = 50;

  constructor() {
    this.initializeMemorySystem();
  }

  // Initialize memory system with default memories
  private async initializeMemorySystem(): Promise<void> {
    const defaultMemories = [
      {
        id: 'user-preference-1',
        type: 'preference' as const,
        content: 'User prefers detailed analysis with actionable insights',
        context: { domain: 'business-analysis' },
        importance: 80,
        tags: ['user-preference', 'analysis-style']
      },
      {
        id: 'domain-knowledge-1',
        type: 'fact' as const,
        content: 'Jewelry industry trends include digital transformation and sustainable practices',
        context: { domain: 'jewelry-industry', category: 'trends' },
        importance: 90,
        tags: ['industry-knowledge', 'trends', 'jewelry']
      },
      {
        id: 'conversation-pattern-1',
        type: 'pattern' as const,
        content: 'User frequently asks about competitor analysis and market positioning',
        context: { domain: 'market-analysis' },
        importance: 85,
        tags: ['conversation-pattern', 'user-behavior']
      }
    ];

    for (const memory of defaultMemories) {
      await this.storeMemory(memory);
    }
  }

  // Store a new memory
  async storeMemory(memoryData: Partial<MemoryItem>): Promise<string> {
    const memory: MemoryItem = {
      id: memoryData.id || this.generateMemoryId(),
      type: memoryData.type || 'fact',
      content: memoryData.content || '',
      context: memoryData.context || {},
      importance: memoryData.importance || 50,
      accessCount: 0,
      lastAccessed: new Date().toISOString(),
      createdAt: memoryData.createdAt || new Date().toISOString(),
      expiresAt: memoryData.expiresAt,
      tags: memoryData.tags || [],
      relationships: memoryData.relationships || []
    };

    this.memories.set(memory.id, memory);

    // Update learning patterns
    await this.updateLearningPatterns(memory);

    // Cleanup old memories if needed
    if (this.memories.size > this.maxMemories) {
      await this.cleanupOldMemories();
    }

    return memory.id;
  }

  // Retrieve memories based on query
  async retrieveMemories(query: MemoryQuery): Promise<MemoryItem[]> {
    const results: MemoryItem[] = [];
    
    for (const memory of this.memories.values()) {
      let matches = true;

      // Check type filter
      if (query.type && memory.type !== query.type) {
        matches = false;
      }

      // Check tags filter
      if (query.tags && !query.tags.every(tag => memory.tags.includes(tag))) {
        matches = false;
      }

      // Check context filter
      if (query.context) {
        for (const [key, value] of Object.entries(query.context)) {
          if (memory.context[key] !== value) {
            matches = false;
            break;
          }
        }
      }

      // Check importance threshold
      if (query.minImportance && memory.importance < query.minImportance) {
        matches = false;
      }

      if (matches) {
        results.push(memory);
      }
    }

    // Sort by relevance (importance + recency + access count)
    results.sort((a, b) => {
      const scoreA = this.calculateMemoryScore(a);
      const scoreB = this.calculateMemoryScore(b);
      return scoreB - scoreA;
    });

    return results.slice(0, query.limit || 10);
  }

  // Calculate memory relevance score
  private calculateMemoryScore(memory: MemoryItem): number {
    const importanceWeight = 0.4;
    const recencyWeight = 0.3;
    const accessWeight = 0.3;

    const importance = memory.importance / 100;
    const recency = this.calculateRecency(memory.lastAccessed);
    const access = Math.min(memory.accessCount / 10, 1);

    return importance * importanceWeight + recency * recencyWeight + access * accessWeight;
  }

  // Calculate recency score (0-1)
  private calculateRecency(timestamp: string): number {
    const now = Date.now();
    const memoryTime = new Date(timestamp).getTime();
    const ageInHours = (now - memoryTime) / (1000 * 60 * 60);
    
    // Decay over time (memories older than 30 days get lower scores)
    return Math.max(0, 1 - (ageInHours / (30 * 24)));
  }

  // Update context and retrieve relevant memories
  async updateContext(context: Record<string, any>): Promise<ContextualMemory> {
    // Store context in history
    this.contextHistory.push({
      ...context,
      timestamp: new Date().toISOString()
    });

    // Limit context history
    if (this.contextHistory.length > this.maxContextHistory) {
      this.contextHistory = this.contextHistory.slice(-this.maxContextHistory);
    }

    // Find relevant memories
    const relevantMemories = await this.findRelevantMemories(context);

    // Find relevant patterns
    const relevantPatterns = await this.findRelevantPatterns(context);

    // Calculate confidence based on memory relevance
    const confidence = this.calculateContextConfidence(relevantMemories, relevantPatterns);

    return {
      currentContext: context,
      relevantMemories,
      patterns: relevantPatterns,
      confidence
    };
  }

  // Find memories relevant to current context
  private async findRelevantMemories(context: Record<string, any>): Promise<MemoryItem[]> {
    const relevantMemories: MemoryItem[] = [];

    for (const memory of this.memories.values()) {
      let relevance = 0;

      // Check context overlap
      for (const [key, value] of Object.entries(context)) {
        if (memory.context[key] === value) {
          relevance += 1;
        }
      }

      // Check tag relevance
      const contextTags = this.extractContextTags(context);
      const tagOverlap = contextTags.filter(tag => memory.tags.includes(tag)).length;
      relevance += tagOverlap * 0.5;

      // Check content relevance (simple keyword matching)
      const contextText = JSON.stringify(context).toLowerCase();
      const contentKeywords = memory.content.toLowerCase().split(/\s+/);
      const keywordMatches = contentKeywords.filter(keyword => 
        contextText.includes(keyword) && keyword.length > 3
      ).length;
      relevance += keywordMatches * 0.3;

      if (relevance > 0.5) {
        relevantMemories.push({
          ...memory,
          accessCount: memory.accessCount + 1,
          lastAccessed: new Date().toISOString()
        });
      }
    }

    // Update memory access counts
    for (const memory of relevantMemories) {
      this.memories.set(memory.id, memory);
    }

    return relevantMemories
      .sort((a, b) => this.calculateMemoryScore(b) - this.calculateMemoryScore(a))
      .slice(0, 10);
  }

  // Extract tags from context
  private extractContextTags(context: Record<string, any>): string[] {
    const tags: string[] = [];
    
    for (const [key, value] of Object.entries(context)) {
      tags.push(key);
      if (typeof value === 'string') {
        tags.push(value.toLowerCase().replace(/\s+/g, '-'));
      }
    }

    return [...new Set(tags)];
  }

  // Find relevant learning patterns
  private async findRelevantPatterns(context: Record<string, any>): Promise<LearningPattern[]> {
    const relevantPatterns: LearningPattern[] = [];

    for (const pattern of this.patterns.values()) {
      const contextText = JSON.stringify(context).toLowerCase();
      
      if (contextText.includes(pattern.pattern.toLowerCase())) {
        relevantPatterns.push(pattern);
      }
    }

    return relevantPatterns
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  // Calculate context confidence
  private calculateContextConfidence(memories: MemoryItem[], patterns: LearningPattern[]): number {
    const memoryScore = memories.length > 0 ? 
      memories.reduce((sum, mem) => sum + this.calculateMemoryScore(mem), 0) / memories.length : 0;
    
    const patternScore = patterns.length > 0 ? 
      patterns.reduce((sum, pattern) => sum + pattern.confidence, 0) / patterns.length : 0;

    return Math.min((memoryScore * 0.6 + patternScore * 0.4) * 100, 100);
  }

  // Update learning patterns based on new memory
  private async updateLearningPatterns(memory: MemoryItem): Promise<void> {
    const content = memory.content.toLowerCase();
    const words = content.split(/\s+/).filter(word => word.length > 3);

    for (const word of words) {
      const patternId = `pattern_${word}`;
      let pattern = this.patterns.get(patternId);

      if (!pattern) {
        pattern = {
          id: patternId,
          pattern: word,
          confidence: 0.1,
          frequency: 1,
          examples: [memory.content],
          lastUpdated: new Date().toISOString()
        };
      } else {
        pattern.frequency += 1;
        pattern.examples.push(memory.content);
        pattern.confidence = Math.min(pattern.frequency / 10, 1);
        pattern.lastUpdated = new Date().toISOString();

        // Keep only recent examples
        pattern.examples = pattern.examples.slice(-5);
      }

      this.patterns.set(patternId, pattern);
    }
  }

  // Cleanup old and less important memories
  private async cleanupOldMemories(): Promise<void> {
    const memories = Array.from(this.memories.values());
    
    // Sort by score (importance + recency + access)
    memories.sort((a, b) => this.calculateMemoryScore(a) - this.calculateMemoryScore(b));

    // Remove bottom 20% of memories
    const toRemove = memories.slice(0, Math.floor(memories.length * 0.2));
    
    for (const memory of toRemove) {
      this.memories.delete(memory.id);
    }
  }

  // Generate unique memory ID
  private generateMemoryId(): string {
    return `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Learn from user interaction
  async learnFromInteraction(
    query: string, 
    response: string, 
    userFeedback?: 'positive' | 'negative' | 'neutral'
  ): Promise<void> {
    // Store conversation memory
    await this.storeMemory({
      type: 'conversation',
      content: `Q: ${query}\nA: ${response}`,
      context: { 
        domain: 'conversation',
        feedback: userFeedback,
        timestamp: new Date().toISOString()
      },
      importance: userFeedback === 'positive' ? 80 : userFeedback === 'negative' ? 90 : 60,
      tags: ['conversation', userFeedback || 'neutral']
    });

    // Update patterns based on successful interactions
    if (userFeedback === 'positive') {
      await this.updateLearningPatterns({
        id: '',
        type: 'conversation',
        content: query,
        context: {},
        importance: 70,
        accessCount: 0,
        lastAccessed: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        tags: ['successful-interaction'],
        relationships: []
      });
    }
  }

  // Get memory statistics
  getMemoryStats(): {
    totalMemories: number;
    memoryTypes: Record<string, number>;
    averageImportance: number;
    totalAccessCount: number;
    patternCount: number;
    contextHistorySize: number;
  } {
    const memories = Array.from(this.memories.values());
    const memoryTypes: Record<string, number> = {};
    
    let totalImportance = 0;
    let totalAccessCount = 0;

    for (const memory of memories) {
      memoryTypes[memory.type] = (memoryTypes[memory.type] || 0) + 1;
      totalImportance += memory.importance;
      totalAccessCount += memory.accessCount;
    }

    return {
      totalMemories: memories.length,
      memoryTypes,
      averageImportance: memories.length > 0 ? totalImportance / memories.length : 0,
      totalAccessCount,
      patternCount: this.patterns.size,
      contextHistorySize: this.contextHistory.length
    };
  }

  // Export memory system for backup
  exportMemorySystem(): {
    memories: MemoryItem[];
    patterns: LearningPattern[];
    contextHistory: Array<Record<string, any>>;
  } {
    return {
      memories: Array.from(this.memories.values()),
      patterns: Array.from(this.patterns.values()),
      contextHistory: [...this.contextHistory]
    };
  }

  // Import memory system from backup
  importMemorySystem(data: {
    memories: MemoryItem[];
    patterns: LearningPattern[];
    contextHistory: Array<Record<string, any>>;
  }): void {
    this.memories.clear();
    this.patterns.clear();
    this.contextHistory = [];

    for (const memory of data.memories) {
      this.memories.set(memory.id, memory);
    }

    for (const pattern of data.patterns) {
      this.patterns.set(pattern.id, pattern);
    }

    this.contextHistory = data.contextHistory;
  }

  // Clear all memories
  clearAllMemories(): void {
    this.memories.clear();
    this.patterns.clear();
    this.contextHistory = [];
  }

  // Get memory by ID
  getMemory(id: string): MemoryItem | undefined {
    return this.memories.get(id);
  }

  // Update memory importance
  updateMemoryImportance(id: string, importance: number): void {
    const memory = this.memories.get(id);
    if (memory) {
      memory.importance = Math.max(0, Math.min(100, importance));
      this.memories.set(id, memory);
    }
  }

  // Add memory relationship
  addMemoryRelationship(memoryId1: string, memoryId2: string): void {
    const memory1 = this.memories.get(memoryId1);
    const memory2 = this.memories.get(memoryId2);

    if (memory1 && memory2) {
      if (!memory1.relationships.includes(memoryId2)) {
        memory1.relationships.push(memoryId2);
      }
      if (!memory2.relationships.includes(memoryId1)) {
        memory2.relationships.push(memoryId1);
      }

      this.memories.set(memoryId1, memory1);
      this.memories.set(memoryId2, memory2);
    }
  }
}

// Export singleton instance
export const memorySystem = new AIMemorySystem();