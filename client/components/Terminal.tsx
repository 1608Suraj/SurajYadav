import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'system';
  content: string;
  timestamp?: Date;
}

interface TerminalProps {
  className?: string;
  onCommand?: (command: string) => Promise<string>;
}

export const Terminal: React.FC<TerminalProps> = ({ className, onCommand }) => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Welcome message
  useEffect(() => {
    const welcomeLines: TerminalLine[] = [
      {
        id: 'welcome-1',
        type: 'system',
        content: '╭────────────────────────────────────────────���────────────────╮',
      },
      {
        id: 'welcome-2',
        type: 'system',
        content: '│  ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗  │',
      },
      {
        id: 'welcome-3',
        type: 'system',
        content: '│  ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗ │',
      },
      {
        id: 'welcome-4',
        type: 'system',
        content: '│     ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║ │',
      },
      {
        id: 'welcome-5',
        type: 'system',
        content: '│     ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║ │',
      },
      {
        id: 'welcome-6',
        type: 'system',
        content: '│     ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║ │',
      },
      {
        id: 'welcome-7',
        type: 'system',
        content: '│     ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ │',
      },
      {
        id: 'welcome-8',
        type: 'system',
        content: '╰─────────────────────────────────────────────────────────────╯',
      },
      {
        id: 'welcome-9',
        type: 'system',
        content: '',
      },
      {
        id: 'welcome-10',
        type: 'system',
        content: '🌟 Welcome to my AI-Powered Portfolio Terminal 🌟',
      },
      {
        id: 'welcome-11',
        type: 'system',
        content: '',
      },
      {
        id: 'welcome-12',
        type: 'system',
        content: 'Type "help" to see available commands or start exploring!',
      },
      {
        id: 'welcome-13',
        type: 'system',
        content: '',
      }
    ];

    // Simulate typing effect for welcome message
    setIsTyping(true);
    welcomeLines.forEach((line, index) => {
      setTimeout(() => {
        setLines(prev => [...prev, line]);
        if (index === welcomeLines.length - 1) {
          setIsTyping(false);
        }
      }, index * 200);
    });
  }, []);

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // Focus input when terminal is clicked
  useEffect(() => {
    const handleTerminalClick = () => {
      inputRef.current?.focus();
    };

    const terminal = terminalRef.current;
    if (terminal) {
      terminal.addEventListener('click', handleTerminalClick);
      return () => terminal.removeEventListener('click', handleTerminalClick);
    }
  }, []);

  const addLine = useCallback((content: string, type: TerminalLine['type'] = 'output') => {
    const newLine: TerminalLine = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: new Date()
    };
    setLines(prev => [...prev, newLine]);
  }, []);

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;

    // Add command to history
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    // Add command line to terminal
    addLine(`$ ${command}`, 'input');

    // Clear input
    setCurrentInput('');
    setIsProcessing(true);

    try {
      const response = onCommand ? await onCommand(command.trim()) : `Command not found: ${command}`;

      // Handle clear screen command
      if (response === 'CLEAR_SCREEN') {
        setLines([]);
        setIsTyping(false);
        setIsProcessing(false);
        return;
      }

      // Simulate typing effect for response
      setIsTyping(true);
      const lines = response.split('\n');

      for (let i = 0; i < lines.length; i++) {
        setTimeout(() => {
          addLine(lines[i], 'output');
          if (i === lines.length - 1) {
            setIsTyping(false);
          }
        }, i * 100);
      }
    } catch (error) {
      addLine('Error: Failed to process command', 'output');
      setIsTyping(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isProcessing && !isTyping) {
      handleCommand(currentInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // TODO: Implement command completion
    }
  };

  const renderLine = (line: TerminalLine) => {
    const baseClasses = "font-mono text-sm sm:text-base leading-relaxed break-words";

    switch (line.type) {
      case 'input':
        return (
          <div key={line.id} className={cn(baseClasses, "text-green-400 terminal-text-glow")}>
            {line.content}
          </div>
        );
      case 'output':
        return (
          <div key={line.id} className={cn(baseClasses, "text-gray-300")}>
            {line.content}
          </div>
        );
      case 'system':
        return (
          <div key={line.id} className={cn(baseClasses, "text-cyan-400 terminal-text-glow")}>
            {line.content}
          </div>
        );
      default:
        return (
          <div key={line.id} className={cn(baseClasses, "text-gray-300")}>
            {line.content}
          </div>
        );
    }
  };

  return (
    <div
      ref={terminalRef}
      className={cn(
        "bg-black/95 text-green-400 font-mono",
        "h-full w-full overflow-hidden flex flex-col",
        "border border-green-400/30 rounded-lg",
        "terminal-glow crt-effect",
        "text-sm sm:text-base",
        className
      )}
    >
      {/* Terminal Header */}
      <div className="bg-gray-900/90 px-3 sm:px-4 py-2 border-b border-green-400/30 flex items-center gap-2">
        <div className="flex gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></div>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div>
        </div>
        <div className="flex-1 text-center text-gray-400 text-xs sm:text-sm terminal-text-glow">
          <span className="hidden sm:inline">terminal@portfolio:~$ </span>
          <span className="sm:hidden">portfolio:~$ </span>
        </div>
        {/* Scan line effect */}
        <div className="scan-line"></div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 terminal-scroll">
        {lines.map(renderLine)}
        
        {/* Current Input Line */}
        {!isTyping && (
          <div className="flex items-center font-mono text-sm sm:text-base">
            <span className="text-green-400 mr-2 terminal-text-glow">$</span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              className="flex-1 bg-transparent border-none outline-none text-green-400 caret-green-400 terminal-text-glow placeholder:text-green-400/50"
              placeholder={isProcessing ? "Processing..." : "Type a command..."}
              autoFocus
            />
            <span className={cn(
              "w-2 h-4 sm:h-5 bg-green-400 ml-1 terminal-text-glow",
              cursorVisible ? "opacity-100" : "opacity-0",
              "transition-opacity duration-100"
            )}></span>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
