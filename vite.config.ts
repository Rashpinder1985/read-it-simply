import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // AI/ML Core chunk
          if (id.includes('ai/vectorStore') || id.includes('ai/ragSystem') || 
              id.includes('ai/memorySystem') || id.includes('ai/aiOrchestrator')) {
            return 'ai-core';
          }
          // ML/Data Processing chunk
          if (id.includes('ml/competitorScorer') || id.includes('services/realTimeDataService') || 
              id.includes('services/sentimentAnalyzer')) {
            return 'ml-processing';
          }
          // UI Components chunk
          if (id.includes('components/ui/')) {
            return 'ui-components';
          }
          // Enhanced Features chunk
          if (id.includes('EnhancedMarketPulseModal') || id.includes('dataValidator')) {
            return 'enhanced-features';
          }
          // Utilities chunk
          if (id.includes('utils/codeSplitting') || id.includes('utils/logger')) {
            return 'utils';
          }
          // Vendor chunk for large dependencies
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'recharts',
      'lucide-react'
    ]
  }
}));
