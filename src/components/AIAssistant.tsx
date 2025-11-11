import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Brain, Send, Loader2, Zap, MessageSquare, TrendingUp } from 'lucide-react';
import { aiOrchestrator, AIRequest, AIResponse } from '@/ai/aiOrchestrator';
import { codeSplittingManager } from '@/utils/codeSplitting';

interface AIAssistantProps {
  className?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  confidence?: number;
  sources?: string[];
  reasoning?: string;
  followUpQuestions?: string[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ className }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStats, setAiStats] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize AI system
  useEffect(() => {
    const initializeAI = async () => {
      try {
        setIsLoading(true);
        await codeSplittingManager.preloadCriticalChunks();
        setIsInitialized(true);
        
        // Add welcome message
        setMessages([{
          id: 'welcome',
          type: 'ai',
          content: 'Hello! I\'m your AI assistant for market intelligence and business analysis. How can I help you today?',
          timestamp: new Date().toISOString(),
          confidence: 1.0
        }]);
        
        // Load AI stats
        const stats = aiOrchestrator.getAIStats();
        setAiStats(stats);
      } catch (error) {
        console.error('Failed to initialize AI:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAI();
  }, []);

  // Handle user input
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !isInitialized) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Determine request type based on input
      let requestType: AIRequest['type'] = 'query';
      if (input.toLowerCase().includes('analyze') || input.toLowerCase().includes('analysis')) {
        requestType = 'analysis';
      } else if (input.toLowerCase().includes('predict') || input.toLowerCase().includes('forecast')) {
        requestType = 'prediction';
      } else if (input.toLowerCase().includes('recommend') || input.toLowerCase().includes('suggest')) {
        requestType = 'recommendation';
      }

      const aiRequest: AIRequest = {
        type: requestType,
        context: {
          domain: 'jewelry',
          sessionId: 'current-session',
          userId: 'user-1'
        },
        query: input,
        priority: 'medium'
      };

      const aiResponse = await aiOrchestrator.processRequest(aiRequest);

      const aiMessage: ChatMessage = {
        id: aiResponse.id,
        type: 'ai',
        content: aiResponse.response,
        timestamp: aiResponse.timestamp,
        confidence: aiResponse.confidence,
        sources: aiResponse.sources,
        reasoning: aiResponse.reasoning,
        followUpQuestions: aiResponse.followUpQuestions
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update AI stats
      const stats = aiOrchestrator.getAIStats();
      setAiStats(stats);
    } catch (error) {
      console.error('AI request failed:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        confidence: 0.1
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isInitialized]);

  // Handle follow-up questions
  const handleFollowUp = useCallback((question: string) => {
    setInput(question);
  }, []);

  // Format confidence display
  const formatConfidence = (confidence?: number) => {
    if (!confidence) return null;
    const percentage = Math.round(confidence * 100);
    const color = percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <Badge className={`${color} text-white text-xs`}>
        {percentage}% confidence
      </Badge>
    );
  };

  if (!isInitialized) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Initializing AI Assistant...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} flex flex-col max-h-[600px]`}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Assistant
          </CardTitle>
          {aiStats && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>{aiStats.averageConfidence}% avg confidence</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col overflow-hidden">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 w-full min-h-0">
          <div className="space-y-4 pr-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  
                  {message.type === 'ai' && (
                    <div className="mt-2 space-y-2">
                      {message.confidence && (
                        <div className="flex items-center gap-2">
                          {formatConfidence(message.confidence)}
                        </div>
                      )}
                      
                      {message.reasoning && (
                        <p className="text-xs text-muted-foreground italic">
                          {message.reasoning}
                        </p>
                      )}
                      
                      {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium">Follow-up questions:</p>
                          {message.followUpQuestions.map((question, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs h-auto py-1 px-2 mr-2 mb-1"
                              onClick={() => handleFollowUp(question)}
                            >
                              {question}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 space-y-3 pt-2 border-t">
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about market trends, competitor analysis, or business insights..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>

          {/* AI Stats */}
          {aiStats && (
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{aiStats.totalRequests} requests</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{aiStats.memoryStats.totalMemories} memories</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{aiStats.insightCount} insights</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};