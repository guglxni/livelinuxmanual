import React from 'react';

interface Chapter {
  id: number;
  title: string;
  sections: { id: string; title: string }[];
}

interface SidebarProps {
  chapters: Chapter[];
  activeChapter: number;
  activeSection: string;
  onSelectSection: (chapterId: number, sectionId: string) => void;
}

export function Sidebar({ chapters, activeChapter, activeSection, onSelectSection }: SidebarProps) {
  return (
    <aside className="w-72 border-r-2 border-bauhaus-black min-h-screen bg-bauhaus-white">
      <div className="p-4">
        <div className="text-xs font-mono uppercase tracking-wider text-bauhaus-dark-gray mb-4">
          Curriculum
        </div>
        <nav>
          {chapters.map((chapter) => (
            <div key={chapter.id} className="mb-4">
              <div
                className={`flex items-center gap-2 py-2 cursor-pointer ${
                  activeChapter === chapter.id ? 'text-bauhaus-red' : ''
                }`}
                onClick={() => onSelectSection(chapter.id, chapter.sections[0]?.id || '')}
              >
                <ChapterMarker number={chapter.id} active={activeChapter === chapter.id} />
                <span className="font-semibold text-sm">{chapter.title}</span>
              </div>
              {activeChapter === chapter.id && (
                <div className="ml-8 border-l-2 border-bauhaus-gray">
                  {chapter.sections.map((section) => (
                    <div
                      key={section.id}
                      className={`py-1 px-3 text-sm cursor-pointer transition-colors ${
                        activeSection === section.id
                          ? 'border-l-2 border-bauhaus-red -ml-0.5 bg-bauhaus-gray font-medium'
                          : 'hover:bg-bauhaus-gray'
                      }`}
                      onClick={() => onSelectSection(chapter.id, section.id)}
                    >
                      {section.id} {section.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}

function ChapterMarker({ number, active }: { number: number; active: boolean }) {
  const colors = ['bg-bauhaus-red', 'bg-bauhaus-blue', 'bg-bauhaus-yellow', 'bg-bauhaus-black'];
  const colorIdx = (number - 1) % colors.length;
  
  return (
    <div
      className={`w-6 h-6 flex items-center justify-center text-xs font-bold ${
        active ? colors[colorIdx] + ' text-white' : 'border-2 border-bauhaus-black'
      }`}
    >
      {number}
    </div>
  );
}

export default Sidebar;
