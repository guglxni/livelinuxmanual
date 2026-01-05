/**
 * Quick Quiz Component
 * Interactive quizzes for testing knowledge with spaced repetition
 */
import React, { useState, useEffect } from 'react';
import { updateConceptMastery, getConceptsForReview } from '../lib/progress';

interface QuizQuestion {
  id: string;
  conceptId: string;
  conceptName: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  // File I/O
  {
    id: 'q_open_return',
    conceptId: 'open',
    conceptName: 'open()',
    question: 'What does open() return on failure?',
    options: ['0', '-1', 'NULL', 'errno'],
    correctIndex: 1,
    explanation: 'open() returns -1 on failure and sets errno to indicate the error.'
  },
  {
    id: 'q_fd_stdin',
    conceptId: 'fd_basics',
    conceptName: 'File Descriptors',
    question: 'What is the file descriptor number for stdin?',
    options: ['0', '1', '2', '3'],
    correctIndex: 0,
    explanation: 'Standard file descriptors: 0=stdin, 1=stdout, 2=stderr'
  },
  {
    id: 'q_read_eof',
    conceptId: 'read',
    conceptName: 'read()',
    question: 'What does read() return when it reaches end-of-file?',
    options: ['-1', '0', 'EOF', 'EEOF'],
    correctIndex: 1,
    explanation: 'read() returns 0 to indicate end-of-file, -1 for errors.'
  },
  {
    id: 'q_write_partial',
    conceptId: 'write',
    conceptName: 'write()',
    question: 'Can write() write fewer bytes than requested?',
    options: ['No, it always writes all bytes', 'Yes, partial writes are possible', 'Only on network sockets', 'Only with O_NONBLOCK'],
    correctIndex: 1,
    explanation: 'write() may perform partial writes, especially with pipes, sockets, or when interrupted.'
  },
  {
    id: 'q_close_error',
    conceptId: 'close',
    conceptName: 'close()',
    question: 'If close() returns an error, is the file descriptor still valid?',
    options: ['Yes, retry close()', 'No, FD is always released', 'Depends on the error', 'Only on NFS'],
    correctIndex: 1,
    explanation: 'close() always releases the file descriptor, even if it returns an error.'
  },
  
  // Process Management
  {
    id: 'q_fork_return_child',
    conceptId: 'fork',
    conceptName: 'fork()',
    question: 'What does fork() return in the child process?',
    options: ['Parent PID', 'Child PID', '0', '-1'],
    correctIndex: 2,
    explanation: 'fork() returns 0 in the child, the child PID in the parent, -1 on error.'
  },
  {
    id: 'q_exec_return',
    conceptId: 'exec',
    conceptName: 'exec*()',
    question: 'When does execve() return?',
    options: ['Always returns 0', 'Only on error', 'After program completes', 'Never returns on success'],
    correctIndex: 1,
    explanation: 'execve() only returns if an error occurs. On success, the new program replaces the current process.'
  },
  {
    id: 'q_wait_echild',
    conceptId: 'wait',
    conceptName: 'wait()',
    question: 'What error does wait() return when there are no children?',
    options: ['EINVAL', 'ECHILD', 'ESRCH', 'ENOENT'],
    correctIndex: 1,
    explanation: 'ECHILD indicates there are no child processes to wait for.'
  },
  {
    id: 'q_zombie_def',
    conceptId: 'zombie',
    conceptName: 'Zombie Processes',
    question: 'What is a zombie process?',
    options: ['A process using too much CPU', 'A terminated child not yet waited for', 'A process with no parent', 'A process in infinite loop'],
    correctIndex: 1,
    explanation: 'A zombie is a terminated process whose parent has not yet called wait() to retrieve its exit status.'
  },
  {
    id: 'q_orphan_parent',
    conceptId: 'fork',
    conceptName: 'fork()',
    question: 'What happens to a child process when its parent terminates?',
    options: ['Child terminates too', 'Child becomes zombie', 'Child is adopted by init', 'Child continues unchanged'],
    correctIndex: 2,
    explanation: 'Orphaned processes are adopted by init (PID 1), which will reap them when they terminate.'
  },
  
  // Signals
  {
    id: 'q_sigkill_catch',
    conceptId: 'sigaction',
    conceptName: 'sigaction()',
    question: 'Can SIGKILL be caught or ignored?',
    options: ['Yes, with sigaction()', 'Yes, with signal()', 'No, never', 'Only by root'],
    correctIndex: 2,
    explanation: 'SIGKILL and SIGSTOP cannot be caught, blocked, or ignored.'
  },
  {
    id: 'q_sigprocmask_how',
    conceptId: 'sigprocmask',
    conceptName: 'sigprocmask()',
    question: 'Which value for "how" adds signals to the current mask?',
    options: ['SIG_SETMASK', 'SIG_BLOCK', 'SIG_UNBLOCK', 'SIG_ADD'],
    correctIndex: 1,
    explanation: 'SIG_BLOCK adds signals to the mask, SIG_UNBLOCK removes them, SIG_SETMASK replaces the mask.'
  },
  {
    id: 'q_signal_queue',
    conceptId: 'sigaction',
    conceptName: 'sigaction()',
    question: 'Are standard signals queued if delivered multiple times while blocked?',
    options: ['Yes, all are queued', 'No, only one is pending', 'Up to 32 are queued', 'Depends on SA_SIGINFO'],
    correctIndex: 1,
    explanation: 'Standard signals are not queued. Multiple deliveries while blocked result in only one pending signal.'
  },
  
