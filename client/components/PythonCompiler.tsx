import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface PythonCompilerProps {
  onClose: () => void;
  className?: string;
}

export const PythonCompiler: React.FC<PythonCompilerProps> = ({
  onClose,
  className,
}) => {
  const [code, setCode] = useState(
    '# Welcome to Python Terminal Compiler!\n# Type your Python code below and click Run\n\nprint("Hello, World!")\n',
  );
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Running...\n");

    try {
      // Simulate Python execution (in a real implementation, you'd use a Python runtime like Pyodide)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Basic Python interpreter simulation
      const result = simulatePythonExecution(code);
      setOutput(result);
    } catch (error) {
      setOutput(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsRunning(false);
    }
  };

  const simulatePythonExecution = (code: string): string => {
    const lines = code.split("\n");
    let output = "";
    let variables: { [key: string]: any } = {};
    let indentLevel = 0;
    let inLoop = false;
    let loopVar = "";
    let loopRange = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      const currentIndent = line.length - line.trimStart().length;

      // Skip comments and empty lines
      if (trimmedLine.startsWith("#") || !trimmedLine) continue;

      // Check if we're exiting a loop
      if (inLoop && currentIndent <= indentLevel) {
        inLoop = false;
        loopVar = "";
        loopRange = 0;
      }

      // Handle for loops
      if (trimmedLine.startsWith("for ")) {
        const forMatch = trimmedLine.match(
          /for\s+(\w+)\s+in\s+range\s*\(\s*(\d+)\s*\):/,
        );
        if (forMatch) {
          loopVar = forMatch[1];
          loopRange = parseInt(forMatch[2]);
          inLoop = true;
          indentLevel = currentIndent;
          continue; // Don't output anything for the for line itself
        }
      }

      // Handle print statements inside loops
      if (inLoop && currentIndent > indentLevel) {
        // Execute the print statement for each iteration
        for (let j = 0; j < loopRange; j++) {
          variables[loopVar] = j;

          // Handle f-string prints
          const fStringMatch = trimmedLine.match(
            /print\s*\(\s*f["'](.*?)["']\s*\)/,
          );
          if (fStringMatch) {
            let fString = fStringMatch[1];
            // Replace {variable} with actual values
            fString = fString.replace(/\{(\w+)\}/g, (match, varName) => {
              return variables[varName] !== undefined
                ? variables[varName]
                : match;
            });
            output += fString + "\n";
            continue;
          }

          // Handle regular print statements
          const printMatch = trimmedLine.match(
            /print\s*\(\s*["'](.*?)["']\s*\)/,
          );
          if (printMatch) {
            output += printMatch[1] + "\n";
          }
        }
        continue;
      }

      // Handle regular print statements (outside loops)
      if (!inLoop) {
        // Handle f-string prints
        const fStringMatch = trimmedLine.match(
          /print\s*\(\s*f["'](.*?)["']\s*\)/,
        );
        if (fStringMatch) {
          let fString = fStringMatch[1];
          fString = fString.replace(/\{(\w+)\}/g, (match, varName) => {
            return variables[varName] !== undefined
              ? variables[varName]
              : match;
          });
          output += fString + "\n";
          continue;
        }

        // Handle regular print statements
        const printMatch = trimmedLine.match(/print\s*\(\s*["'](.*?)["']\s*\)/);
        if (printMatch) {
          output += printMatch[1] + "\n";
          continue;
        }

        // Handle print with variables
        const printVarMatch = trimmedLine.match(/print\s*\(\s*([^"']+)\s*\)/);
        if (printVarMatch) {
          try {
            const expression = printVarMatch[1].trim();
            if (/^[\d\s+\-*/().]+$/.test(expression)) {
              const result = eval(expression);
              output += result + "\n";
            } else if (variables[expression]) {
              output += variables[expression] + "\n";
            } else {
              output += expression + "\n";
            }
          } catch {
            output += "Error: Invalid expression\n";
          }
          continue;
        }

        // Handle variable assignments
        const assignMatch = trimmedLine.match(/^(\w+)\s*=\s*(.+)$/);
        if (assignMatch && !trimmedLine.includes("==")) {
          const varName = assignMatch[1];
          const value = assignMatch[2];

          if (value.match(/^["'].*["']$/)) {
            variables[varName] = value.slice(1, -1);
          } else if (!isNaN(Number(value))) {
            variables[varName] = Number(value);
          } else {
            variables[varName] = value;
          }
          continue; // Don't output anything for assignments
        }

        // Handle data structures
        if (trimmedLine.includes("[") && trimmedLine.includes("]")) {
          output += `List created: ${trimmedLine}\n`;
          continue;
        }

        if (
          trimmedLine.includes("{") &&
          trimmedLine.includes("}") &&
          !trimmedLine.includes('f"')
        ) {
          output += `Dictionary created: ${trimmedLine}\n`;
          continue;
        }
      }
    }

    return output || "Code executed successfully (no output)";
  };

  const clearCode = () => {
    setCode("");
    setOutput("");
  };

  const loadExample = (example: string) => {
    switch (example) {
      case "hello":
        setCode('print("Hello, World!")\nprint("Welcome to Python!")\n');
        break;
      case "math":
        setCode(
          "# Math operations\nprint(2 + 3)\nprint(10 * 5)\nprint(100 / 4)\n",
        );
        break;
      case "loop":
        setCode(
          '# Loop example\nfor i in range(5):\n    print(f"Count: {i}")\n',
        );
        break;
      case "data":
        setCode(
          '# Data analysis example\nimport pandas as pd\n\n# Create sample data\ndata = {"name": ["Alice", "Bob"], "age": [25, 30]}\nprint("Sample data analysis:")\nprint(data)\n',
        );
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue =
          code.substring(0, start) + "    " + code.substring(end);
        setCode(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }, 0);
      }
    } else if (e.ctrlKey && e.key === "Enter") {
      runCode();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto p-4 space-y-4", className)}>
      <div className="flex items-center justify-between border-b border-green-400/30 pb-2">
        <h2 className="text-xl font-bold text-green-400 font-mono">
          🐍 Python Terminal Compiler
        </h2>
        <button
          onClick={onClose}
          className="text-red-400 hover:text-red-300 font-mono"
        >
          [ESC] Close
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <span className="text-gray-400 font-mono">Examples:</span>
        {[
          { key: "hello", label: "Hello World" },
          { key: "math", label: "Math" },
          { key: "loop", label: "Loop" },
          { key: "data", label: "Data" },
        ].map((example) => (
          <button
            key={example.key}
            onClick={() => loadExample(example.key)}
            className="px-2 py-1 text-xs border border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black transition-colors font-mono"
          >
            {example.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Code Editor */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-green-400 font-mono text-sm">
              Code Editor:
            </label>
            <button
              onClick={clearCode}
              className="text-xs text-gray-400 hover:text-gray-300 font-mono"
            >
              Clear
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-80 bg-black/80 border border-green-400/50 text-green-400 font-mono text-sm p-3 resize-none focus:outline-none focus:border-green-400"
            placeholder="Enter your Python code here..."
            spellCheck={false}
          />
          <div className="flex justify-between">
            <button
              onClick={runCode}
              disabled={isRunning}
              className="px-4 py-2 bg-green-600 text-black font-mono text-sm hover:bg-green-500 disabled:opacity-50 transition-colors"
            >
              {isRunning ? "Running..." : "Run Code [Ctrl+Enter]"}
            </button>
            <span className="text-xs text-gray-400 font-mono self-center">
              Lines: {code.split("\n").length}
            </span>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-green-400 font-mono text-sm">Output:</label>
          <div className="w-full h-80 bg-black/90 border border-green-400/50 text-gray-300 font-mono text-sm p-3 overflow-y-auto whitespace-pre-wrap">
            {output || "Output will appear here..."}
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-400 font-mono">
        <p>💡 Tips: Use Tab for indentation, Ctrl+Enter to run, ESC to close</p>
        <p>
          ⚠️ Note: This is a simulated Python environment for demonstration
          purposes
        </p>
      </div>
    </div>
  );
};
