import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { CodeBlock } from '../components/CodeBlock';
import { markSectionComplete, getProgress } from '../lib/progress';
import knowledgeBase from '../../content/knowledge-base.json';

interface Exercise {
  id: string;
  chapter: number;
  title: string;
  difficulty: string;
  description: string;
  requirements: string[];
  hints: string[];
  template: string;
  concepts: string[];
  estimatedMinutes: number;
  extensions?: string[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedHours: number;
  milestones: { name: string; concepts: string[] }[];
}

// Build exercises from knowledge base
const buildExercises = (): Exercise[] => {
  const exercises: Exercise[] = [];
  const kb = (knowledgeBase as any).exercises || {};
  
  (kb.beginner || []).forEach((ex: any, i: number) => {
    exercises.push({
      id: `beginner_${i}`,
      chapter: ex.chapter || 3,
      title: ex.title,
      difficulty: 'Beginner',
      description: ex.description,
      requirements: ex.requirements || [],
      hints: ex.hints || [],
      template: ex.template || '',
      concepts: ex.concepts || [],
      estimatedMinutes: ex.estimatedMinutes || 30
    });
  });
  
  (kb.intermediate || []).forEach((ex: any, i: number) => {
    exercises.push({
      id: `intermediate_${i}`,
      chapter: ex.chapter || 5,
      title: ex.title,
      difficulty: 'Intermediate',
      description: ex.description,
      requirements: ex.requirements || [],
      hints: ex.hints || [],
      template: ex.template || '',
      concepts: ex.concepts || [],
      estimatedMinutes: ex.estimatedMinutes || 45
    });
  });
  
  (kb.advanced || []).forEach((ex: any, i: number) => {
    exercises.push({
      id: `advanced_${i}`,
      chapter: ex.chapter || 6,
      title: ex.title,
      difficulty: 'Advanced',
      description: ex.description,
      requirements: ex.requirements || [],
      hints: ex.hints || [],
      template: ex.template || '',
      concepts: ex.concepts || [],
      estimatedMinutes: ex.estimatedMinutes || 90,
      extensions: ex.extensions || []
    });
  });
  
  return exercises;
};

const buildProjects = (): Project[] => {
  const kb = (knowledgeBase as any).exercises || {};
  return (kb.projects || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    difficulty: 'Project',
    estimatedHours: p.estimatedHours || 6,
    milestones: p.milestones || []
  }));
};

const EXERCISES = buildExercises();
const PROJECTS = buildProjects();

