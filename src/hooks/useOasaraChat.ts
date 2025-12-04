import { useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  timestamp: Date;
}

export interface ChatSource {
  type: string;
  name?: string;
  state?: string;
  title?: string;
  text: string;
  score: number;
}

interface AskResponse {
  answer: string;
  sources: ChatSource[];
  question: string;
}

const API_URL = process.env.REACT_APP_OASARA_API_URL || '/.netlify/functions/oasara-ask';

export function useOasaraChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (question: string) => {
    if (!question.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, k: 5 })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: AskResponse = await response.json();

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get response');

      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or explore our facilities map directly.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
}
