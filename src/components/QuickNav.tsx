import React from 'react';

interface QuickNavProps {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  currentLabel: string;
}

export function QuickNav({ onPrevious, onNext, hasPrevious, hasNext, currentLabel }: QuickNavProps) {
  return (
    <div className="flex items-center justify-between py-4 border-t-2 border-bauhaus-gray mt-8">
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider transition-colors ${
          hasPrevious ? 'hover:text-bauhaus-blue cursor-pointer' : 'opacity-30 cursor-not-allowed'
        }`}
      >
        <span className="text-lg">&larr;</span> Previous
      </button>
      
      <span className="text-xs font-mono text-bauhaus-dark-gray">
        {currentLabel}
      </span>
      
      <button
        onClick={onNext}
        disabled={!hasNext}
        className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider transition-colors ${
          hasNext ? 'hover:text-bauhaus-blue cursor-pointer' : 'opacity-30 cursor-not-allowed'
        }`}
      >
        Next <span className="text-lg">&rarr;</span>
      </button>
    </div>
  );
}

export default QuickNav;
