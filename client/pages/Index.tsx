import React, { useCallback } from 'react';
import { Terminal } from '@/components/Terminal';
import { Background3D } from '@/components/Background3D';
import { createCommands, handleCommand } from '@/lib/commands';
import { useAIChat } from '@/hooks/use-ai-chat';

export default function Index() {
  const { sendMessage } = useAIChat();

  // Create commands with AI integration
  const commands = createCommands(sendMessage);

  // Handle terminal commands
  const onCommand = useCallback(async (input: string): Promise<string> => {
    // Handle clear command specially
    if (input.toLowerCase() === 'clear') {
      // This will be handled by the Terminal component
      return 'CLEAR_SCREEN';
    }

    return await handleCommand(input, commands, sendMessage);
  }, [commands, sendMessage]);

  return (
    <div className="min-h-screen bg-black text-green-400 relative overflow-hidden">
      {/* 3D Animated Background */}
      <Background3D className="opacity-20" />
      
      {/* Terminal Interface */}
      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-6xl mx-auto h-screen">
          <Terminal 
            onCommand={onCommand}
            className="h-full"
          />
        </div>
      </div>

      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none -z-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-400/3 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