  // Error Handling
  {
    id: 'q_errno_when',
    conceptId: 'errno',
    conceptName: 'Error Handling',
    question: 'When should you check errno?',
    options: ['Before any system call', 'After every system call', 'Only after a call returns -1', 'Only in signal handlers'],
    correctIndex: 2,
    explanation: 'errno is only meaningful after a system call fails (returns -1). It is not reset on success.'
  },
  {
    id: 'q_perror_use',
    conceptId: 'errno',
    conceptName: 'Error Handling',
    question: 'What does perror() do?',
    options: ['Returns error number', 'Prints error message to stderr', 'Sets errno', 'Clears errno'],
    correctIndex: 1,
    explanation: 'perror() prints a message to stderr based on the current value of errno.'
  }
];

interface QuickQuizProps {
  conceptFilter?: string[];
  onComplete?: (correct: number, total: number) => void;
  questionCount?: number;
}

export function QuickQuiz({ conceptFilter, onComplete, questionCount = 5 }: QuickQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    // Select questions based on filter or spaced repetition
    let available = QUIZ_QUESTIONS;
    
    if (conceptFilter && conceptFilter.length > 0) {
      available = available.filter(q => conceptFilter.includes(q.conceptId));
    }
    
    // Prioritize concepts due for review
    const dueForReview = getConceptsForReview().map(c => c.id);
    const prioritized = [
      ...available.filter(q => dueForReview.includes(q.conceptId)),
      ...available.filter(q => !dueForReview.includes(q.conceptId))
    ];
    
    // Shuffle and take requested count
    const shuffled = prioritized.sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, questionCount));
  }, [conceptFilter, questionCount]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (index: number) => {
    if (showResult) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    const isCorrect = index === currentQuestion.correctIndex;
    
    // Update progress
    updateConceptMastery(
      currentQuestion.conceptId,
      currentQuestion.conceptName,
      isCorrect
    );
    
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
      onComplete?.(score.correct + (selectedAnswer === currentQuestion.correctIndex ? 1 : 0), questions.length);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore({ correct: 0, total: 0 });
    setQuizComplete(false);
    
    // Reshuffle questions
    setQuestions(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  if (questions.length === 0) {
    return (
      <div className="border-2 border-bauhaus-black p-4 text-center">
        <p className="text-bauhaus-dark-gray">No quiz questions available.</p>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score.correct / questions.length) * 100);
    
    return (
      <div className="border-2 border-bauhaus-black bg-bauhaus-white">
        <div className="p-3 border-b-2 border-bauhaus-black flex items-center gap-2">
          <div className="w-3 h-3 bg-bauhaus-yellow"></div>
          <span className="font-semibold text-sm uppercase tracking-wider">Quiz Complete</span>
        </div>
        
        <div className="p-6 text-center">
          <div className={`text-6xl font-bold mb-2 ${
            percentage >= 80 ? 'text-green-600' : 
            percentage >= 60 ? 'text-bauhaus-yellow' : 'text-bauhaus-red'
          }`}>
            {percentage}%
          </div>
          <p className="text-lg mb-4">
            {score.correct} out of {questions.length} correct
          </p>
          <p className="text-bauhaus-dark-gray mb-6">
            {percentage >= 80 ? 'Excellent work!' : 
             percentage >= 60 ? 'Good progress, keep practicing!' : 
             'Review the material and try again.'}
          </p>
          
          <button
            onClick={handleRestart}
            className="px-6 py-2 bg-bauhaus-black text-white font-semibold uppercase tracking-wider hover:bg-bauhaus-blue transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-bauhaus-black bg-bauhaus-white">
      <div className="p-3 border-b-2 border-bauhaus-black flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-bauhaus-yellow"></div>
          <span className="font-semibold text-sm uppercase tracking-wider">Quick Quiz</span>
        </div>
        <span className="text-sm font-mono">
          {currentIndex + 1}/{questions.length}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-bauhaus-gray">
        <div 
          className="h-full bg-bauhaus-blue transition-all"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>
      
      <div className="p-4">
        {/* Concept tag */}
        <div className="mb-3">
          <span className="px-2 py-1 bg-bauhaus-gray text-xs font-mono uppercase">
            {currentQuestion.conceptName}
          </span>
        </div>
        
        {/* Question */}
        <p className="text-lg font-semibold mb-4">{currentQuestion.question}</p>
        
        {/* Options */}
        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => {
            let bgColor = 'bg-bauhaus-white hover:bg-bauhaus-gray';
            let borderColor = 'border-bauhaus-black';
            
            if (showResult) {
              if (index === currentQuestion.correctIndex) {
                bgColor = 'bg-green-200';
                borderColor = 'border-green-600';
              } else if (index === selectedAnswer) {
                bgColor = 'bg-red-200';
                borderColor = 'border-bauhaus-red';
              }
            } else if (selectedAnswer === index) {
              bgColor = 'bg-bauhaus-gray';
            }
            
            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={`w-full p-3 text-left border-2 ${borderColor} ${bgColor} transition-colors font-mono text-sm`}
              >
                <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            );
          })}
        </div>
        
        {/* Explanation */}
        {showResult && (
          <div className={`mt-4 p-3 border-l-4 ${
            selectedAnswer === currentQuestion.correctIndex 
              ? 'border-green-600 bg-green-50' 
              : 'border-bauhaus-red bg-red-50'
          }`}>
            <p className="font-semibold mb-1">
              {selectedAnswer === currentQuestion.correctIndex ? 'Correct!' : 'Incorrect'}
            </p>
            <p className="text-sm">{currentQuestion.explanation}</p>
          </div>
        )}
        
        {/* Next button */}
        {showResult && (
          <button
            onClick={handleNext}
            className="mt-4 w-full py-2 bg-bauhaus-black text-white font-semibold uppercase tracking-wider hover:bg-bauhaus-blue transition-colors"
          >
            {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
}

export default QuickQuiz;
