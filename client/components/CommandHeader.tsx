import React from 'react';
import { cn } from '@/lib/utils';
import { useThemeState } from '@/hooks/use-theme';

interface CommandHeaderProps {
  onCommandClick: (command: string) => void;
  className?: string;
}

const commands = [
  { name: 'help', color: 'text-lime-500', description: 'Show commands' },
  { name: 'about', color: 'text-lime-500', description: 'About me' },
  { name: 'projects', color: 'text-lime-500', description: 'My projects' },
  { name: 'skills', color: 'text-lime-500', description: 'Tech skills' },
  { name: 'experience', color: 'text-lime-500', description: 'Work experience' },
  { name: 'education', color: 'text-lime-500', description: 'Education' },
  { name: 'resume', color: 'text-lime-500', description: 'Download resume' },
  { name: 'contact', color: 'text-lime-500', description: 'Contact info' },
  { name: 'chat', color: 'text-lime-500', description: 'AI chat' },
  { name: 'snake', color: 'text-lime-500', description: 'Snake game' },
  { name: 'python', color: 'text-lime-500', description: 'Python compiler' },
  { name: 'scrape', color: 'text-lime-500', description: 'Web scraper' }
];

export const CommandHeader: React.FC<CommandHeaderProps> = ({ onCommandClick, className }) => {
  const { theme } = useThemeState();

  return (
    <div className={cn(
      "border-b py-2.5 px-3 overflow-x-auto scrollbar-hide",
      theme === 'light'
        ? "bg-gray-50 border-gray-300"
        : "bg-black/90 border-lime-500/30",
      className
    )}>
      <div className="flex items-center gap-1 sm:gap-2 min-w-max">
        <span className={cn(
          "text-xs sm:text-sm font-mono mr-2 flex-shrink-0",
          theme === 'light' ? "text-blue-700" : "text-lime-500"
        )}>
          Commands:
        </span>
        {commands.map((cmd) => (
          <button
            key={cmd.name}
            onClick={() => onCommandClick(cmd.name)}
            className={cn(
              "px-2 py-1 rounded text-xs sm:text-sm font-mono",
              "border border-black hover:border-current/30",
              "transition-all duration-200 hover:bg-current/10",
              "cursor-pointer select-none whitespace-nowrap",
              cmd.color
            )}
            title={cmd.description}
          >
            {cmd.name}
          </button>
        ))}
      </div>
    </div>
  );
};
