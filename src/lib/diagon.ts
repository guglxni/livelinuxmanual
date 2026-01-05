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

// Pre-built diagrams for the curriculum
export const DIAGRAMS = {
  memoryLayout: generateMemoryLayout(),
  forkExec: generateForkExecDiagram(),
  signalFlow: generateSignalDiagram(),
  fdTable: generateFDTableDiagram(),
};
