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
    <div className="min-h-screen bg-black text-lime-500 relative overflow-hidden">
      {/* Terminal Interface */}
      <div className="relative z-10 min-h-screen p-2 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto h-screen">
          <Terminal
            onCommand={onCommand}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
