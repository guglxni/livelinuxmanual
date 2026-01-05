import React, { useState } from 'react';

interface TerminalProps {
  initialCommands?: string[];
  title?: string;
}

export function Terminal({ initialCommands = [], title = 'Terminal' }: TerminalProps) {
  const [history, setHistory] = useState<{ cmd: string; output: string }[]>(
    initialCommands.map(cmd => ({ cmd, output: '' }))
  );
  const [input, setInput] = useState('');

  // Simulated command outputs for demonstration
  const simulateCommand = (cmd: string): string => {
    const trimmed = cmd.trim();
    
    if (trimmed.startsWith('man ')) {
      const page = trimmed.replace('man ', '');
      return `${page.toUpperCase()}(2)                Linux Programmer's Manual

NAME
       ${page} - [description would appear here]

SYNOPSIS
       #include <appropriate_header.h>
       
       [function signature]

DESCRIPTION
       [Manual page content...]

RETURN VALUE
       [Return value description...]

SEE ALSO
       [Related manual pages...]`;
    }
    
    if (trimmed === 'ls') {
      return 'copy.c  ex.tee.c  Makefile  README';
    }
    
    if (trimmed.startsWith('cat ')) {
      return '/* File contents would appear here */';
    }
    
    if (trimmed.startsWith('gcc ')) {
      return '';
    }
    
    if (trimmed.startsWith('./')) {
      return '[Program output would appear here]';
    }
    
    if (trimmed.startsWith('strace ')) {
      return `execve("${trimmed.split(' ')[1]}", [...], [...]) = 0
brk(NULL)                               = 0x...
access("/etc/ld.so.preload", R_OK)      = -1 ENOENT
...
exit_group(0)                           = ?
+++ exited with 0 +++`;
    }
    
    if (trimmed === 'echo $?') {
      return '0';
    }
    
    return `bash: ${trimmed.split(' ')[0]}: command simulated`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const output = simulateCommand(input);
    setHistory([...history, { cmd: input, output }]);
    setInput('');
  };

  return (
    <div className="my-4">
      <div className="flex items-center gap-2 bg-bauhaus-dark-gray text-bauhaus-white px-3 py-2">
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-bauhaus-red"></div>
          <div className="w-3 h-3 rounded-full bg-bauhaus-yellow"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <span className="text-xs font-mono ml-2">{title}</span>
      </div>
      <div className="bg-bauhaus-black text-gray-200 p-4 font-mono text-sm max-h-80 overflow-y-auto">
        {history.map((item, idx) => (
          <div key={idx} className="mb-2">
            <div className="flex">
              <span className="text-green-400 mr-2">$</span>
              <span>{item.cmd}</span>
            </div>
            {item.output && (
              <pre className="text-gray-400 whitespace-pre-wrap mt-1 ml-4">{item.output}</pre>
            )}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="flex">
          <span className="text-green-400 mr-2">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-200"
            placeholder="Type a command..."
            autoFocus
          />
        </form>
      </div>
      <div className="text-xs text-bauhaus-dark-gray mt-1">
        Try: man open, ls, strace ./program, echo $?
      </div>
    </div>
  );
}

export default Terminal;