export default function Exercises() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(EXERCISES[0] || null);
  const [activeTab, setActiveTab] = useState<'exercises' | 'projects'>('exercises');
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    const progress = getProgress();
    const completed = Object.keys(progress.sections).filter(id => 
      id.startsWith('ex_') && progress.sections[id].completed
    );
    setCompletedExercises(completed);
  }, []);

  const handleMarkComplete = (exerciseId: string) => {
    markSectionComplete(`ex_${exerciseId}`);
    setCompletedExercises(prev => [...prev, `ex_${exerciseId}`]);
  };

  const isCompleted = (id: string) => completedExercises.includes(`ex_${id}`);

  return (
    <Layout title="Exercises">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-bauhaus-yellow flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-bauhaus-dark-gray">
              Practice
            </div>
            <h1 className="text-2xl font-bold">Exercises</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-6">
          <button
            onClick={() => setActiveTab('exercises')}
            className={`px-6 py-3 font-semibold text-sm uppercase tracking-wider border-2 border-bauhaus-black ${
              activeTab === 'exercises' ? 'bg-bauhaus-black text-white' : 'hover:bg-bauhaus-gray'
            }`}
          >
            Exercises ({EXERCISES.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 font-semibold text-sm uppercase tracking-wider border-2 border-l-0 border-bauhaus-black ${
              activeTab === 'projects' ? 'bg-bauhaus-black text-white' : 'hover:bg-bauhaus-gray'
            }`}
          >
            Projects ({PROJECTS.length})
          </button>
        </div>

        {activeTab === 'exercises' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Exercise list */}
            <div className="lg:col-span-1">
              <h2 className="text-sm font-mono uppercase tracking-wider text-bauhaus-dark-gray mb-4">
                Available Exercises
              </h2>
              <div className="space-y-2">
                {EXERCISES.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      setSelectedExercise(ex);
                      setShowHints(false);
                    }}
                    className={`w-full text-left p-3 border-2 transition-colors ${
                      selectedExercise?.id === ex.id
                        ? 'border-bauhaus-red bg-bauhaus-gray'
                        : 'border-bauhaus-black hover:bg-bauhaus-gray'
                    } ${isCompleted(ex.id) ? 'border-l-4 border-l-green-500' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono bg-bauhaus-black text-white px-1">
                        Ch.{ex.chapter}
                      </span>
                      <span className={`text-xs font-mono px-1 ${
                        ex.difficulty === 'Beginner' ? 'bg-green-200' :
                        ex.difficulty === 'Intermediate' ? 'bg-yellow-200' : 'bg-red-200'
                      }`}>
                        {ex.difficulty}
                      </span>
                      {isCompleted(ex.id) && (
                        <span className="text-xs text-green-600">Done</span>
                      )}
                    </div>
                    <div className="font-semibold text-sm">{ex.title}</div>
                    <div className="text-xs text-bauhaus-dark-gray mt-1">
                      ~{ex.estimatedMinutes} min
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise detail */}
            <div className="lg:col-span-3">
              {selectedExercise ? (
                <div className="border-2 border-bauhaus-black">
                  <div className="p-4 border-b-2 border-bauhaus-black bg-bauhaus-gray">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">{selectedExercise.title}</h2>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono">~{selectedExercise.estimatedMinutes} min</span>
                        <span className={`text-xs font-mono px-2 py-1 ${
                          selectedExercise.difficulty === 'Beginner' ? 'bg-green-200' :
                          selectedExercise.difficulty === 'Intermediate' ? 'bg-yellow-200' : 'bg-red-200'
                        }`}>
                          {selectedExercise.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-base mb-6">{selectedExercise.description}</p>

                    {/* Concepts */}
                    {selectedExercise.concepts.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-mono uppercase tracking-wider text-bauhaus-dark-gray mb-2">
                          Concepts Covered
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedExercise.concepts.map((c, i) => (
                            <span key={i} className="px-2 py-1 bg-bauhaus-blue text-white text-xs font-mono">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Requirements */}
                    {selectedExercise.requirements.length > 0 && (
                      <>
                        <h3 className="text-sm font-mono uppercase tracking-wider text-bauhaus-dark-gray mb-3">
                          Requirements
                        </h3>
                        <ul className="space-y-2 mb-6">
                          {selectedExercise.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-bauhaus-red mt-2 flex-shrink-0"></div>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {/* Hints (collapsible) */}
                    {selectedExercise.hints.length > 0 && (
                      <div className="mb-6">
                        <button
                          onClick={() => setShowHints(!showHints)}
                          className="text-sm font-mono uppercase tracking-wider text-bauhaus-dark-gray mb-3 flex items-center gap-2"
                        >
                          <span>{showHints ? 'v' : '>'}</span>
                          Hints ({selectedExercise.hints.length})
                        </button>
                        {showHints && (
                          <ul className="space-y-2 border-l-4 border-bauhaus-yellow pl-4">
                            {selectedExercise.hints.map((hint, idx) => (
                              <li key={idx} className="text-bauhaus-dark-gray text-sm">{hint}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* Template */}
                    {selectedExercise.template && (
                      <>
                        <h3 className="text-sm font-mono uppercase tracking-wider text-bauhaus-dark-gray mb-3">
                          Template Code
                        </h3>
                        <CodeBlock code={selectedExercise.template} language="c" />
                      </>
                    )}

                    {/* Extensions */}
                    {selectedExercise.extensions && selectedExercise.extensions.length > 0 && (
                      <div className="mt-6 p-4 bg-bauhaus-gray border-l-4 border-bauhaus-blue">
                        <h3 className="text-sm font-mono uppercase tracking-wider mb-2">
                          Extensions (Optional)
                        </h3>
                        <ul className="space-y-1 text-sm">
                          {selectedExercise.extensions.map((ext, i) => (
                            <li key={i}>{ext}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex gap-4">
                      {!isCompleted(selectedExercise.id) ? (
                        <button
                          onClick={() => handleMarkComplete(selectedExercise.id)}
                          className="px-6 py-3 bg-bauhaus-blue text-white font-semibold uppercase tracking-wider hover:bg-bauhaus-black transition-colors"
                        >
                          Mark Complete
                        </button>
                      ) : (
                        <span className="px-6 py-3 bg-green-500 text-white font-semibold uppercase tracking-wider">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-bauhaus-black p-8 text-center text-bauhaus-dark-gray">
                  Select an exercise to get started
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROJECTS.map((project) => (
              <div key={project.id} className="border-2 border-bauhaus-black">
                <div className="p-4 border-b-2 border-bauhaus-black bg-bauhaus-red text-white">
                  <h3 className="text-lg font-bold">{project.title}</h3>
                  <span className="text-sm opacity-80">~{project.estimatedHours} hours</span>
                </div>
                <div className="p-4">
                  <p className="text-sm mb-4">{project.description}</p>
                  
                  {project.milestones.length > 0 && (
                    <>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-bauhaus-dark-gray mb-2">
                        Milestones
                      </h4>
                      <div className="space-y-2">
                        {project.milestones.map((m, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-6 h-6 border-2 border-bauhaus-black flex items-center justify-center text-xs font-bold">
                              {i + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{m.name}</div>
                              <div className="text-xs text-bauhaus-dark-gray">
                                {m.concepts.join(', ')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {PROJECTS.length === 0 && (
              <div className="col-span-2 border-2 border-bauhaus-black p-8 text-center text-bauhaus-dark-gray">
                No projects available yet. Complete exercises first!
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
