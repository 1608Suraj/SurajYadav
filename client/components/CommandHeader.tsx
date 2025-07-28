import React from 'react';
import { cn } from '@/lib/utils';

interface CommandHeaderProps {
  onCommandClick: (command: string) => void;
  className?: string;
}

const commands = [
  { name: 'help', color: 'text-green-400', description: 'Show commands' },
  { name: 'about', color: 'text-blue-400', description: 'About me' },
  { name: 'projects', color: 'text-purple-400', description: 'My projects' },
  { name: 'skills', color: 'text-yellow-400', description: 'Tech skills' },
  { name: 'experience', color: 'text-orange-400', description: 'Work experience' },
  { name: 'education', color: 'text-pink-400', description: 'Education' },
  { name: 'resume', color: 'text-red-400', description: 'Download resume' },
  { name: 'contact', color: 'text-cyan-400', description: 'Contact info' },
  { name: 'chat', color: 'text-emerald-400', description: 'AI chat' },
  { name: 'snake', color: 'text-lime-400', description: 'Snake game' },
  { name: 'python', color: 'text-indigo-400', description: 'Python compiler' },
  { name: 'scrape', color: 'text-teal-400', description: 'Web scraper' }
];

export const CommandHeader: React.FC<CommandHeaderProps> = ({ onCommandClick, className }) => {
  return (
    <div className={cn(
      "bg-black/90 border-b border-green-400/30 p-2 sm:p-3",
      "overflow-x-auto scrollbar-hide",
      className
    )}>
      <div className="flex items-center gap-1 sm:gap-2 min-w-max">
        <span className="text-green-400 text-xs sm:text-sm font-mono mr-2 flex-shrink-0">
          Commands:
        </span>
        {commands.map((cmd) => (
          <button
            key={cmd.name}
            onClick={() => onCommandClick(cmd.name)}
            className={cn(
              "px-2 py-1 rounded text-xs sm:text-sm font-mono",
              "border border-transparent hover:border-current/30",
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
