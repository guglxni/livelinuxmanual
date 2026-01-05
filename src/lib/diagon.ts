// Diagon-inspired ASCII diagram generator
// Generates ASCII art for trees, tables, flowcharts, and sequences

export type DiagramType = 'tree' | 'table' | 'sequence' | 'flowchart' | 'math' | 'frame';

// Box drawing characters
const BOX = {
  h: '\u2500',  // horizontal
  v: '\u2502',  // vertical
  tl: '\u250C', // top-left
  tr: '\u2510', // top-right
  bl: '\u2514', // bottom-left
  br: '\u2518', // bottom-right
  t: '\u252C',  // top tee
  b: '\u2534',  // bottom tee
  l: '\u251C',  // left tee
  r: '\u2524',  // right tee
  x: '\u253C',  // cross
  hd: '\u2550', // double horizontal
  vd: '\u2551', // double vertical
};

// Generate tree diagram
export function generateTree(input: string): string {
  const lines = input.trim().split('\n');
  const result: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const indent = line.search(/\S/);
    const content = line.trim();
    
    if (indent === 0 || indent === -1) {
      result.push(content);
    } else {
      const level = Math.floor(indent / 2);
      const isLast = i === lines.length - 1 || 
        (lines[i + 1] && lines[i + 1].search(/\S/) <= indent && lines[i + 1].search(/\S/) !== -1);
      
      let prefix = '';
      for (let j = 0; j < level - 1; j++) {
        prefix += '\u2502   ';
      }
      prefix += isLast ? '\u2514\u2500\u2500 ' : '\u251C\u2500\u2500 ';
      result.push(prefix + content);
    }
  }
  
  return result.join('\n');
}

// Generate table diagram
export function generateTable(input: string): string {
  const rows = input.trim().split('\n').map(row => 
    row.split('|').map(cell => cell.trim()).filter(Boolean)
  );
  
  if (rows.length === 0) return '';
  
  // Calculate column widths
  const colWidths: number[] = [];
  rows.forEach(row => {
    row.forEach((cell, i) => {
      colWidths[i] = Math.max(colWidths[i] || 0, cell.length);
    });
  });
  
  const totalWidth = colWidths.reduce((a, b) => a + b, 0) + colWidths.length * 3 + 1;
  
  // Build table
  const result: string[] = [];
  
  // Top border
  result.push(BOX.tl + colWidths.map(w => BOX.h.repeat(w + 2)).join(BOX.t) + BOX.tr);
  
  rows.forEach((row, rowIdx) => {
    // Row content
    const cells = colWidths.map((w, i) => {
      const cell = row[i] || '';
      return ' ' + cell.padEnd(w) + ' ';
    });
    result.push(BOX.v + cells.join(BOX.v) + BOX.v);
    
    // Separator after header
    if (rowIdx === 0 && rows.length > 1) {
      result.push(BOX.l + colWidths.map(w => BOX.h.repeat(w + 2)).join(BOX.x) + BOX.r);
    }
  });
  
  // Bottom border
  result.push(BOX.bl + colWidths.map(w => BOX.h.repeat(w + 2)).join(BOX.b) + BOX.br);
  
  return result.join('\n');
}

