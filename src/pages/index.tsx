import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Sidebar } from '../components/Sidebar';
import { LessonContent } from '../components/LessonContent';
import { ChatPanel } from '../components/ChatPanel';
import curriculum from '../../content/linux-curriculum.json';

export default function Home() {
  const [activeChapter, setActiveChapter] = useState(1);
  const [activeSection, setActiveSection] = useState('1.1');
  const [showChat, setShowChat] = useState(true);

  const chapters = curriculum.chapters.map((ch) => ({
    id: ch.id,
    title: ch.title,
    sections: ch.sections.map((s) => ({ id: s.id, title: s.title })),
  }));

  const currentChapter = curriculum.chapters.find((ch) => ch.id === activeChapter);
  const currentSection = currentChapter?.sections.find((s) => s.id === activeSection);

  const handleSelectSection = (chapterId: number, sectionId: string) => {
    setActiveChapter(chapterId);
    setActiveSection(sectionId);
  };

  // Build context for chat from current section
  const chatContext = currentSection
    ? `Current topic: ${currentChapter?.title} - ${currentSection.title}. Key concepts: ${currentSection.topics?.join(', ')}`
    : '';

  return (
    <Layout>
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          chapters={chapters}
          activeChapter={activeChapter}
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
        />

        {/* Main content */}
        <div className="flex-1 flex">
          <div className="flex-1 p-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 73px)' }}>
            {currentChapter && currentSection && (
              <LessonContent
                chapterId={currentChapter.id}
                chapterTitle={currentChapter.title}
                section={currentSection as any}
              />
            )}
          </div>

          {/* Chat panel */}
          {showChat && (
            <div className="w-96" style={{ height: 'calc(100vh - 73px)' }}>
              <ChatPanel context={chatContext} />
            </div>
          )}
        </div>

        {/* Chat toggle */}
        <button
          onClick={() => setShowChat(!showChat)}
          className="fixed bottom-6 right-6 w-12 h-12 bg-bauhaus-blue text-white flex items-center justify-center hover:bg-bauhaus-black transition-colors z-50"
          title={showChat ? 'Hide assistant' : 'Show assistant'}
        >
          {showChat ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          )}
        </button>
      </div>
    </Layout>
  );
}
