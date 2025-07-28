import { useState, useCallback } from 'react';

interface ChatResponse {
  response: string;
  error?: string;
}

export const useAIChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ChatResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      // Return a fallback message instead of throwing
      return `🤖 AI Chat Error

Sorry, I couldn't process your message right now: ${errorMessage}

You can still explore my portfolio using these commands:
• about - Learn about my background
• skills - View my technical skills
• projects - Explore my featured work
• contact - Get in touch directly

Please try again later!`;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
  };
};