// Generate sequence diagram
export function generateSequence(input: string): string {
  const lines = input.trim().split('\n');
  const actors: string[] = [];
  const messages: { from: string; to: string; msg: string }[] = [];
  
  lines.forEach(line => {
    const match = line.match(/(\w+)\s*->\s*(\w+)\s*:\s*(.+)/);
    if (match) {
      const [, from, to, msg] = match;
      if (!actors.includes(from)) actors.push(from);
      if (!actors.includes(to)) actors.push(to);
      messages.push({ from, to, msg });
    }
  });
  
  if (actors.length === 0) return input;
  
  const actorWidth = Math.max(...actors.map(a => a.length), 8);
  const spacing = 20;
  const result: string[] = [];
  
  // Actor headers
  const headerLine = actors.map(a => a.padStart((actorWidth + a.length) / 2).padEnd(actorWidth)).join(' '.repeat(spacing));
  result.push(headerLine);
  
  // Actor boxes
  const boxTop = actors.map(() => BOX.tl + BOX.h.repeat(actorWidth) + BOX.tr).join(' '.repeat(spacing - 2));
  const boxMid = actors.map(a => BOX.v + a.padStart((actorWidth + a.length) / 2).padEnd(actorWidth) + BOX.v).join(' '.repeat(spacing - 2));
  const boxBot = actors.map(() => BOX.bl + BOX.h.repeat(actorWidth) + BOX.br).join(' '.repeat(spacing - 2));
  
  result.push(boxTop);
  result.push(boxMid);
  result.push(boxBot);
  
  // Lifelines
  const lifelinePos = actors.map((_, i) => i * (actorWidth + spacing) + actorWidth / 2);
  
  // Messages
  messages.forEach(({ from, to, msg }) => {
    const fromIdx = actors.indexOf(from);
    const toIdx = actors.indexOf(to);
    const fromPos = lifelinePos[fromIdx];
    const toPos = lifelinePos[toIdx];
    
    // Lifeline
    let lifeline = ' '.repeat(Math.max(...lifelinePos) + 5);
    actors.forEach((_, i) => {
      const pos = lifelinePos[i];
      lifeline = lifeline.substring(0, pos) + BOX.v + lifeline.substring(pos + 1);
    });
    result.push(lifeline);
    
    // Arrow line
    const minPos = Math.min(fromPos, toPos);
    const maxPos = Math.max(fromPos, toPos);
    const arrowLen = maxPos - minPos;
    const arrow = fromIdx < toIdx 
      ? BOX.h.repeat(arrowLen - 1) + '>'
      : '<' + BOX.h.repeat(arrowLen - 1);
    
    let arrowLine = ' '.repeat(Math.max(...lifelinePos) + 5);
    arrowLine = arrowLine.substring(0, minPos) + arrow + arrowLine.substring(maxPos);
    
    // Add message label
    const labelPos = minPos + Math.floor(arrowLen / 2) - Math.floor(msg.length / 2);
    result.push(' '.repeat(labelPos) + msg);
    result.push(arrowLine);
  });
  
  // Final lifeline
  let lifeline = ' '.repeat(Math.max(...lifelinePos) + 5);
  actors.forEach((_, i) => {
    const pos = lifelinePos[i];
    lifeline = lifeline.substring(0, pos) + BOX.v + lifeline.substring(pos + 1);
  });
  result.push(lifeline);
  
  return result.join('\n');
}

// Generate framed text
export function generateFrame(input: string, title?: string): string {
  const lines = input.trim().split('\n');
  const maxLen = Math.max(...lines.map(l => l.length), title?.length || 0);
  const width = maxLen + 4;
  
  const result: string[] = [];
  
  if (title) {
    result.push(BOX.tl + BOX.h + ' ' + title + ' ' + BOX.h.repeat(width - title.length - 4) + BOX.tr);
  } else {
    result.push(BOX.tl + BOX.h.repeat(width - 2) + BOX.tr);
  }
  
  lines.forEach(line => {
    result.push(BOX.v + ' ' + line.padEnd(maxLen) + ' ' + BOX.v);
  });
  
  result.push(BOX.bl + BOX.h.repeat(width - 2) + BOX.br);
  
  return result.join('\n');
}

// Generate flowchart
export function generateFlowchart(input: string): string {
  const steps = input.trim().split('\n').map(s => s.trim()).filter(Boolean);
  const result: string[] = [];
  const maxLen = Math.max(...steps.map(s => s.length));
  const boxWidth = maxLen + 4;
  
  steps.forEach((step, i) => {
    // Box
    result.push(BOX.tl + BOX.h.repeat(boxWidth) + BOX.tr);
    result.push(BOX.v + ' ' + step.padEnd(maxLen + 2) + BOX.v);
    result.push(BOX.bl + BOX.h.repeat(boxWidth) + BOX.br);
    
    // Arrow to next
    if (i < steps.length - 1) {
      const mid = Math.floor(boxWidth / 2);
      result.push(' '.repeat(mid) + BOX.v);
      result.push(' '.repeat(mid) + 'v');
    }
  });
  
  return result.join('\n');
}

// Process memory layout diagram
export function generateMemoryLayout(): string {
  return `
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510  High Address
\u2502    argv, environ     \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502        Stack         \u2502  \u2193 grows down
\u2502      (local vars)    \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502                      \u2502
\u2502    (unallocated)     \u2502
\u2502                      \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502         Heap         \u2502  \u2191 grows up
\u2502   (malloc/free)      \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502  Uninitialized Data  \u2502
\u2502        (bss)         \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502   Initialized Data   \u2502
\u2502  (global/static)     \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502        Text          \u2502
\u2502   (program code)     \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518  Low Address`.trim();
}

// Fork/exec lifecycle diagram
export function generateForkExecDiagram(): string {
  return `
Parent Process          Child Process
      \u2502
      \u2502 fork()
      \u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
      \u2502                    \u2502
      \u2502              execve(prog)
      \u2502                    \u2502
      \u2502              [runs prog]
      \u2502                    \u2502
      \u2502               exit(status)
      \u2502                    \u2502
 wait(&status) <\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
      \u2502
      v`.trim();
}

