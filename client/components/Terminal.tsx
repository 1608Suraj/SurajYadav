import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { CommandHeader } from './CommandHeader';
import { SnakeGame } from './SnakeGame';
import { PythonCompiler } from './PythonCompiler';

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

const executeCommand = (command: string, onCommand?: (command: string) => Promise<string>) => {
  if (onCommand) {
    return onCommand(command);
  }
  return Promise.resolve(`Command not found: ${command}`);
};

export const Terminal: React.FC<TerminalProps> = ({ className, onCommand }) => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [activeComponent, setActiveComponent] = useState<'terminal' | 'snake' | 'python'>('terminal');
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Welcome message
  useEffect(() => {
    const welcomeLines: TerminalLine[] = [
      {
        id: 'welcome-1',
        type: 'system',
        content: 'surajyadav@portfolio:~$ welcome',
      },
      {
        id: 'welcome-2',
        type: 'output',
        content: '',
      },
      {
        id: 'welcome-3',
        type: 'output',
        content: 'Hi, I\'m Suraj Yadav, a Data Analyst.',
      },
      {
        id: 'welcome-4',
        type: 'output',
        content: 'Welcome to my interactive "AI powered" portfolio terminal!',
      },
      {
        id: 'welcome-5',
        type: 'output',
        content: '',
      },
      {
        id: 'welcome-6',
        type: 'output',
        content: 'Type "help" to see available commands.',
      },
      {
        id: 'welcome-7',
        type: 'output',
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
          setShowInput(true);
        }
      }, index * 100); // 2x faster speed
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

  const handleGameEnd = useCallback((score: number) => {
    // Save high score
    const currentHigh = parseInt(localStorage.getItem('snakeHighScore') || '0');
    if (score > currentHigh) {
      localStorage.setItem('snakeHighScore', score.toString());
    }

    addLine(`Game Over! Final Score: ${score}`, 'output');
    addLine('', 'output');
    setActiveComponent('terminal');
    setShowInput(true);
  }, [addLine]);

  const handleCompilerClose = useCallback(() => {
    addLine('Python compiler closed.', 'output');
    addLine('', 'output');
    setActiveComponent('terminal');
    setShowInput(true);
  }, [addLine]);

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

      // Handle special components
      if (response === 'SNAKE_GAME_START') {
        setActiveComponent('snake');
        setIsTyping(false);
        setIsProcessing(false);
        return;
      }

      if (response === 'PYTHON_COMPILER_START') {
        setActiveComponent('python');
        setIsTyping(false);
        setIsProcessing(false);
        return;
      }

      // Simulate typing effect for response
      setIsTyping(true);
      setShowInput(false);
      const lines = response.split('\n');

      for (let i = 0; i < lines.length; i++) {
        setTimeout(() => {
          addLine(lines[i], 'output');
          if (i === lines.length - 1) {
            setIsTyping(false);
            setShowInput(true);
          }
        }, i * 50); // 2x faster speed
      }
    } catch (error) {
      addLine('Error: Failed to process command', 'output');
      setIsTyping(false);
      setShowInput(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHeaderCommand = useCallback(async (command: string) => {
    await handleCommand(command);
  }, []);

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
          <div key={line.id} className={cn(baseClasses, "text-lime-400 terminal-text-glow font-semibold")}>
            {line.content}
          </div>
        );
      case 'output':
        return (
          <div key={line.id} className={cn(baseClasses, "text-gray-200")}>
            {line.content}
          </div>
        );
      case 'system':
        return (
          <div key={line.id} className={cn(baseClasses, "text-cyan-300 terminal-text-glow")}>
            {line.content}
          </div>
        );
      default:
        return (
          <div key={line.id} className={cn(baseClasses, "text-gray-200")}>
            {line.content}
          </div>
        );
    }
  };

  return (
    <div
      ref={terminalRef}
      className={cn(
        "bg-black text-green-400 font-mono",
        "h-full w-full overflow-hidden flex flex-col",
        "border border-green-400/30 rounded-lg",
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
          <span className="hidden sm:inline">SurajYadav@portfolio</span>
          <span className="sm:hidden">portfolio:~$ </span>
        </div>
      </div>

      {/* Command Header */}
      <CommandHeader onCommandClick={handleHeaderCommand} />

      {/* Terminal Content */}
      <div className="flex-1 overflow-y-auto terminal-scroll scrollbar-hide">
        {activeComponent === 'terminal' && (
          <div className="p-3 sm:p-4 space-y-1">
            {lines.map(renderLine)}

            {/* Current Input Line */}
            {showInput && !isTyping && (
              <div className="flex items-center font-mono text-sm sm:text-base">
                <span className="text-lime-400 mr-2 terminal-text-glow">surajyadav@portfolio:~$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isProcessing}
                  className="flex-1 bg-transparent border-none outline-none text-lime-400 caret-lime-400 terminal-text-glow placeholder:text-lime-400/50 font-semibold"
                  placeholder={isProcessing ? "Processing..." : "type here"}
                  autoFocus
                />
                <span className={cn(
                  "w-2 h-4 sm:h-5 bg-lime-400 ml-1 terminal-text-glow",
                  cursorVisible ? "opacity-100" : "opacity-0",
                  "transition-opacity duration-100"
                )}></span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}

        {activeComponent === 'snake' && (
          <SnakeGame onGameEnd={handleGameEnd} className="w-full h-full flex items-center justify-center" />
        )}

        {activeComponent === 'python' && (
          <PythonCompiler onClose={handleCompilerClose} className="w-full h-full" />
        )}
      </div>
    </div>
  );
};
