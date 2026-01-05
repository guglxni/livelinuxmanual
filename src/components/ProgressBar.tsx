import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className="mb-4">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-mono uppercase tracking-wider text-bauhaus-dark-gray">
            {label}
          </span>
          <span className="text-xs font-mono">
            {current}/{total}
          </span>
        </div>
      )}
      <div className="h-2 bg-bauhaus-gray relative">
        <div
          className="h-full bg-bauhaus-blue transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
