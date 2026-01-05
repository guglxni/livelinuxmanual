import React from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

// Simple syntax highlighting for C code
function highlightC(code: string): React.ReactNode[] {
  const keywords = ['int', 'char', 'void', 'if', 'else', 'while', 'for', 'return', 'switch', 'case', 'break', 'default', 'struct', 'const', 'static', 'extern', 'typedef', 'sizeof', 'NULL', 'true', 'false'];
  const types = ['pid_t', 'ssize_t', 'size_t', 'off_t', 'mode_t', 'sigset_t', 'FILE'];
  
  const lines = code.split('\n');
  
  return lines.map((line, lineIdx) => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;
    
    // Process comments
    const commentIdx = remaining.indexOf('//');
    const blockCommentIdx = remaining.indexOf('/*');
    
    if (commentIdx !== -1 && (blockCommentIdx === -1 || commentIdx < blockCommentIdx)) {
      const before = remaining.substring(0, commentIdx);
      const comment = remaining.substring(commentIdx);
      parts.push(<span key={key++}>{processTokens(before, keywords, types)}</span>);
      parts.push(<span key={key++} className="text-gray-500">{comment}</span>);
    } else if (blockCommentIdx !== -1) {
      const before = remaining.substring(0, blockCommentIdx);
      const endIdx = remaining.indexOf('*/', blockCommentIdx);
      if (endIdx !== -1) {
        const comment = remaining.substring(blockCommentIdx, endIdx + 2);
        const after = remaining.substring(endIdx + 2);
        parts.push(<span key={key++}>{processTokens(before, keywords, types)}</span>);
        parts.push(<span key={key++} className="text-gray-500">{comment}</span>);
        parts.push(<span key={key++}>{processTokens(after, keywords, types)}</span>);
      } else {
        parts.push(<span key={key++}>{processTokens(before, keywords, types)}</span>);
        parts.push(<span key={key++} className="text-gray-500">{remaining.substring(blockCommentIdx)}</span>);
      }
    } else {
      parts.push(<span key={key++}>{processTokens(remaining, keywords, types)}</span>);
    }
    
    return (
      <div key={lineIdx} className="leading-relaxed">
        {parts}
      </div>
    );
  });
}

function processTokens(text: string, keywords: string[], types: string[]): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  // Match strings, keywords, types, numbers, and function calls
  const regex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\w+\b|\d+)/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      result.push(<span key={key++}>{text.substring(lastIndex, match.index)}</span>);
    }
    
    const token = match[0];
    
    if (token.startsWith('"') || token.startsWith("'")) {
      result.push(<span key={key++} className="text-green-400">{token}</span>);
    } else if (keywords.includes(token)) {
      result.push(<span key={key++} className="text-red-400">{token}</span>);
    } else if (types.includes(token)) {
      result.push(<span key={key++} className="text-blue-400">{token}</span>);
    } else if (/^\d+$/.test(token)) {
      result.push(<span key={key++} className="text-orange-400">{token}</span>);
    } else if (text[match.index + token.length] === '(') {
      result.push(<span key={key++} className="text-yellow-400">{token}</span>);
    } else {
      result.push(<span key={key++}>{token}</span>);
    }
    
    lastIndex = match.index + token.length;
  }
  
  if (lastIndex < text.length) {
    result.push(<span key={key++}>{text.substring(lastIndex)}</span>);
  }
  
  return result;
}

export function CodeBlock({ code, language = 'c', title }: CodeBlockProps) {
  return (
    <div className="my-4">
      {title && (
        <div className="text-sm font-mono uppercase tracking-wider text-bauhaus-dark-gray mb-2">
          {title}
        </div>
      )}
      <div className="bg-bauhaus-black text-gray-200 p-4 overflow-x-auto border-l-4 border-l-bauhaus-blue font-mono text-sm">
        {language === 'c' ? highlightC(code) : <pre>{code}</pre>}
      </div>
    </div>
  );
}

export default CodeBlock;
