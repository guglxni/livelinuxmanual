import React from 'react';
import { CodeBlock } from './CodeBlock';
import { AsciiDiagram } from './AsciiDiagram';
import { DIAGRAMS } from '../lib/diagon';

interface Section {
  id: string;
  title: string;
  topics?: string[];
  codeExamples?: { title: string; code: string }[];
  apiSummary?: string[];
  diagram?: { type: string; content: string };
}

interface LessonContentProps {
  chapterId: number;
  chapterTitle: string;
  section: Section;
}

export function LessonContent({ chapterId, chapterTitle, section }: LessonContentProps) {
  // Get relevant diagram based on section
  const getDiagram = () => {
    if (section.id === '4.2') return { content: DIAGRAMS.memoryLayout, title: 'Process Memory Layout' };
    if (section.id === '6.1' || section.id === '6.2') return { content: DIAGRAMS.forkExec, title: 'Fork/Exec Lifecycle' };
    if (section.id === '5.1' || section.id === '5.2') return { content: DIAGRAMS.signalFlow, title: 'Signal Flow' };
    if (section.id === '3.1') return { content: DIAGRAMS.fdTable, title: 'File Descriptor Table' };
    if (section.id === '3.2') return { content: DIAGRAMS.openFlags, title: 'open() Flags' };
    if (section.id === '2.1') return { content: DIAGRAMS.errnoFlow, title: 'Error Handling Flow' };
    if (section.id === '6.5') return { content: DIAGRAMS.waitStatus, title: 'Wait Status Encoding' };
    if (section.id === '7.1') return { content: DIAGRAMS.straceOutput, title: 'strace Output Format' };
    return null;
  };

  const diagram = getDiagram();

  return (
    <article className="max-w-4xl">
      {/* Chapter header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-bauhaus-red flex items-center justify-center text-white font-bold text-xl">
          {chapterId}
        </div>
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-bauhaus-dark-gray">
            Chapter {chapterId}
          </div>
          <h1 className="text-2xl font-bold">{chapterTitle}</h1>
        </div>
      </div>

      {/* Section header */}
      <div className="border-l-4 border-bauhaus-blue pl-4 mb-8">
        <div className="text-sm font-mono text-bauhaus-dark-gray">{section.id}</div>
        <h2 className="text-xl font-bold">{section.title}</h2>
      </div>

      {/* Topics */}
      {section.topics && section.topics.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-mono uppercase tracking-wider text-bauhaus-dark-gray mb-3">
            Key Concepts
          </h3>
          <ul className="space-y-2">
            {section.topics.map((topic, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-bauhaus-yellow mt-2 flex-shrink-0"></div>
                <span className="text-base leading-relaxed">{topic}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Diagram */}
      {diagram && (
        <AsciiDiagram
          content={diagram.content}
          title={diagram.title}
          accent="yellow"
        />
      )}

      {/* Code examples */}
      {section.codeExamples && section.codeExamples.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-mono uppercase tracking-wider text-bauhaus-dark-gray mb-3">
            Code Examples
          </h3>
          {section.codeExamples.map((example, idx) => (
            <CodeBlock key={idx} code={example.code} title={example.title} language="c" />
          ))}
        </div>
      )}

      {/* API Summary */}
      {section.apiSummary && section.apiSummary.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-mono uppercase tracking-wider text-bauhaus-dark-gray mb-3">
            API Reference
          </h3>
          <div className="bg-bauhaus-black text-bauhaus-white p-4 font-mono text-sm border-l-4 border-bauhaus-red">
            {section.apiSummary.map((api, idx) => (
              <div key={idx} className="mb-1 last:mb-0">
                {api}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 mt-8 border-t-2 border-bauhaus-gray">
        <button className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider hover:text-bauhaus-blue transition-colors">
          <span className="text-lg">&larr;</span> Previous
        </button>
        <button className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider hover:text-bauhaus-blue transition-colors">
          Next <span className="text-lg">&rarr;</span>
        </button>
      </div>
    </article>
  );
}

export default LessonContent;
