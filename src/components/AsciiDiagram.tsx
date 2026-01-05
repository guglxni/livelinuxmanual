import React from 'react';

interface AsciiDiagramProps {
  content: string;
  title?: string;
  accent?: 'red' | 'blue' | 'yellow';
}

export function AsciiDiagram({ content, title, accent = 'yellow' }: AsciiDiagramProps) {
  const accentColors = {
    red: 'border-l-bauhaus-red',
    blue: 'border-l-bauhaus-blue',
    yellow: 'border-l-bauhaus-yellow',
  };

  return (
    <div className="my-4">
      {title && (
        <div className="text-sm font-mono uppercase tracking-wider text-bauhaus-dark-gray mb-2">
          {title}
        </div>
      )}
      <pre
        className={`font-mono text-sm leading-relaxed bg-bauhaus-black text-bauhaus-white p-4 overflow-x-auto border-l-4 ${accentColors[accent]}`}
      >
        {content}
      </pre>
    </div>
  );
}

export default AsciiDiagram;
