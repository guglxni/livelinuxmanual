import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Sidebar } from '../components/Sidebar';
import { LessonContent } from '../components/LessonContent';
import { ChatPanel } from '../components/ChatPanel';
import { ProgressDashboard } from '../components/ProgressDashboard';
import { markSectionComplete, updateSectionTime, getProgress } from '../lib/progress';
import curriculum from '../../content/linux-curriculum.json';

export default function Home() {
  const [activeChapter, setActiveChapter] = useState(1);
  const [activeSection, setActiveSection] = useState('1.1');
  const [showChat, setShowChat] = useState(true);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  // Track time spent on section
  useEffect(() => {
    const interval = setInterval(() => {
      updateSectionTime(activeSection, 10); // Update every 10 seconds
    }, 10000);
    
    return () => clearInterval(interval);
  }, [activeSection]);

  // Load completed sections
  useEffect(() => {
    const progress = getProgress();
    const completed = Object.keys(progress.sections).filter(id => progress.sections[id].completed);
    setCompletedSections(completed);
  }, []);

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

  const handleMarkComplete = () => {
    markSectionComplete(activeSection);
    setCompletedSections(prev => [...prev, activeSection]);
  };

  // Build context for chat from current section
  const chatContext = currentSection
    ? `Current topic: ${currentChapter?.title} - ${currentSection.title}. Key concepts: ${currentSection.topics?.join(', ')}`
    : '';

  return (
    <Layout title="Learn">
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
            {/* Progress bar at top */}
            <div className="mb-6">
              <ProgressDashboard compact />
            </div>
            
            {currentChapter && currentSection && (
              <>
                <LessonContent
                  chapterId={currentChapter.id}
                  chapterTitle={currentChapter.title}
                  section={currentSection as any}
                />
                
                {/* Mark complete button */}
                <div className="mt-8 pt-4 border-t-2 border-bauhaus-gray">
                  {!completedSections.includes(activeSection) ? (
                    <button
                      onClick={handleMarkComplete}
                      className="px-6 py-3 bg-bauhaus-blue text-white font-semibold uppercase tracking-wider hover:bg-bauhaus-black transition-colors"
                    >
                      Mark Section Complete
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <span className="font-semibold">Section Completed</span>
                    </div>
                  )}
                </div>
              </>
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
