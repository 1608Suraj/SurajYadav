import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CommandHeader } from "./CommandHeader";
import { SnakeGame } from "./SnakeGame";
import { PythonCompiler } from "./PythonCompiler";
import { useThemeState } from "@/hooks/use-theme";

interface TerminalLine {
  id: string;
  type: "input" | "output" | "system";
  content: string;
  timestamp?: Date;
}

interface TerminalProps {
  className?: string;
  onCommand?: (command: string) => Promise<string>;
}

const executeCommand = (
  command: string,
  onCommand?: (command: string) => Promise<string>,
) => {
  if (onCommand) {
    return onCommand(command);
  }
  return Promise.resolve(`Command not found: ${command}`);
};

export const Terminal: React.FC<TerminalProps> = ({ className, onCommand }) => {
  const { theme, toggleTheme } = useThemeState();
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [activeComponent, setActiveComponent] = useState<
    "terminal" | "snake" | "python"
  >("terminal");

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Welcome message
  useEffect(() => {
    // Only initialize welcome message if no lines exist
    if (lines.length === 0) {
      const welcomeLines: TerminalLine[] = [
        {
          id: `welcome-1-${Date.now()}`,
          type: "system",
          content: "surajyadav@portfolio:~$ welcome",
        },
        {
          id: `welcome-2-${Date.now()}`,
          type: "output",
          content: "",
        },
        {
          id: `welcome-3-${Date.now()}`,
          type: "output",
          content: "Hi, I'm Suraj Yadav, a Data Analyst.",
        },
        {
          id: `welcome-4-${Date.now()}`,
          type: "output",
          content: 'Welcome to my interactive "AI powered" portfolio terminal!',
        },
        {
          id: `welcome-5-${Date.now()}`,
          type: "output",
          content: "",
        },
        {
          id: `welcome-6-${Date.now()}`,
          type: "output",
          content: 'Type "help" to see available commands.',
        },
        {
          id: `welcome-7-${Date.now()}`,
          type: "output",
          content: "",
        },
      ];

      // Enhanced typewriter effect for welcome message
      setIsTyping(true);
      let currentLineIndex = 0;

      const typeWelcomeLines = () => {
        if (currentLineIndex >= welcomeLines.length) {
          setIsTyping(false);
          setShowInput(true);
          return;
        }

        const currentLine = welcomeLines[currentLineIndex];
        setLines((prev) => [...prev, currentLine]);
        currentLineIndex++;

        setTimeout(
          typeWelcomeLines,
          currentLine.content.length > 30 ? 200 : 300,
        );
      };

      typeWelcomeLines();
    }
  }, [lines.length]);

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  // Focus input when terminal is clicked
  useEffect(() => {
    const handleTerminalClick = () => {
      inputRef.current?.focus();
    };

    const terminal = terminalRef.current;
    if (terminal) {
      terminal.addEventListener("click", handleTerminalClick);
      return () => terminal.removeEventListener("click", handleTerminalClick);
    }
  }, []);

  const addLine = useCallback(
    (content: string, type: TerminalLine["type"] = "output") => {
      const newLine: TerminalLine = {
        id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        content,
        timestamp: new Date(),
      };
      setLines((prev) => [...prev, newLine]);
    },
    [],
  );

  const handleGameEnd = useCallback(
    (score: number) => {
      // Save high score
      const currentHigh = parseInt(
        localStorage.getItem("snakeHighScore") || "0",
      );
      if (score > currentHigh) {
        localStorage.setItem("snakeHighScore", score.toString());
      }

      addLine(`Game Over! Final Score: ${score}`, "output");
      addLine("", "output");
      setActiveComponent("terminal");
      setShowInput(true);
    },
    [addLine],
  );

  const handleCompilerClose = useCallback(() => {
    addLine("Python compiler closed.", "output");
    addLine("", "output");
    setActiveComponent("terminal");
    setShowInput(true);
  }, [addLine]);

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;

    // Add command to history
    setCommandHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);

    // Add command line to terminal
    addLine(`$ ${command}`, "input");

    // Clear input
    setCurrentInput("");
    setIsProcessing(true);

    try {
      const response = onCommand
        ? await onCommand(command.trim())
        : `Command not found: ${command}`;

      // Handle clear screen command
      if (response === "CLEAR_SCREEN") {
        setLines([]);
        setIsTyping(false);
        setIsProcessing(false);
        return;
      }

      // Handle special components
      if (response === "SNAKE_GAME_START") {
        setActiveComponent("snake");
        setIsTyping(false);
        setIsProcessing(false);
        return;
      }

      if (response === "PYTHON_COMPILER_START") {
        setActiveComponent("python");
        setIsTyping(false);
        setIsProcessing(false);
        return;
      }

      if (response === "TOGGLE_THEME") {
        toggleTheme();
        setIsTyping(false);
        setIsProcessing(false);
        addLine(
          `Theme switched to ${theme === "light" ? "dark" : "light"} mode`,
          "output",
        );
        return;
      }

      // Enhanced typewriter effect - character by character
      setIsTyping(true);
      setShowInput(false);
      const lines = response.split("\n");
      let currentLineIndex = 0;
      let currentCharIndex = 0;

      const typewriterEffect = () => {
        if (currentLineIndex >= lines.length) {
          setIsTyping(false);
          setShowInput(true);
          return;
        }

        const currentLine = lines[currentLineIndex];

        if (currentCharIndex === 0) {
          // Add empty line first
          addLine("", "output");
        }

        if (currentCharIndex <= currentLine.length) {
          const partialText = currentLine.substring(0, currentCharIndex);
          // Update the last line with partial text
          setLines((prev) => {
            const newLines = [...prev];
            if (newLines.length > 0) {
              newLines[newLines.length - 1] = {
                ...newLines[newLines.length - 1],
                content: partialText,
              };
            }
            return newLines;
          });

          currentCharIndex++;
          setTimeout(typewriterEffect, currentLine.length > 50 ? 15 : 25); // Faster for longer lines
        } else {
          // Move to next line
          currentLineIndex++;
          currentCharIndex = 0;
          setTimeout(typewriterEffect, 100); // Pause between lines
        }
      };

      typewriterEffect();
    } catch (error) {
      addLine("Error: Failed to process command", "output");
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
    if (e.key === "Enter" && !isProcessing && !isTyping) {
      handleCommand(currentInput);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput("");
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // TODO: Implement command completion
    }
  };

  const renderLine = (line: TerminalLine) => {
    const baseClasses = "font-mono text-sm sm:text-base leading-relaxed";

    // Check if content contains clickable links
    const hasClickableLinks = line.content.includes("CLICKABLE_LINK:");

    const renderContent = (content: string) => {
      if (!hasClickableLinks) {
        return content;
      }

      // Parse clickable links format: CLICKABLE_LINK:url:display_text
      const parts = content.split(/(CLICKABLE_LINK:[^:]+:[^:\n]+)/g);

      return parts.map((part, index) => {
        if (part.startsWith("CLICKABLE_LINK:")) {
          const linkParts = part.substring("CLICKABLE_LINK:".length);
          const colonIndex = linkParts.indexOf(":");
          if (colonIndex > 0) {
            const url = linkParts.substring(0, colonIndex);
            const displayText = linkParts.substring(colonIndex + 1);
            return (
              <span
                key={index}
                onClick={() => window.open(url, "_blank")}
                className="cursor-pointer text-cyan-400 hover:text-cyan-300 underline hover:no-underline transition-colors"
                title={`Click to open: ${url}`}
              >
                {displayText}
              </span>
            );
          }
        }
        return part;
      });
    };

    switch (line.type) {
      case "input":
        return (
          <div
            key={line.id}
            className={cn(
              baseClasses,
              "font-semibold mr-2",
              theme === "light"
                ? "text-black"
                : "text-lime-500 terminal-text-glow",
            )}
          >
            {renderContent(line.content)}
          </div>
        );
      case "output":
        return (
          <div
            key={line.id}
            className={cn(
              baseClasses,
              "break-words",
              theme === "light" ? "text-gray-700" : "text-white",
            )}
          >
            {renderContent(line.content)}
          </div>
        );
      case "system":
        return (
          <div
            key={line.id}
            className={cn(
              baseClasses,
              "mr-2",
              theme === "light"
                ? "text-black"
                : "text-blue-500 terminal-text-glow",
            )}
          >
            {renderContent(line.content)}
          </div>
        );
      default:
        return (
          <div
            key={line.id}
            className={cn(baseClasses, "text-gray-200 break-words")}
          >
            {renderContent(line.content)}
          </div>
        );
    }
  };

  return (
    <div
      ref={terminalRef}
      className={cn(
        theme === "light" ? "bg-white text-blue-700" : "bg-black text-lime-500",
        "font-mono h-full w-full overflow-hidden flex flex-col text-sm sm:text-base",
        className,
      )}
    >
      {/* Terminal Header */}
      <div
        className={cn(
          "px-3 sm:px-4 py-2 flex items-center gap-2",
          theme === "light" ? "bg-white" : "bg-black",
        )}
      >
        <div className="flex items-center gap-3">
          {/* SY Logo */}
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
              theme === "light" ? "bg-black text-white" : "bg-black text-white",
            )}
          >
            SY
          </div>
          <span
            className={cn(
              "font-semibold",
              theme === "light" ? "text-black" : "text-white",
            )}
          >
            Suraj Yadav
          </span>
        </div>

        <div className="flex-1 text-center flex flex-row items-center justify-center">
          <span
            className={cn(
              "text-xs sm:text-sm",
              theme === "light"
                ? "text-black"
                : "text-white terminal-text-glow",
            )}
          >
            surajyadav@portfolio:~$
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={cn(
              "text-xs px-2 py-1 rounded border transition-colors",
              theme === "light"
                ? "border-gray-300 text-gray-600 hover:bg-gray-50"
                : "border-lime-500/30 text-lime-500 hover:bg-lime-500/10",
            )}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                theme === "light" ? "bg-green-600" : "bg-lime-500",
              )}
            ></div>
            <span
              className={cn(
                "text-xs",
                theme === "light" ? "text-green-600" : "text-lime-500",
              )}
            >
              Connected
            </span>
          </div>
        </div>
      </div>

      {/* Command Header */}
      <CommandHeader onCommandClick={handleHeaderCommand} />

      {/* Terminal Content */}
      <div className="flex-1 overflow-y-auto terminal-scroll scrollbar-hide">
        {activeComponent === "terminal" && (
          <div className="p-3 sm:p-4 space-y-1">
            {lines.map(renderLine)}

            {/* Current Input Line */}
            {showInput && !isTyping && (
              <div className="flex items-center font-mono text-sm sm:text-base">
                <span
                  className={cn(
                    "mr-2",
                    theme === "light"
                      ? "text-black"
                      : "text-blue-500 terminal-text-glow",
                  )}
                >
                  surajyadav@portfolio:~$
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isProcessing}
                  className={cn(
                    "flex-1 bg-transparent border-none outline-none font-semibold",
                    theme === "light"
                      ? "text-red-600 caret-red-600 placeholder:text-red-600/50"
                      : "text-lime-500 caret-lime-500 terminal-text-glow placeholder:text-lime-500/50",
                  )}
                  placeholder={isProcessing ? "Processing..." : "type here"}
                  autoFocus
                />
                <span
                  className={cn(
                    "w-2 h-4 sm:h-5 ml-1",
                    theme === "light"
                      ? "bg-blue-700"
                      : "bg-lime-500 terminal-text-glow",
                    cursorVisible ? "opacity-100" : "opacity-0",
                    "transition-opacity duration-100",
                  )}
                ></span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}

        {activeComponent === "snake" && (
          <SnakeGame
            onGameEnd={handleGameEnd}
            className="w-full h-full flex items-center justify-center"
          />
        )}

        {activeComponent === "python" && (
          <PythonCompiler
            onClose={handleCompilerClose}
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  );
};
