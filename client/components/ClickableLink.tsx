import React from "react";

interface ClickableLinkProps {
  url: string;
  children: React.ReactNode;
  className?: string;
}

export const ClickableLink: React.FC<ClickableLinkProps> = ({
  url,
  children,
  className = "",
}) => {
  const handleClick = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <span
      onClick={handleClick}
      className={`cursor-pointer text-cyan-400 hover:text-cyan-300 underline hover:no-underline transition-colors ${className}`}
      title={`Click to open: ${url}`}
    >
      {children}
    </span>
  );
};
