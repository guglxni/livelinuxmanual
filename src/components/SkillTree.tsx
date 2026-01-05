/**
 * Skill Tree Component
 * Visual representation of learning progress and concept mastery
 */
import React from 'react';
import { ConceptProgress } from '../lib/progress';

interface SkillNode {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  unlocks: string[];
  category: string;
  description: string;
}

interface SkillTreeProps {
  concepts: Record<string, ConceptProgress>;
  onConceptClick?: (conceptId: string) => void;
}

const SKILL_TREE: SkillNode[] = [
  // Fundamentals
  { id: 'errno', name: 'Error Handling', level: 0, maxLevel: 5, unlocks: ['open', 'fork'], category: 'fundamentals', description: 'Understanding errno and error checking' },
  { id: 'fd_basics', name: 'File Descriptors', level: 0, maxLevel: 5, unlocks: ['read', 'write'], category: 'fundamentals', description: 'Basic file descriptor concepts' },
  
  // File I/O
  { id: 'open', name: 'open()', level: 0, maxLevel: 5, unlocks: ['read', 'write', 'close'], category: 'file_io', description: 'Opening files and creating file descriptors' },
  { id: 'read', name: 'read()', level: 0, maxLevel: 5, unlocks: ['lseek', 'dup'], category: 'file_io', description: 'Reading data from file descriptors' },
  { id: 'write', name: 'write()', level: 0, maxLevel: 5, unlocks: ['lseek', 'dup'], category: 'file_io', description: 'Writing data to file descriptors' },
  { id: 'close', name: 'close()', level: 0, maxLevel: 5, unlocks: [], category: 'file_io', description: 'Closing file descriptors properly' },
  { id: 'lseek', name: 'lseek()', level: 0, maxLevel: 5, unlocks: [], category: 'file_io', description: 'Repositioning file offset' },
  { id: 'dup', name: 'dup/dup2()', level: 0, maxLevel: 5, unlocks: ['pipe'], category: 'file_io', description: 'Duplicating file descriptors' },
  
  // Process Management
  { id: 'fork', name: 'fork()', level: 0, maxLevel: 5, unlocks: ['exec', 'wait', 'getpid'], category: 'process', description: 'Creating child processes' },
  { id: 'exec', name: 'exec*()', level: 0, maxLevel: 5, unlocks: ['shell'], category: 'process', description: 'Executing new programs' },
  { id: 'wait', name: 'wait/waitpid()', level: 0, maxLevel: 5, unlocks: ['zombie', 'sigchld'], category: 'process', description: 'Waiting for child processes' },
  { id: 'exit', name: 'exit/_exit()', level: 0, maxLevel: 5, unlocks: [], category: 'process', description: 'Process termination' },
  { id: 'getpid', name: 'getpid/getppid()', level: 0, maxLevel: 5, unlocks: [], category: 'process', description: 'Process identification' },
  
  // Signals
  { id: 'sigaction', name: 'sigaction()', level: 0, maxLevel: 5, unlocks: ['sigprocmask', 'sigchld'], category: 'signals', description: 'Installing signal handlers' },
  { id: 'sigprocmask', name: 'sigprocmask()', level: 0, maxLevel: 5, unlocks: ['sigpending'], category: 'signals', description: 'Blocking and unblocking signals' },
  { id: 'kill', name: 'kill()', level: 0, maxLevel: 5, unlocks: [], category: 'signals', description: 'Sending signals to processes' },
  { id: 'sigpending', name: 'sigpending()', level: 0, maxLevel: 5, unlocks: [], category: 'signals', description: 'Examining pending signals' },
  
  // Advanced
  { id: 'zombie', name: 'Zombie Processes', level: 0, maxLevel: 5, unlocks: [], category: 'advanced', description: 'Understanding and preventing zombies' },
  { id: 'sigchld', name: 'SIGCHLD Handling', level: 0, maxLevel: 5, unlocks: [], category: 'advanced', description: 'Automatic child reaping' },
  { id: 'pipe', name: 'Pipes', level: 0, maxLevel: 5, unlocks: ['shell'], category: 'advanced', description: 'Inter-process communication' },
  { id: 'shell', name: 'Shell Implementation', level: 0, maxLevel: 5, unlocks: [], category: 'advanced', description: 'Building a command shell' }
];

const CATEGORY_COLORS: Record<string, string> = {
  fundamentals: '#4caf50',
  file_io: '#21409a',
  process: '#be1e2d',
  signals: '#f9a825',
  advanced: '#9c27b0'
};

const CATEGORY_LABELS: Record<string, string> = {
  fundamentals: 'Fundamentals',
  file_io: 'File I/O',
  process: 'Process Management',
  signals: 'Signals',
  advanced: 'Advanced Topics'
};

export function SkillTree({ concepts, onConceptClick }: SkillTreeProps) {
  const getSkillLevel = (skillId: string): number => {
    return concepts[skillId]?.level || 0;
  };

  const isUnlocked = (skill: SkillNode): boolean => {
    // Find skills that unlock this one
    const prerequisites = SKILL_TREE.filter(s => s.unlocks.includes(skill.id));
    if (prerequisites.length === 0) return true;
    
    // At least one prerequisite must be level 2+
    return prerequisites.some(p => getSkillLevel(p.id) >= 2);
  };

  const categories = [...new Set(SKILL_TREE.map(s => s.category))];

  return (
    <div className="border-2 border-bauhaus-black bg-bauhaus-white">
      <div className="p-3 border-b-2 border-bauhaus-black flex items-center gap-2">
        <div className="w-3 h-3 bg-bauhaus-red"></div>
        <span className="font-semibold text-sm uppercase tracking-wider">Skill Tree</span>
      </div>
      
      <div className="p-4 space-y-6">
        {categories.map(category => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="w-3 h-3" 
                style={{ backgroundColor: CATEGORY_COLORS[category] }}
              ></div>
              <span className="text-sm font-semibold uppercase tracking-wider">
                {CATEGORY_LABELS[category]}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 ml-5">
              {SKILL_TREE.filter(s => s.category === category).map(skill => {
                const level = getSkillLevel(skill.id);
                const unlocked = isUnlocked(skill);
                
                return (
                  <button
                    key={skill.id}
                    onClick={() => onConceptClick?.(skill.id)}
                    disabled={!unlocked}
                    className={`
                      p-3 text-left border-2 transition-all
                      ${unlocked 
                        ? 'border-bauhaus-black hover:bg-bauhaus-gray cursor-pointer' 
                        : 'border-bauhaus-gray opacity-50 cursor-not-allowed'}
                      ${level >= skill.maxLevel ? 'bg-bauhaus-yellow' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm font-semibold">{skill.name}</span>
                      <span className="text-xs font-mono">
                        {level}/{skill.maxLevel}
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="h-2 bg-bauhaus-gray flex">
                      {Array.from({ length: skill.maxLevel }).map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 ${i < level ? '' : ''}`}
                          style={{
                            backgroundColor: i < level ? CATEGORY_COLORS[category] : 'transparent',
                            borderRight: i < skill.maxLevel - 1 ? '1px solid #fafafa' : 'none'
                          }}
                        />
                      ))}
                    </div>
                    
                    <p className="text-xs text-bauhaus-dark-gray mt-1 line-clamp-1">
                      {skill.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="p-3 border-t-2 border-bauhaus-black bg-bauhaus-gray">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-bauhaus-black"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-bauhaus-gray opacity-50"></div>
            <span>Locked</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-bauhaus-yellow border-2 border-bauhaus-black"></div>
            <span>Mastered</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillTree;
