// Code Splitting and Dynamic Import Utilities
// Implements intelligent chunking and lazy loading for optimal performance

import React from 'react';

export interface ChunkConfig {
  name: string;
  modules: string[];
  priority: 'high' | 'medium' | 'low';
  preload?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  progress: number;
  loadedChunks: string[];
}

class CodeSplittingManager {
  private loadedChunks: Set<string> = new Set();
  private loadingStates: Map<string, LoadingState> = new Map();
  private chunkConfigs: ChunkConfig[] = [];

  constructor() {
    this.initializeChunkConfigs();
  }

  // Initialize chunk configurations
  private initializeChunkConfigs(): void {
    this.chunkConfigs = [
      {
        name: 'ai-core',
        modules: ['ml/competitorScorer', 'ai/vectorStore', 'ai/ragSystem', 'ai/memorySystem'],
        priority: 'high',
        preload: true
      },
      {
        name: 'market-analysis',
        modules: ['components/EnhancedMarketPulseModal', 'services/realTimeDataService'],
        priority: 'high',
        preload: true
      },
      {
        name: 'sentiment-analysis',
        modules: ['services/sentimentAnalyzer', 'components/SentimentDashboard'],
        priority: 'medium',
        preload: false
      },
      {
        name: 'data-validation',
        modules: ['utils/dataValidator', 'services/dataQualityService'],
        priority: 'medium',
        preload: false
      },
      {
        name: 'visualizations',
        modules: ['components/charts', 'components/dashboards'],
        priority: 'low',
        preload: false
      }
    ];
  }

