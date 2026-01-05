/**
 * Learning Dashboard Page
 * Central hub for tracking progress, reviewing concepts, and exploring the knowledge graph
 */
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { ProgressDashboard } from '../components/ProgressDashboard';
import { SkillTree } from '../components/SkillTree';
import { QuickQuiz } from '../components/QuickQuiz';
import { KnowledgeGraph } from '../components/KnowledgeGraph';
import { getProgress, getConceptsForReview, ConceptProgress } from '../lib/progress';
import knowledgeBase from '../../content/knowledge-base.json';

type TabType = 'overview' | 'skills' | 'quiz' | 'graph';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [concepts, setConcepts] = useState<Record<string, ConceptProgress>>({});
  const [dueForReview, setDueForReview] = useState<ConceptProgress[]>([]);

  useEffect(() => {
    const progress = getProgress();
    setConcepts(progress.concepts);
    setDueForReview(getConceptsForReview());
  }, []);

  // Prepare graph data from knowledge base
  const graphNodes = knowledgeBase.knowledgeGraph?.nodes || [];
  const graphEdges = knowledgeBase.knowledgeGraph?.edges || [];

  const tabs: { id: TabType; label: string; color: string }[] = [
    { id: 'overview', label: 'Overview', color: 'bg-bauhaus-blue' },
    { id: 'skills', label: 'Skill Tree', color: 'bg-bauhaus-red' },
    { id: 'quiz', label: 'Practice', color: 'bg-bauhaus-yellow' },
    { id: 'graph', label: 'Knowledge Graph', color: 'bg-bauhaus-black' }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-bauhaus-white">
        {/* Header */}
        <div className="border-b-4 border-bauhaus-black p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">Learning Dashboard</h1>
            <p className="text-bauhaus-dark-gray">
              Track your progress, practice concepts, and explore the knowledge graph
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b-2 border-bauhaus-black">
          <div className="max-w-6xl mx-auto flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-6 py-3 font-semibold text-sm uppercase tracking-wider
                  border-r-2 border-bauhaus-black last:border-r-0
                  transition-colors
                  ${activeTab === tab.id 
                    ? `${tab.color} ${tab.id === 'quiz' ? 'text-bauhaus-black' : 'text-white'}` 
                    : 'hover:bg-bauhaus-gray'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main progress */}
              <div className="lg:col-span-2">
                <ProgressDashboard />
              </div>

              {/* Due for review */}
              <div className="border-2 border-bauhaus-black bg-bauhaus-white">
                <div className="p-3 border-b-2 border-bauhaus-black flex items-center gap-2">
                  <div className="w-3 h-3 bg-bauhaus-yellow"></div>
                  <span className="font-semibold text-sm uppercase tracking-wider">
                    Due for Review
                  </span>
                </div>
                <div className="p-4">
                  {dueForReview.length === 0 ? (
                    <p className="text-bauhaus-dark-gray text-sm">
                      No concepts due for review. Keep learning!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {dueForReview.slice(0, 5).map(concept => (
                        <div 
                          key={concept.id}
                          className="flex items-center justify-between p-2 bg-bauhaus-gray"
                        >
                          <span className="font-mono text-sm">{concept.name}</span>
                          <span className="text-xs text-bauhaus-dark-gray">
                            Level {concept.level}
                          </span>
                        </div>
                      ))}
                      {dueForReview.length > 5 && (
                        <p className="text-xs text-bauhaus-dark-gray text-center">
                          +{dueForReview.length - 5} more
                        </p>
                      )}
                    </div>
                  )}
                  
                  {dueForReview.length > 0 && (
                    <button
                      onClick={() => setActiveTab('quiz')}
                      className="mt-4 w-full py-2 bg-bauhaus-black text-white font-semibold text-sm uppercase tracking-wider hover:bg-bauhaus-blue transition-colors"
                    >
                      Start Review
                    </button>
                  )}
                </div>
              </div>

              {/* Quick stats cards */}
              <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickStatCard
                  title="System Calls"
                  value={Object.keys(knowledgeBase.systemCalls || {}).length}
                  description="Documented"
                  color="blue"
                />
                <QuickStatCard
                  title="Concepts"
                  value={Object.keys(knowledgeBase.concepts || {}).length}
                  description="To master"
                  color="red"
                />
                <QuickStatCard
                  title="Error Codes"
                  value={Object.keys(knowledgeBase.errorCodes || {}).length}
                  description="Explained"
                  color="yellow"
                />
                <QuickStatCard
                  title="Exercises"
                  value={
                    (knowledgeBase.exercises?.beginner?.length || 0) +
                    (knowledgeBase.exercises?.intermediate?.length || 0) +
                    (knowledgeBase.exercises?.advanced?.length || 0)
                  }
                  description="Available"
                  color="black"
                />
              </div>

              {/* Recent chapters */}
              <div className="lg:col-span-3 border-2 border-bauhaus-black bg-bauhaus-white">
                <div className="p-3 border-b-2 border-bauhaus-black flex items-center gap-2">
                  <div className="w-3 h-3 bg-bauhaus-red"></div>
                  <span className="font-semibold text-sm uppercase tracking-wider">
                    Course Chapters
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
                  {(knowledgeBase.chapters || []).map((chapter: any, idx: number) => (
                    <a
                      key={chapter.id}
                      href={`/?chapter=${chapter.id}`}
                      className={`
                        p-4 border-r-2 border-b-2 border-bauhaus-black last:border-r-0
                        hover:bg-bauhaus-gray transition-colors
                        ${idx % 4 === 3 ? 'border-r-0' : ''}
                      `}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`
                          w-6 h-6 flex items-center justify-center text-xs font-bold text-white
                          ${['bg-bauhaus-red', 'bg-bauhaus-blue', 'bg-bauhaus-yellow text-black', 'bg-bauhaus-black'][idx % 4]}
                        `}>
                          {chapter.id}
                        </div>
                        <span className="font-semibold text-sm">{chapter.title}</span>
                      </div>
                      <p className="text-xs text-bauhaus-dark-gray">
                        {chapter.sections?.length || 0} sections
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SkillTree 
                  concepts={concepts}
                  onConceptClick={(id) => console.log('Clicked:', id)}
                />
              </div>
              <div>
                <ProgressDashboard compact />
                <div className="mt-4">
                  <QuickQuiz questionCount={3} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <QuickQuiz 
                  questionCount={10}
                  onComplete={(correct, total) => {
                    console.log(`Quiz complete: ${correct}/${total}`);
                  }}
                />
              </div>
              <div>
                <div className="border-2 border-bauhaus-black bg-bauhaus-white mb-4">
                  <div className="p-3 border-b-2 border-bauhaus-black flex items-center gap-2">
                    <div className="w-3 h-3 bg-bauhaus-blue"></div>
                    <span className="font-semibold text-sm uppercase tracking-wider">
                      How It Works
                    </span>
                  </div>
                  <div className="p-4 space-y-3 text-sm">
                    <p>
                      <strong>Spaced Repetition:</strong> Questions are scheduled based on your performance. 
                      Concepts you struggle with appear more often.
                    </p>
                    <p>
                      <strong>Mastery Levels:</strong> Each concept has 5 mastery levels. 
                      Correct answers increase your level, wrong answers decrease it.
                    </p>
                    <p>
                      <strong>XP Rewards:</strong> Earn XP for correct answers and leveling up concepts. 
                      Track your progress on the dashboard.
                    </p>
                  </div>
                </div>
                <ProgressDashboard compact />
              </div>
            </div>
          )}

          {activeTab === 'graph' && (
            <div>
              <KnowledgeGraph
                nodes={graphNodes.map((n: any) => ({
                  id: n.id.replace('sc_', '').replace('concept_', ''),
                  type: n.type,
                  label: n.label,
                  cluster: n.cluster
                }))}
                edges={graphEdges}
                onNodeClick={(nodeId) => {
                  console.log('Selected node:', nodeId);
                }}
              />
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-2 border-bauhaus-black p-4">
                  <h3 className="font-semibold mb-2">File I/O Cluster</h3>
                  <p className="text-sm text-bauhaus-dark-gray">
                    Core system calls for reading and writing files: open, read, write, close, lseek, dup
                  </p>
                </div>
                <div className="border-2 border-bauhaus-black p-4">
                  <h3 className="font-semibold mb-2">Process Cluster</h3>
                  <p className="text-sm text-bauhaus-dark-gray">
                    Process creation and management: fork, exec, wait, exit, getpid
                  </p>
                </div>
                <div className="border-2 border-bauhaus-black p-4">
                  <h3 className="font-semibold mb-2">Signals Cluster</h3>
                  <p className="text-sm text-bauhaus-dark-gray">
                    Signal handling and delivery: sigaction, kill, sigprocmask, pause
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function QuickStatCard({ 
  title, 
  value, 
  description, 
  color 
}: { 
  title: string; 
  value: number; 
  description: string;
  color: 'red' | 'blue' | 'yellow' | 'black';
}) {
  const bgColors = {
    red: 'bg-bauhaus-red text-white',
    blue: 'bg-bauhaus-blue text-white',
    yellow: 'bg-bauhaus-yellow text-bauhaus-black',
    black: 'bg-bauhaus-black text-white'
  };

  return (
    <div className={`p-4 ${bgColors[color]}`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="font-semibold">{title}</div>
      <div className="text-sm opacity-80">{description}</div>
    </div>
  );
}