// Signal flow diagram
export function generateSignalDiagram(): string {
  return `
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510     \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510     \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502   Signal    \u2502 \u2500\u2500\u2500> \u2502   Pending   \u2502 \u2500\u2500\u2500> \u2502  Delivered  \u2502
\u2502  Generated  \u2502     \u2502  (blocked)  \u2502     \u2502  (handler)  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518     \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518     \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
                             \u2502
                             v
                    \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
                    \u2502 Disposition \u2502
                    \u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
                    \u2502 - Default   \u2502
                    \u2502 - Ignore    \u2502
                    \u2502 - Handler   \u2502
                    \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`.trim();
}

// File descriptor table diagram
export function generateFDTableDiagram(): string {
  return `
Process FD Table          Open File Table         Inode Table
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510        \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510      \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 0: stdin   \u2502\u2500\u2500\u2500\u2500\u2500\u2500>\u2502 offset: 0    \u2502\u2500\u2500\u2500\u2500>\u2502 /dev/tty   \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524        \u2502 flags: R     \u2502      \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
\u2502 1: stdout  \u2502\u2500\u2500\u2500\u2500\u2500\u2500>\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524        \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510      \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 2: stderr  \u2502\u2500\u2500\u2500\u2500\u2500\u2500>\u2502 offset: 0    \u2502\u2500\u2500\u2500\u2500>\u2502 /dev/tty   \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524        \u2502 flags: W     \u2502      \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
\u2502 3: file    \u2502\u2500\u2500\u2500\u2500\u2500\u2500>\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518        \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510      \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
                 \u2514\u2500\u2500\u2500>\u2502 offset: 1024 \u2502\u2500\u2500\u2500\u2500>\u2502 data.txt   \u2502
                      \u2502 flags: RW    \u2502      \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
                      \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`.trim();
}

// Main diagram generator
export function generateDiagram(type: DiagramType, input: string, options?: { title?: string }): string {
  switch (type) {
    case 'tree':
      return generateTree(input);
    case 'table':
      return generateTable(input);
    case 'sequence':
      return generateSequence(input);
    case 'flowchart':
      return generateFlowchart(input);
    case 'frame':
      return generateFrame(input, options?.title);
    default:
      return input;
  }
}

// Wait status diagram
export function generateWaitStatusDiagram(): string {
  return `
Wait Status (16 bits)
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502  Normal exit:  | exit status |   0x00    \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502  Killed:       |    0x00     | signal #  \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502  Stopped:      | stop signal |   0x7F    \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502  Continued:    |   0xFFFF              \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518

Macros:
  WIFEXITED(s)   \u2192 (s & 0x7F) == 0
  WEXITSTATUS(s) \u2192 (s >> 8) & 0xFF
  WIFSIGNALED(s) \u2192 (s & 0x7F) != 0 && (s & 0x7F) != 0x7F
  WTERMSIG(s)    \u2192 s & 0x7F`.trim();
}

// Errno flow diagram
export function generateErrnoFlowDiagram(): string {
  return `
System Call Error Flow
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502  System Call  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
        \u2502
        v
   \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
   \u2502 Success? \u2502
   \u2514\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2518
        \u2502
   yes  \u2502  no
   \u250C\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2510
   \u2502         \u2502
   v         v
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2510  \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 >= 0 \u2502  \u2502 return -1 \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2518  \u2502 set errno \u2502
           \u2514\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2518
                 \u2502
                 v
           \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
           \u2502  Check    \u2502
           \u2502  errno    \u2502
           \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`.trim();
}

// Open flags diagram
export function generateOpenFlagsDiagram(): string {
  return `
open() flags argument
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 Access Mode (exactly one):              \u2502
\u2502   O_RDONLY  O_WRONLY  O_RDWR            \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502 Creation Flags (affect open() only):    \u2502
\u2502   O_CREAT   - create if not exists      \u2502
\u2502   O_EXCL    - fail if exists (w/CREAT)  \u2502
\u2502   O_TRUNC   - truncate to zero          \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502 Status Flags (affect I/O behavior):     \u2502
\u2502   O_APPEND    - append writes           \u2502
\u2502   O_NONBLOCK  - non-blocking I/O        \u2502
\u2502   O_SYNC      - synchronous writes      \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`.trim();
}