  // Dynamically import a module with error handling
  async dynamicImport<T>(modulePath: string): Promise<T> {
    try {
      const module = await import(modulePath);
      return module.default || module;
    } catch (error) {
      console.error(`Failed to load module ${modulePath}:`, error);
      throw new Error(`Module ${modulePath} failed to load: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Load a chunk with progress tracking
  async loadChunk(chunkName: string): Promise<LoadingState> {
    if (this.loadedChunks.has(chunkName)) {
      return {
        isLoading: false,
        error: null,
        progress: 100,
        loadedChunks: Array.from(this.loadedChunks)
      };
    }

    const config = this.chunkConfigs.find(c => c.name === chunkName);
    if (!config) {
      throw new Error(`Unknown chunk: ${chunkName}`);
    }

    const loadingState: LoadingState = {
      isLoading: true,
      error: null,
      progress: 0,
      loadedChunks: Array.from(this.loadedChunks)
    };

    this.loadingStates.set(chunkName, loadingState);

    try {
      const totalModules = config.modules.length;
      let loadedModules = 0;

      // Load modules in parallel with progress tracking
      const modulePromises = config.modules.map(async (module) => {
        try {
          await this.dynamicImport(`@/${module}`);
          loadedModules++;
          
          // Update progress
          loadingState.progress = Math.round((loadedModules / totalModules) * 100);
          this.loadingStates.set(chunkName, { ...loadingState });
          
          return module;
        } catch (error) {
          console.error(`Failed to load module ${module}:`, error);
          throw error;
        }
      });

      await Promise.all(modulePromises);

      // Mark chunk as loaded
      this.loadedChunks.add(chunkName);
      loadingState.isLoading = false;
      loadingState.progress = 100;
      loadingState.loadedChunks = Array.from(this.loadedChunks);

      this.loadingStates.set(chunkName, loadingState);

      return loadingState;
    } catch (error) {
      const errorState: LoadingState = {
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
        progress: loadingState.progress,
        loadedChunks: Array.from(this.loadedChunks)
      };

      this.loadingStates.set(chunkName, errorState);
      throw error;
    }
  }

  // Preload high-priority chunks
  async preloadCriticalChunks(): Promise<void> {
    const criticalChunks = this.chunkConfigs
      .filter(config => config.preload)
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    const preloadPromises = criticalChunks.map(async (config) => {
      try {
        await this.loadChunk(config.name);
        console.log(`Preloaded chunk: ${config.name}`);
      } catch (error) {
        console.warn(`Failed to preload chunk ${config.name}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  // Load chunk on demand with user interaction
  async loadOnDemand(chunkName: string): Promise<LoadingState> {
    return this.loadChunk(chunkName);
  }

  // Get loading state for a chunk
  getLoadingState(chunkName: string): LoadingState | undefined {
    return this.loadingStates.get(chunkName);
  }

  // Check if chunk is loaded
  isChunkLoaded(chunkName: string): boolean {
    return this.loadedChunks.has(chunkName);
  }

  // Get all loaded chunks
  getLoadedChunks(): string[] {
    return Array.from(this.loadedChunks);
  }

  // Get chunk statistics
  getChunkStats(): {
    totalChunks: number;
    loadedChunks: number;
    loadingChunks: number;
    failedChunks: number;
    averageProgress: number;
  } {
    const totalChunks = this.chunkConfigs.length;
    const loadedChunks = this.loadedChunks.size;
    const loadingStates = Array.from(this.loadingStates.values());
    
    const loadingChunks = loadingStates.filter(state => state.isLoading).length;
    const failedChunks = loadingStates.filter(state => state.error !== null).length;
    const averageProgress = loadingStates.length > 0 ? 
      loadingStates.reduce((sum, state) => sum + state.progress, 0) / loadingStates.length : 0;

    return {
      totalChunks,
      loadedChunks,
      loadingChunks,
      failedChunks,
      averageProgress: Math.round(averageProgress)
    };
  }

  // Create a lazy component wrapper
  createLazyComponent<T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ): React.LazyExoticComponent<T> {
    return React.lazy(importFn);
  }

  // Batch load multiple chunks
  async batchLoadChunks(chunkNames: string[]): Promise<Map<string, LoadingState>> {
    const results = new Map<string, LoadingState>();

    const loadPromises = chunkNames.map(async (chunkName) => {
      try {
        const state = await this.loadChunk(chunkName);
        results.set(chunkName, state);
      } catch (error) {
        results.set(chunkName, {
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
          progress: 0,
          loadedChunks: Array.from(this.loadedChunks)
        });
      }
    });

    await Promise.allSettled(loadPromises);
    return results;
  }

  // Unload unused chunks (for memory management)
  async unloadChunk(chunkName: string): Promise<void> {
    if (this.loadedChunks.has(chunkName)) {
      this.loadedChunks.delete(chunkName);
      this.loadingStates.delete(chunkName);
      
      // In a real implementation, you might want to trigger garbage collection
      // or remove module references here
      console.log(`Unloaded chunk: ${chunkName}`);
    }
  }

  // Get chunk dependencies
  getChunkDependencies(chunkName: string): string[] {
    const config = this.chunkConfigs.find(c => c.name === chunkName);
    return config ? config.modules : [];
  }

  // Optimize chunk loading based on user behavior
  async optimizeBasedOnUsage(usagePatterns: Record<string, number>): Promise<void> {
    // Sort chunks by usage frequency
    const sortedChunks = this.chunkConfigs
      .map(config => ({
        ...config,
        usage: usagePatterns[config.name] || 0
      }))
      .sort((a, b) => b.usage - a.usage);

    // Preload most used chunks
    const topChunks = sortedChunks.slice(0, 3);
    for (const chunk of topChunks) {
      if (!this.isChunkLoaded(chunk.name)) {
        try {
          await this.loadChunk(chunk.name);
        } catch (error) {
          console.warn(`Failed to optimize load chunk ${chunk.name}:`, error);
        }
      }
    }

    // Unload least used chunks
    const bottomChunks = sortedChunks.slice(-2);
    for (const chunk of bottomChunks) {
      if (this.isChunkLoaded(chunk.name) && chunk.usage === 0) {
        await this.unloadChunk(chunk.name);
      }
    }
  }

  // Create chunk loading hook for React components
  createChunkLoadingHook(chunkName: string) {
    return () => {
      const [loadingState, setLoadingState] = React.useState<LoadingState>({
        isLoading: false,
        error: null,
        progress: 0,
        loadedChunks: []
      });

      React.useEffect(() => {
        let isMounted = true;

        const loadChunk = async () => {
          try {
            setLoadingState(prev => ({ ...prev, isLoading: true, error: null }));
            const state = await this.loadChunk(chunkName);
            if (isMounted) {
              setLoadingState(state);
            }
          } catch (error) {
            if (isMounted) {
              setLoadingState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error : new Error('Unknown error')
              }));
            }
          }
        };

        loadChunk();

        return () => {
          isMounted = false;
        };
      }, [chunkName]);

      return loadingState;
    };
  }
}

// Export singleton instance
export const codeSplittingManager = new CodeSplittingManager();

// Utility functions for common dynamic imports
export const dynamicImports = {
  // AI/ML modules
  async loadMLScorer() {
    return codeSplittingManager.dynamicImport('@/ml/competitorScorer');
  },

  async loadVectorStore() {
    return codeSplittingManager.dynamicImport('@/ai/vectorStore');
  },

  async loadRAGSystem() {
    return codeSplittingManager.dynamicImport('@/ai/ragSystem');
  },

  async loadMemorySystem() {
    return codeSplittingManager.dynamicImport('@/ai/memorySystem');
  },

  // Service modules
  async loadRealTimeDataService() {
    return codeSplittingManager.dynamicImport('@/services/realTimeDataService');
  },

  async loadSentimentAnalyzer() {
    return codeSplittingManager.dynamicImport('@/services/sentimentAnalyzer');
  },

  async loadDataValidator() {
    return codeSplittingManager.dynamicImport('@/utils/dataValidator');
  },

  // Component modules
  async loadEnhancedMarketPulse() {
    return codeSplittingManager.dynamicImport('@/components/EnhancedMarketPulseModal');
  }
};