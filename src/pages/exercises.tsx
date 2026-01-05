import { useState } from 'react';
import { Layout } from '../components/Layout';
import { CodeBlock } from '../components/CodeBlock';

const EXERCISES = [
  {
    id: 1,
    chapter: 3,
    title: 'Implement tee command',
    difficulty: 'Beginner',
    description: 'Using open(), close(), read(), and write(), implement the tee [-a] file command. This command writes a copy of its standard input to standard output and to file.',
    requirements: [
      'If file does not exist, create it',
      'If file exists, truncate to zero length (O_TRUNC)',
      'Support -a option for append mode (O_APPEND)',
      'Handle errors appropriately',
    ],
    hints: [
      'Standard input and output are automatically opened (FD 0 and 1)',
      'Use getopt(3) for command-line option parsing',
      'Remember to check return values of all system calls',
    ],
    template: `#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>

#define BUF_SIZE 1024

int main(int argc, char *argv[]) {
    int opt, append = 0;
    
    // FIXME: Parse -a option using getopt()
    
    if (optind >= argc) {
        fprintf(stderr, "Usage: %s [-a] file\\n", argv[0]);
        exit(EXIT_FAILURE);
    }
    
    // FIXME: Open output file with appropriate flags
    int flags = O_WRONLY | O_CREAT;
    // Add O_APPEND or O_TRUNC based on -a flag
    
    int fd = open(argv[optind], flags, 0644);
    if (fd == -1) {
        perror("open");
        exit(EXIT_FAILURE);
    }
    
    // FIXME: Read from stdin, write to stdout and file
    char buf[BUF_SIZE];
    ssize_t nread;
    
    // Your code here...
    
    close(fd);
    return 0;
}`,
  },
  {
    id: 2,
    chapter: 6,
    title: 'Fork and variable test',
    difficulty: 'Beginner',
    description: 'Write a program that uses fork() to create a child process and demonstrates that the child can modify its copy of a variable without affecting the parent.',
    requirements: [
      'Create a local variable in main()',
      'Fork a child process',
      'Child modifies the variable and prints it',
      'Parent waits, then prints its copy of the variable',
    ],
    hints: [
      'Use sleep() to ensure child executes first',
      'Both processes should print their PID',
      'The values should be different after child modifies its copy',
    ],
    template: `#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>

int main(void) {
    int localVar = 100;
    
    printf("Before fork: localVar = %d\\n", localVar);
    
    pid_t pid = fork();
    
    if (pid == -1) {
        perror("fork");
        exit(EXIT_FAILURE);
    }
    
    if (pid == 0) {
        // Child process
        // FIXME: Modify localVar and print PID and value
    } else {
        // Parent process
        // FIXME: Wait for child, then print PID and value
    }
    
    return 0;
}`,
  },
  {
    id: 3,
    chapter: 5,
    title: 'Signal handler experiment',
    difficulty: 'Intermediate',
    description: 'Write a program that blocks all signals except SIGINT, establishes a handler for SIGINT, and displays pending signals when the handler returns.',
    requirements: [
      'Block all signals except SIGINT using sigprocmask()',
      'Establish SIGINT handler using sigaction()',
      'Call pause() to wait for signal',
      'After pause() returns, display all pending signals',
    ],
    hints: [
      'Use sigfillset() then sigdelset() to create the mask',
      'Iterate through signals 1 to NSIG-1 to check pending',
      'Use strsignal() to get signal descriptions',
    ],
    template: `#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

static void sigint_handler(int sig) {
    // Handler just returns
}

int main(void) {
    struct sigaction sa;
    sigset_t block_set, pending;
    
    // FIXME: Set up signal mask to block all except SIGINT
    
    // FIXME: Establish SIGINT handler
    
    printf("PID: %ld\\n", (long)getpid());
    printf("Send signals, then press Ctrl-C...\\n");
    
    pause();  // Wait for SIGINT
    
    printf("\\nPending signals:\\n");
    
    // FIXME: Get and display pending signals
    
    return 0;
}`,
  },
  {
    id: 4,
    chapter: 6,
    title: 'Simple shell',
    difficulty: 'Advanced',
    description: 'Write a simple shell that reads commands, forks child processes, and executes programs using execve().',
    requirements: [
      'Loop reading commands from stdin',
      'Parse space-delimited words into argv array',
      'Fork and exec each command in child process',
      'Parent waits and displays exit status',
    ],
    hints: [
      'Use strtok(3) to tokenize input',
      'execve() requires full pathname',
      'Use printWaitStatus() or WIFEXITED/WEXITSTATUS macros',
    ],
    template: `#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/wait.h>

#define MAX_ARGS 64
#define MAX_LINE 1024

extern char **environ;

int main(void) {
    char line[MAX_LINE];
    char *argv[MAX_ARGS];
    
    while (1) {
        printf("$ ");
        fflush(stdout);
        
        if (fgets(line, MAX_LINE, stdin) == NULL)
            break;
        
        // Remove newline
        line[strcspn(line, "\\n")] = 0;
        
        if (strlen(line) == 0)
            continue;
        
        // FIXME: Tokenize line into argv array
        
        // FIXME: Fork and exec
        
        // FIXME: Parent waits and prints status
    }
    
    return 0;
}`,
  },
];

export default function Exercises() {
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <Layout>
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
                    setShowSolution(false);
                  }}
                  className={`w-full text-left p-3 border-2 transition-colors ${
                    selectedExercise.id === ex.id
                      ? 'border-bauhaus-red bg-bauhaus-gray'
                      : 'border-bauhaus-black hover:bg-bauhaus-gray'
                  }`}
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
                  </div>
                  <div className="font-semibold text-sm">{ex.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Exercise detail */}
          <div className="lg:col-span-3">
            <div className="border-2 border-bauhaus-black">
              <div className="p-4 border-b-2 border-bauhaus-black bg-bauhaus-gray">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{selectedExercise.title}</h2>
                  <span className={`text-xs font-mono px-2 py-1 ${
                    selectedExercise.difficulty === 'Beginner' ? 'bg-green-200' :
                    selectedExercise.difficulty === 'Intermediate' ? 'bg-yellow-200' : 'bg-red-200'
                  }`}>
                    {selectedExercise.difficulty}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <p className="text-base mb-6">{selectedExercise.description}</p>

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

                <h3 className="text-sm font-mono uppercase tracking-wider text-bauhaus-dark-gray mb-3">
                  Hints
                </h3>
                <ul className="space-y-2 mb-6">
                  {selectedExercise.hints.map((hint, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-bauhaus-yellow mt-2 flex-shrink-0"></div>
                      <span className="text-bauhaus-dark-gray">{hint}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-sm font-mono uppercase tracking-wider text-bauhaus-dark-gray mb-3">
                  Template Code
                </h3>
                <CodeBlock code={selectedExercise.template} language="c" />

                <div className="mt-6 flex gap-4">
                  <button className="px-6 py-3 bg-bauhaus-blue text-white font-semibold uppercase tracking-wider hover:bg-bauhaus-black transition-colors">
                    Start Exercise
                  </button>
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="px-6 py-3 border-2 border-bauhaus-black font-semibold uppercase tracking-wider hover:bg-bauhaus-gray transition-colors"
                  >
                    {showSolution ? 'Hide Hints' : 'Show More Hints'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
