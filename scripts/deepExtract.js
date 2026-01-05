/**
 * Deep PDF Extraction with Multi-Pass VLM/LLM Analysis
 * Creates comprehensive knowledge graph through iterative reasoning
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
require('dotenv').config({ path: '.env.local' });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Models for different tasks - using available/affordable models
const MODELS = {
  reasoning: 'mistralai/mistral-7b-instruct', // Available in env
  fast: 'mistralai/mistral-7b-instruct',
  coding: 'mistralai/mistral-7b-instruct'
};

const CHUNK_SIZE = 8000; // Characters per chunk for LLM processing

async function callLLM(model, messages, temperature = 0.1) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://livelinuxmanual.dev',
      'X-Title': 'Live Linux Manual - Deep Extract'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 8192,
      temperature
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function extractPdfText() {
  console.log('Reading PDF...');
  const pdfPath = path.join(__dirname, '..', 'Linux_System_Programming_Essentials-mkerrisk_man7.org.pdf');
  const buffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(buffer);
  
  console.log(`Extracted ${data.numpages} pages, ${data.text.length} characters`);
  return data.text;
}

function chunkText(text, size = CHUNK_SIZE) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start + size;
    // Try to break at paragraph
    if (end < text.length) {
      const lastPara = text.lastIndexOf('\n\n', end);
      if (lastPara > start + size/2) end = lastPara;
    }
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}

async function pass1_ExtractStructure(text) {
  console.log('\n=== PASS 1: Extracting Document Structure ===');
  
  const prompt = `Analyze this Linux System Programming course material and extract the complete structure.

TEXT:
${text.slice(0, 30000)}

Return a JSON object with:
{
  "chapters": [
    {
      "number": 1,
      "title": "...",
      "pageRange": "1-1 to 1-18",
      "sections": [
        {"id": "1.1", "title": "...", "topics": ["..."]}
      ]
    }
  ],
  "totalSections": number,
  "mainTopics": ["File I/O", "Processes", etc]
}

Be thorough - extract EVERY chapter and section from the table of contents.`;

  const result = await callLLM(MODELS.fast, [{ role: 'user', content: prompt }]);
  
  try {
    const match = result.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch (e) {
    console.log('Structure extraction raw:', result.slice(0, 500));
    return null;
  }
}

async function pass2_ExtractConcepts(text, structure) {
  console.log('\n=== PASS 2: Deep Concept Extraction ===');
  
  const chunks = chunkText(text, 15000);
  const allConcepts = [];
  
  for (let i = 0; i < Math.min(chunks.length, 8); i++) {
    console.log(`  Processing chunk ${i + 1}/${Math.min(chunks.length, 8)}...`);
    
    const prompt = `You are an expert Linux systems programmer analyzing course material.

Extract ALL technical concepts, system calls, data structures, and programming patterns from this text.

TEXT CHUNK ${i + 1}:
${chunks[i]}

Return JSON:
{
  "systemCalls": [
    {
      "name": "open",
      "signature": "int open(const char *pathname, int flags, ...)",
      "returnType": "int (file descriptor or -1)",
      "parameters": [{"name": "pathname", "type": "const char*", "description": "..."}],
      "errors": ["ENOENT", "EACCES", ...],
      "description": "...",
      "manSection": 2,
      "example": "fd = open(\\"file.txt\\", O_RDONLY);",
      "relatedCalls": ["close", "read", "write"],
      "flags": [{"name": "O_RDONLY", "value": 0, "description": "..."}]
    }
  ],
  "dataTypes": [
    {"name": "pid_t", "underlying": "int", "purpose": "Process ID", "header": "<sys/types.h>"}
  ],
  "concepts": [
    {
      "name": "File Descriptor",
      "definition": "...",
      "keyPoints": ["..."],
      "commonMistakes": ["..."],
      "bestPractices": ["..."]
    }
  ],
  "codePatterns": [
    {
      "name": "Error checking pattern",
      "code": "if (fd == -1) { perror(\\"open\\"); exit(1); }",
      "explanation": "...",
      "whenToUse": "..."
    }
  ],
  "errorCodes": [
    {"name": "ENOENT", "number": 2, "meaning": "No such file or directory", "commonCauses": ["..."]}
  ]
}

Be EXHAUSTIVE. Extract every system call, every flag, every error code mentioned.`;

    try {
      const result = await callLLM(MODELS.fast, [{ role: 'user', content: prompt }]);
      const match = result.match(/\{[\s\S]*\}/);
      if (match) {
        allConcepts.push(JSON.parse(match[0]));
      }
    } catch (e) {
      console.log(`  Chunk ${i + 1} parse error:`, e.message);
    }
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 1000));
  }
  
  return mergeConcepts(allConcepts);
}

function mergeConcepts(conceptArrays) {
  const merged = {
    systemCalls: {},
    dataTypes: {},
    concepts: {},
    codePatterns: [],
    errorCodes: {}
  };
  
  for (const concepts of conceptArrays) {
    if (!concepts) continue;
    
    // Merge system calls
    for (const sc of concepts.systemCalls || []) {
      if (sc.name) {
        if (!merged.systemCalls[sc.name]) {
          merged.systemCalls[sc.name] = sc;
        } else {
          // Merge additional info
          const existing = merged.systemCalls[sc.name];
          existing.errors = [...new Set([...(existing.errors || []), ...(sc.errors || [])])];
          existing.relatedCalls = [...new Set([...(existing.relatedCalls || []), ...(sc.relatedCalls || [])])];
          if (sc.flags) existing.flags = [...(existing.flags || []), ...sc.flags];
        }
      }
    }
    
    // Merge data types
    for (const dt of concepts.dataTypes || []) {
      if (dt.name && !merged.dataTypes[dt.name]) {
        merged.dataTypes[dt.name] = dt;
      }
    }
    
    // Merge concepts
    for (const c of concepts.concepts || []) {
      if (c.name && !merged.concepts[c.name]) {
        merged.concepts[c.name] = c;
      }
    }
    
    // Merge code patterns
    merged.codePatterns.push(...(concepts.codePatterns || []));
    
    // Merge error codes
    for (const ec of concepts.errorCodes || []) {
      if (ec.name && !merged.errorCodes[ec.name]) {
        merged.errorCodes[ec.name] = ec;
      }
    }
  }
  
  return merged;
}

async function pass3_ExtractCodeExamples(text) {
  console.log('\n=== PASS 3: Code Example Extraction ===');
  
  // Find all code blocks in the text
  const codeRegex = /(#include[\s\S]*?(?:\n\n|\n(?=[A-Z])))|(\b(?:int|void|char|pid_t|ssize_t)\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?\n\})/g;
  const matches = text.match(codeRegex) || [];
  
  console.log(`  Found ${matches.length} potential code blocks`);
  
  const codeExamples = [];
  
  // Process in batches
  for (let i = 0; i < Math.min(matches.length, 20); i++) {
    const code = matches[i];
    if (code.length < 50) continue;
    
    const prompt = `Analyze this C code from a Linux system programming course:

\`\`\`c
${code.slice(0, 2000)}
\`\`\`

Return JSON:
{
  "title": "descriptive title",
  "purpose": "what this code demonstrates",
  "systemCalls": ["list of syscalls used"],
  "concepts": ["concepts demonstrated"],
  "lineByLine": [{"line": 1, "code": "...", "explanation": "..."}],
  "keyPoints": ["important things to note"],
  "commonErrors": ["mistakes beginners make"],
  "exercises": ["suggested modifications to try"]
}`;

    try {
      const result = await callLLM(MODELS.fast, [{ role: 'user', content: prompt }]);
      const match = result.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        parsed.code = code;
        codeExamples.push(parsed);
      }
    } catch (e) {
      // Skip parse errors
    }
    
    await new Promise(r => setTimeout(r, 500));
  }
  
  return codeExamples;
}

async function pass4_BuildKnowledgeGraph(concepts, codeExamples, structure) {
  console.log('\n=== PASS 4: Building Knowledge Graph ===');
  
  const graph = {
    nodes: [],
    edges: [],
    clusters: {},
    metadata: {
      createdAt: new Date().toISOString(),
      version: '2.0'
    }
  };
  
  // Create nodes for system calls
  for (const [name, sc] of Object.entries(concepts.systemCalls)) {
    graph.nodes.push({
      id: `syscall_${name}`,
      type: 'syscall',
      label: name,
      data: sc,
      cluster: sc.category || categorizeSystemCall(name)
    });
  }
  
  // Create nodes for concepts
  for (const [name, concept] of Object.entries(concepts.concepts)) {
    graph.nodes.push({
      id: `concept_${name.toLowerCase().replace(/\s+/g, '_')}`,
      type: 'concept',
      label: name,
      data: concept,
      cluster: 'concepts'
    });
  }
  
  // Create nodes for data types
  for (const [name, dt] of Object.entries(concepts.dataTypes)) {
    graph.nodes.push({
      id: `type_${name}`,
      type: 'datatype',
      label: name,
      data: dt,
      cluster: 'types'
    });
  }
  
  // Create nodes for error codes
  for (const [name, ec] of Object.entries(concepts.errorCodes)) {
    graph.nodes.push({
      id: `errno_${name}`,
      type: 'errno',
      label: name,
      data: ec,
      cluster: 'errors'
    });
  }
  
  // Create edges based on relationships
  for (const [name, sc] of Object.entries(concepts.systemCalls)) {
    // Related system calls
    for (const related of sc.relatedCalls || []) {
      if (concepts.systemCalls[related]) {
        graph.edges.push({
          source: `syscall_${name}`,
          target: `syscall_${related}`,
          type: 'related',
          weight: 1
        });
      }
    }
    
    // Error codes
    for (const err of sc.errors || []) {
      if (concepts.errorCodes[err]) {
        graph.edges.push({
          source: `syscall_${name}`,
          target: `errno_${err}`,
          type: 'can_return',
          weight: 0.5
        });
      }
    }
  }
  
  // Build clusters
  graph.clusters = {
    file_io: { label: 'File I/O', color: '#21409a', syscalls: [] },
    process: { label: 'Process Management', color: '#be1e2d', syscalls: [] },
    signals: { label: 'Signals', color: '#f9a825', syscalls: [] },
    memory: { label: 'Memory', color: '#4caf50', syscalls: [] },
    ipc: { label: 'IPC', color: '#9c27b0', syscalls: [] }
  };
  
  for (const node of graph.nodes) {
    if (node.type === 'syscall' && graph.clusters[node.cluster]) {
      graph.clusters[node.cluster].syscalls.push(node.label);
    }
  }
  
  return graph;
}

function categorizeSystemCall(name) {
  const categories = {
    file_io: ['open', 'close', 'read', 'write', 'lseek', 'dup', 'dup2', 'fcntl', 'stat', 'fstat', 'lstat'],
    process: ['fork', 'exec', 'execve', 'execl', 'execv', 'wait', 'waitpid', 'exit', '_exit', 'getpid', 'getppid'],
    signals: ['sigaction', 'signal', 'kill', 'sigprocmask', 'sigpending', 'sigsuspend', 'pause', 'alarm'],
    memory: ['mmap', 'munmap', 'brk', 'sbrk', 'mprotect'],
    ipc: ['pipe', 'mkfifo', 'socket', 'bind', 'listen', 'accept', 'connect']
  };
  
  for (const [cat, calls] of Object.entries(categories)) {
    if (calls.includes(name)) return cat;
  }
  return 'other';
}

async function pass5_GenerateLearningPaths(graph, structure) {
  console.log('\n=== PASS 5: Generating Learning Paths ===');
  
  const prompt = `Based on this Linux System Programming course structure, create optimal learning paths.

Course Structure:
${JSON.stringify(structure, null, 2).slice(0, 3000)}

Available System Calls: ${Object.keys(graph.nodes.filter(n => n.type === 'syscall').map(n => n.label)).join(', ')}

Create learning paths for different goals. Return JSON:
{
  "paths": {
    "fundamentals": {
      "title": "System Programming Fundamentals",
      "duration": "2 weeks",
      "prerequisites": [],
      "modules": [
        {
          "name": "Error Handling",
          "concepts": ["errno", "perror", "strerror"],
          "systemCalls": [],
          "exercises": ["Write error-checking wrapper functions"],
          "estimatedHours": 2
        }
      ]
    },
    "file_mastery": {
      "title": "File I/O Mastery",
      "duration": "1 week",
      "prerequisites": ["fundamentals"],
      "modules": [...]
    },
    "process_expert": {
      "title": "Process Management Expert",
      "duration": "2 weeks",
      "prerequisites": ["fundamentals", "file_mastery"],
      "modules": [...]
    },
    "signals_deep": {
      "title": "Signal Handling Deep Dive",
      "duration": "1 week",
      "prerequisites": ["process_expert"],
      "modules": [...]
    },
    "complete_course": {
      "title": "Complete Linux System Programming",
      "duration": "6 weeks",
      "prerequisites": [],
      "modules": [...]
    }
  },
  "skillTree": {
    "nodes": [
      {"id": "errno", "level": 1, "unlocks": ["file_io_basics"]},
      {"id": "file_io_basics", "level": 2, "unlocks": ["advanced_io", "process_basics"]}
    ]
  }
}`;

  try {
    const result = await callLLM(MODELS.fast, [{ role: 'user', content: prompt }]);
    const match = result.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch (e) {
    console.log('Learning paths error:', e.message);
    return null;
  }
}

async function pass6_GenerateExercises(concepts, codeExamples) {
  console.log('\n=== PASS 6: Generating Comprehensive Exercises ===');
  
  const syscallList = Object.keys(concepts.systemCalls).slice(0, 15).join(', ');
  
  const prompt = `Create comprehensive programming exercises for Linux system programming.

Available system calls to cover: ${syscallList}

Generate exercises at multiple difficulty levels. Return JSON:
{
  "exercises": [
    {
      "id": "ex_001",
      "title": "Implement cat command",
      "difficulty": "beginner",
      "estimatedTime": "30 minutes",
      "concepts": ["file descriptors", "read", "write"],
      "systemCalls": ["open", "read", "write", "close"],
      "description": "Implement a simplified version of the cat command...",
      "requirements": [
        "Read file specified as command-line argument",
        "Write contents to stdout",
        "Handle errors appropriately"
      ],
      "hints": [
        "Use a buffer of 4096 bytes for efficiency",
        "Remember read() may return fewer bytes than requested"
      ],
      "starterCode": "#include <fcntl.h>\\n#include <unistd.h>\\n...",
      "testCases": [
        {"input": "test.txt containing 'hello'", "expectedOutput": "hello"}
      ],
      "solution": "// Full solution code...",
      "commonMistakes": [
        "Not checking return value of open()",
        "Not handling partial reads"
      ],
      "extensions": [
        "Add support for multiple files",
        "Add line numbering with -n flag"
      ]
    }
  ],
  "projects": [
    {
      "id": "proj_001",
      "title": "Build a Simple Shell",
      "difficulty": "advanced",
      "estimatedTime": "4-6 hours",
      "description": "...",
      "milestones": [
        {"name": "Basic command execution", "concepts": ["fork", "exec", "wait"]},
        {"name": "Built-in commands", "concepts": ["cd", "exit"]},
        {"name": "I/O redirection", "concepts": ["dup2", "open"]},
        {"name": "Pipes", "concepts": ["pipe", "dup2"]}
      ]
    }
  ],
  "quizzes": [
    {
      "id": "quiz_001",
      "topic": "File Descriptors",
      "questions": [
        {
          "question": "What value does open() return on failure?",
          "options": ["0", "-1", "NULL", "errno"],
          "correct": 1,
          "explanation": "open() returns -1 on failure and sets errno"
        }
      ]
    }
  ]
}

Create at least 10 exercises, 3 projects, and 5 quizzes.`;

  try {
    const result = await callLLM(MODELS.fast, [{ role: 'user', content: prompt }]);
    const match = result.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch (e) {
    console.log('Exercise generation error:', e.message);
    return null;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('DEEP PDF EXTRACTION - Linux System Programming Essentials');
  console.log('='.repeat(60));
  
  // Extract raw text
  const text = await extractPdfText();
  
  // Pass 1: Structure
  const structure = await pass1_ExtractStructure(text);
  console.log('Structure:', structure ? 'OK' : 'FAILED');
  
  // Pass 2: Concepts
  const concepts = await pass2_ExtractConcepts(text, structure);
  console.log('Concepts extracted:', {
    systemCalls: Object.keys(concepts.systemCalls).length,
    dataTypes: Object.keys(concepts.dataTypes).length,
    concepts: Object.keys(concepts.concepts).length,
    errorCodes: Object.keys(concepts.errorCodes).length
  });
  
  // Pass 3: Code Examples
  const codeExamples = await pass3_ExtractCodeExamples(text);
  console.log('Code examples:', codeExamples.length);
  
  // Pass 4: Knowledge Graph
  const graph = await pass4_BuildKnowledgeGraph(concepts, codeExamples, structure);
  console.log('Graph nodes:', graph.nodes.length, 'edges:', graph.edges.length);
  
  // Pass 5: Learning Paths
  const learningPaths = await pass5_GenerateLearningPaths(graph, structure);
  console.log('Learning paths:', learningPaths ? 'OK' : 'FAILED');
  
  // Pass 6: Exercises
  const exercises = await pass6_GenerateExercises(concepts, codeExamples);
  console.log('Exercises:', exercises ? 'OK' : 'FAILED');
  
  // Compile final knowledge base
  const knowledgeBase = {
    metadata: {
      title: 'Linux System Programming Essentials',
      author: 'Michael Kerrisk',
      source: 'man7.org',
      extractedAt: new Date().toISOString(),
      extractionVersion: '2.0',
      passes: 6
    },
    structure,
    concepts,
    codeExamples,
    knowledgeGraph: graph,
    learningPaths,
    exercises
  };
  
  // Save everything
  const outputDir = path.join(__dirname, '..', 'content');
  
  fs.writeFileSync(
    path.join(outputDir, 'knowledge-base.json'),
    JSON.stringify(knowledgeBase, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'knowledge-graph.json'),
    JSON.stringify(graph, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'exercises.json'),
    JSON.stringify(exercises, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'learning-paths.json'),
    JSON.stringify(learningPaths, null, 2)
  );
  
  console.log('\n' + '='.repeat(60));
  console.log('EXTRACTION COMPLETE');
  console.log('='.repeat(60));
  console.log('Files saved to content/');
  
  return knowledgeBase;
}

main().catch(console.error);