// Strace output diagram
export function generateStraceOutputDiagram(): string {
  return `
strace output format
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 open("/etc/passwd", O_RDONLY) = 3       \u2502
\u2502 \u2514\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2518 \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2518   \u2514\u252C\u2518       \u2502
\u2502       \u2502             \u2502          \u2502        \u2502
\u2502    syscall      arguments    return    \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502 On error:                               \u2502
\u2502 open("/nofile", O_RDONLY) = -1 ENOENT   \u2502
\u2502                             \u2514\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2518   \u2502
\u2502                              errno      \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`.trim();
}

// Pre-built diagrams for the curriculum
export const DIAGRAMS = {
  memoryLayout: generateMemoryLayout(),
  forkExec: generateForkExecDiagram(),
  signalFlow: generateSignalDiagram(),
  fdTable: generateFDTableDiagram(),
  waitStatus: generateWaitStatusDiagram(),
  errnoFlow: generateErrnoFlowDiagram(),
  openFlags: generateOpenFlagsDiagram(),
  straceOutput: generateStraceOutputDiagram(),
};

// Additional diagrams for comprehensive coverage

// Pipe diagram
export function generatePipeDiagram(): string {
  return `
Pipe Communication
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510     \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510     \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502   Writer    \u2502 \u2500\u2500\u2500> \u2502    Pipe     \u2502 \u2500\u2500\u2500> \u2502   Reader    \u2502
\u2502  Process    \u2502     \u2502   Buffer    \u2502     \u2502  Process    \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518     \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518     \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
     \u2502                   \u2502                   \u2502
  write(fd[1])      kernel buffer       read(fd[0])
     \u2502                   \u2502                   \u2502
     v                   v                   v
  fd[1] \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 fd[0]
  (write end)                          (read end)`.trim();
}

// Process states diagram
export function generateProcessStatesDiagram(): string {
  return `
Process States
                    \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
                    \u2502  Created  \u2502
                    \u2514\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2518
                          \u2502 fork()
                          v
                    \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
          \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524   Ready   \u2502<\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
          \u2502         \u2514\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2518          \u2502
          \u2502               \u2502 scheduled      \u2502
          \u2502               v                \u2502
          \u2502         \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510          \u2502
   SIGCONT\u2502         \u2502  Running  \u2502\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
          \u2502         \u2514\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2518  preempted
          \u2502               \u2502
          \u2502    \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
          \u2502    \u2502           \u2502           \u2502
          \u2502    v           v           v
          \u2502 \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510 \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510 \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
          \u2514\u2500\u2524Stopped\u2502 \u2502Sleeping\u2502 \u2502Terminated\u2502
            \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518 \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518 \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
            SIGSTOP    I/O wait    exit()`.trim();
}

// Dup2 redirection diagram
export function generateDup2Diagram(): string {
  return `
dup2(oldfd, newfd) - File Descriptor Redirection

Before dup2(3, 1):
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 FD Table   \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502 0: stdin   \u2502 \u2500\u2500> terminal
\u2502 1: stdout  \u2502 \u2500\u2500> terminal
\u2502 2: stderr  \u2502 \u2500\u2500> terminal
\u2502 3: file    \u2502 \u2500\u2500> output.txt
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518

After dup2(3, 1):
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 FD Table   \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502 0: stdin   \u2502 \u2500\u2500> terminal
\u2502 1: stdout  \u2502 \u2500\u2500> output.txt  (redirected!)
\u2502 2: stderr  \u2502 \u2500\u2500> terminal
\u2502 3: file    \u2502 \u2500\u2500> output.txt
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518

Now printf() writes to output.txt!`.trim();
}

// Signal mask diagram
export function generateSignalMaskDiagram(): string {
  return `
Signal Mask Operations

sigprocmask(how, &set, &oldset)

SIG_BLOCK:    mask = mask | set
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 mask:  [SIGINT]                        \u2502
\u2502 set:   [SIGTERM, SIGQUIT]              \u2502
\u2502 result:[SIGINT, SIGTERM, SIGQUIT]      \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518

SIG_UNBLOCK:  mask = mask & ~set
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 mask:  [SIGINT, SIGTERM, SIGQUIT]      \u2502
\u2502 set:   [SIGTERM]                       \u2502
\u2502 result:[SIGINT, SIGQUIT]               \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518

SIG_SETMASK:  mask = set
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 mask:  [anything]                      \u2502
\u2502 set:   [SIGINT]                        \u2502
\u2502 result:[SIGINT]                        \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`.trim();
}

// Extended diagrams object
export const EXTENDED_DIAGRAMS = {
  ...DIAGRAMS,
  pipe: generatePipeDiagram(),
  processStates: generateProcessStatesDiagram(),
  dup2: generateDup2Diagram(),
  signalMask: generateSignalMaskDiagram()
};
