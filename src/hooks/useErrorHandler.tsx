import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export interface ErrorHandler {
  handleError: (error: unknown, context?: string) => void;
  handleAsyncError: <T = unknown>(promise: Promise<T>, context?: string) => Promise<T | null>;
}

export const useErrorHandler = (): ErrorHandler => {
  const { toast } = useToast();

  const handleError = useCallback((error: unknown, context?: string) => {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const title = context ? `Error in ${context}` : 'Error';
    
    toast({
      variant: 'destructive',
      title,
      description: errorMessage,
    });

    // Log error for debugging
    logger.error(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      context || 'unknown context',
      { error: error instanceof Error ? error.stack : String(error) }
    );
  }, [toast]);

  const handleAsyncError = useCallback(async <T = unknown>(
    promise: Promise<T>, 
    context?: string
  ): Promise<T | null> => {
    try {
      return await promise;
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [handleError]);

  return { handleError, handleAsyncError };
};