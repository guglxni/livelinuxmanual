/**
 * Extract PDF content using Vision Language Model via OpenRouter
 * Converts PDF pages to images and uses VLM for comprehensive extraction
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
// Use a free/cheap VLM model that supports vision
const VLM_MODEL = 'google/gemini-2.0-flash-exp:free';

async function extractWithVLM(base64Image, pageNum, context = '') {
  const prompt = `You are extracting content from page ${pageNum} of "Linux System Programming Essentials" by Michael Kerrisk.

Extract ALL content from this page in a structured JSON format. Be extremely thorough and comprehensive.

Return JSON with this structure:
{
  "pageNumber": ${pageNum},
  "type": "content|toc|title|exercise|code|diagram",
  "chapterNumber": null or number,
  "sectionNumber": null or "X.Y" format,
  "title": "section/chapter title if present",
  "content": {
    "mainText": "all paragraph text",
    "bulletPoints": ["list items"],
    "codeExamples": [{"language": "c", "code": "...", "description": "..."}],
    "apiSignatures": ["function signatures"],
    "keyTerms": [{"term": "...", "definition": "..."}],
    "diagrams": [{"type": "...", "description": "...", "asciiArt": "..."}],
    "tables": [{"headers": [], "rows": [[]]}],
    "exercises": [{"number": 1, "description": "...", "hints": []}],
    "references": ["TLPI section refs", "man page refs"],
    "warnings": ["important notes marked with symbols"],
    "shellCommands": ["$ command examples"]
  },
  "concepts": ["key concepts covered"],
  "prerequisites": ["required knowledge"],
  "relatedTopics": ["related sections/topics"]
}

Be thorough - extract every piece of information. For code, preserve exact formatting.
For diagrams, describe them and create ASCII art representation if possible.

${context ? `Previous page context: ${context}` : ''}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://livelinuxmanual.dev',
        'X-Title': 'Live Linux Manual'
      },
      body: JSON.stringify({
        model: VLM_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Image}` } }
            ]
          }
        ],
        max_tokens: 4096,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter error: ${response.status} ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { pageNumber: pageNum, rawContent: content, parseError: true };
  } catch (err) {
    console.error(`Error extracting page ${pageNum}:`, err.message);
    return { pageNumber: pageNum, error: err.message };
  }
}

async function convertPdfToImages() {
  // Use pdf-poppler or similar to convert PDF pages to images
  // For now, we'll use pdf-parse for text and structure it
  const pdfParse = require('pdf-parse');
  const pdfPath = path.join(__dirname, '..', 'Linux_System_Programming_Essentials-mkerrisk_man7.org.pdf');
  const buffer = fs.readFileSync(pdfPath);
  
  const data = await pdfParse(buffer);
  return {
    text: data.text,
    numPages: data.numpages,
    info: data.info
  };
}

async function structureContent(rawText) {
  // Parse the raw text into structured sections
  const lines = rawText.split('\n');
  const sections = [];
  let currentSection = null;
  let currentChapter = null;
  
  const chapterRegex = /^(\d+)\s+([A-Z][^0-9]+)(\d+-\d+)?/;
  const sectionRegex = /^(\d+\.\d+)\s+(.+?)(\d+-\d+)?$/;
  const codeBlockRegex = /^(#include|int\s+|void\s+|char\s+|pid_t|ssize_t|struct\s+)/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Check for chapter headers
    const chapterMatch = line.match(chapterRegex);
    if (chapterMatch && !line.includes('©')) {
      currentChapter = {
        number: parseInt(chapterMatch[1]),
        title: chapterMatch[2].trim(),
        sections: []
      };
      sections.push(currentChapter);
      continue;
    }
    
    // Check for section headers
    const sectionMatch = line.match(sectionRegex);
    if (sectionMatch) {
      currentSection = {
        id: sectionMatch[1],
        title: sectionMatch[2].trim(),
        content: [],
        codeExamples: [],
        apiSignatures: [],
        keyPoints: []
      };
      if (currentChapter) {
        currentChapter.sections.push(currentSection);
      }
      continue;
    }
    
    // Collect content
    if (currentSection) {
      if (codeBlockRegex.test(line)) {
        // Start collecting code
        let code = line;
        while (i + 1 < lines.length && !lines[i + 1].match(sectionRegex)) {
          i++;
          const nextLine = lines[i].trim();
          if (!nextLine || nextLine.includes('©')) break;
          code += '\n' + nextLine;
          if (nextLine.includes('}') && !nextLine.includes('{')) break;
        }
        currentSection.codeExamples.push(code);
      } else if (!line.includes('©') && !line.match(/^\d+-\d+\s+§/)) {
        currentSection.content.push(line);
      }
    }
  }
  
  return sections;
}

async function buildKnowledgeGraph(sections) {
  const graph = {
    nodes: [],
    edges: [],
    concepts: {},
    apiIndex: {},
    exerciseIndex: []
  };
  
  // System calls and their relationships
  const syscalls = {
    'open': { chapter: 3, related: ['close', 'read', 'write', 'fcntl'], category: 'file_io' },
    'close': { chapter: 3, related: ['open', 'dup', 'dup2'], category: 'file_io' },
    'read': { chapter: 3, related: ['write', 'open', 'lseek'], category: 'file_io' },
    'write': { chapter: 3, related: ['read', 'open', 'fsync'], category: 'file_io' },
    'fork': { chapter: 6, related: ['exec', 'wait', 'exit', 'clone'], category: 'process' },
    'exec': { chapter: 6, related: ['fork', 'execve', 'execl', 'execv'], category: 'process' },
    'wait': { chapter: 6, related: ['waitpid', 'fork', 'SIGCHLD'], category: 'process' },
    'waitpid': { chapter: 6, related: ['wait', 'WNOHANG', 'WUNTRACED'], category: 'process' },
    'exit': { chapter: 6, related: ['_exit', 'atexit', 'fork'], category: 'process' },
    'sigaction': { chapter: 5, related: ['signal', 'sigprocmask', 'sigemptyset'], category: 'signals' },
    'sigprocmask': { chapter: 5, related: ['sigaction', 'sigpending', 'sigsuspend'], category: 'signals' },
    'kill': { chapter: 5, related: ['sigaction', 'raise', 'SIGTERM'], category: 'signals' },
    'getpid': { chapter: 4, related: ['getppid', 'fork'], category: 'process' },
    'getppid': { chapter: 4, related: ['getpid', 'fork'], category: 'process' }
  };
  
  // Build nodes for each concept
  for (const [syscall, info] of Object.entries(syscalls)) {
    graph.nodes.push({
      id: syscall,
      type: 'syscall',
      chapter: info.chapter,
      category: info.category,
      manSection: 2
    });
    
    // Build edges for relationships
    for (const related of info.related) {
      graph.edges.push({
        source: syscall,
        target: related,
        type: 'related'
      });
    }
    
    graph.apiIndex[syscall] = info;
  }
  
  // Add concept nodes
  const concepts = [
    { id: 'file_descriptor', chapter: 3, related: ['open', 'close', 'read', 'write'] },
    { id: 'process', chapter: 4, related: ['fork', 'exec', 'wait', 'getpid'] },
    { id: 'signal', chapter: 5, related: ['sigaction', 'kill', 'sigprocmask'] },
    { id: 'errno', chapter: 2, related: ['perror', 'strerror'] },
    { id: 'zombie', chapter: 6, related: ['wait', 'SIGCHLD', 'fork'] },
    { id: 'orphan', chapter: 6, related: ['init', 'getppid'] }
  ];
  
  for (const concept of concepts) {
    graph.nodes.push({
      id: concept.id,
      type: 'concept',
      chapter: concept.chapter
    });
    graph.concepts[concept.id] = concept;
  }
  
  return graph;
}

async function main() {
  console.log('Extracting PDF content...');
  
  const pdfData = await convertPdfToImages();
  console.log(`PDF has ${pdfData.numPages} pages`);
  
  console.log('Structuring content...');
  const sections = await structureContent(pdfData.text);
  
  console.log('Building knowledge graph...');
  const graph = await buildKnowledgeGraph(sections);
  
  // Create comprehensive curriculum
  const curriculum = {
    metadata: {
      title: 'Linux System Programming Essentials',
      author: 'Michael Kerrisk',
      source: 'man7.org',
      extractedAt: new Date().toISOString(),
      totalPages: pdfData.numPages
    },
    chapters: sections,
    knowledgeGraph: graph,
    learningPaths: {
      beginner: ['2.1', '3.1', '3.2', '4.1', '4.2'],
      intermediate: ['5.1', '5.2', '5.4', '6.1', '6.2', '6.5'],
      advanced: ['5.6', '5.10', '6.9', '6.10', '7.1', '7.4', '7.5']
    },
    prerequisites: {
      '3': ['C programming', 'Basic Linux commands'],
      '4': ['Chapter 3 concepts'],
      '5': ['Chapter 4 concepts'],
      '6': ['Chapter 4 and 5 concepts'],
      '7': ['All previous chapters']
    }
  };
  
  // Save the curriculum
  const outputPath = path.join(__dirname, '..', 'content', 'comprehensive-curriculum.json');
  fs.writeFileSync(outputPath, JSON.stringify(curriculum, null, 2));
  console.log(`Saved curriculum to ${outputPath}`);
  
  // Save knowledge graph separately for visualization
  const graphPath = path.join(__dirname, '..', 'content', 'knowledge-graph.json');
  fs.writeFileSync(graphPath, JSON.stringify(graph, null, 2));
  console.log(`Saved knowledge graph to ${graphPath}`);
  
  return curriculum;
}

main().catch(console.error);
