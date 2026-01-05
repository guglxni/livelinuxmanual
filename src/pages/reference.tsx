import { useState } from 'react';
import { Layout } from '../components/Layout';
import { AsciiDiagram } from '../components/AsciiDiagram';
import { DIAGRAMS, generateTable } from '../lib/diagon';

const API_CATEGORIES = [
  {
    name: 'File I/O',
    color: 'blue',
    apis: [
      { name: 'open', signature: 'int open(const char *pathname, int flags, ... /* mode_t mode */)', desc: 'Open or create a file' },
      { name: 'read', signature: 'ssize_t read(int fd, void *buffer, size_t count)', desc: 'Read from file descriptor' },
      { name: 'write', signature: 'ssize_t write(int fd, const void *buffer, size_t count)', desc: 'Write to file descriptor' },
      { name: 'close', signature: 'int close(int fd)', desc: 'Close file descriptor' },
      { name: 'lseek', signature: 'off_t lseek(int fd, off_t offset, int whence)', desc: 'Reposition file offset' },
    ],
  },
  {
    name: 'Process Control',
    color: 'red',
    apis: [
      { name: 'fork', signature: 'pid_t fork(void)', desc: 'Create child process' },
      { name: 'execve', signature: 'int execve(const char *pathname, char *const argv[], char *const envp[])', desc: 'Execute program' },
      { name: 'exit', signature: 'void exit(int status)', desc: 'Terminate process' },
      { name: '_exit', signature: 'void _exit(int status)', desc: 'Terminate process immediately' },
      { name: 'wait', signature: 'pid_t wait(int *wstatus)', desc: 'Wait for child process' },
      { name: 'waitpid', signature: 'pid_t waitpid(pid_t pid, int *wstatus, int options)', desc: 'Wait for specific child' },
      { name: 'getpid', signature: 'pid_t getpid(void)', desc: 'Get process ID' },
      { name: 'getppid', signature: 'pid_t getppid(void)', desc: 'Get parent process ID' },
    ],
  },
  {
    name: 'Signals',
    color: 'yellow',
    apis: [
      { name: 'sigaction', signature: 'int sigaction(int sig, const struct sigaction *act, struct sigaction *oldact)', desc: 'Change signal disposition' },
      { name: 'sigprocmask', signature: 'int sigprocmask(int how, const sigset_t *set, sigset_t *oldset)', desc: 'Modify signal mask' },
      { name: 'sigpending', signature: 'int sigpending(sigset_t *set)', desc: 'Get pending signals' },
      { name: 'sigemptyset', signature: 'int sigemptyset(sigset_t *set)', desc: 'Initialize empty signal set' },
      { name: 'sigfillset', signature: 'int sigfillset(sigset_t *set)', desc: 'Initialize full signal set' },
      { name: 'sigaddset', signature: 'int sigaddset(sigset_t *set, int sig)', desc: 'Add signal to set' },
      { name: 'sigdelset', signature: 'int sigdelset(sigset_t *set, int sig)', desc: 'Remove signal from set' },
      { name: 'pause', signature: 'int pause(void)', desc: 'Wait for signal' },
      { name: 'kill', signature: 'int kill(pid_t pid, int sig)', desc: 'Send signal to process' },
    ],
  },
  {
    name: 'Environment',
    color: 'blue',
    apis: [
      { name: 'getenv', signature: 'char *getenv(const char *name)', desc: 'Get environment variable' },
      { name: 'setenv', signature: 'int setenv(const char *name, const char *value, int overwrite)', desc: 'Set environment variable' },
      { name: 'unsetenv', signature: 'int unsetenv(const char *name)', desc: 'Remove environment variable' },
      { name: 'putenv', signature: 'int putenv(char *string)', desc: 'Add/change environment variable' },
    ],
  },
];

const DIAGRAMS_LIST = [
  { name: 'Process Memory Layout', diagram: DIAGRAMS.memoryLayout },
  { name: 'Fork/Exec Lifecycle', diagram: DIAGRAMS.forkExec },
  { name: 'Signal Flow', diagram: DIAGRAMS.signalFlow },
  { name: 'File Descriptor Table', diagram: DIAGRAMS.fdTable },
  { name: 'Wait Status Encoding', diagram: DIAGRAMS.waitStatus },
  { name: 'Error Handling Flow', diagram: DIAGRAMS.errnoFlow },
  { name: 'open() Flags', diagram: DIAGRAMS.openFlags },
  { name: 'strace Output', diagram: DIAGRAMS.straceOutput },
];

export default function Reference() {
  const [activeCategory, setActiveCategory] = useState('File I/O');

  const currentCategory = API_CATEGORIES.find((c) => c.name === activeCategory);

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-bauhaus-blue flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-bauhaus-dark-gray">
              Quick Reference
            </div>
            <h1 className="text-2xl font-bold">API Reference</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* API Categories */}
          <div className="lg:col-span-2">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {API_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider border-2 transition-colors ${
                    activeCategory === cat.name
                      ? 'bg-bauhaus-black text-white border-bauhaus-black'
                      : 'border-bauhaus-black hover:bg-bauhaus-gray'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* API list */}
            {currentCategory && (
              <div className="space-y-4">
                {currentCategory.apis.map((api) => (
                  <div key={api.name} className="border-2 border-bauhaus-black p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg">{api.name}()</h3>
                        <p className="text-sm text-bauhaus-dark-gray mt-1">{api.desc}</p>
                      </div>
                      <div className="text-xs font-mono bg-bauhaus-gray px-2 py-1">
                        man 2
                      </div>
                    </div>
                    <div className="mt-3 bg-bauhaus-black text-bauhaus-white p-3 font-mono text-sm overflow-x-auto">
                      {api.signature}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Diagrams sidebar */}
          <div>
            <h2 className="text-sm font-mono uppercase tracking-wider text-bauhaus-dark-gray mb-4">
              Visual References
            </h2>
            <div className="space-y-6">
              {DIAGRAMS_LIST.map((d) => (
                <div key={d.name}>
                  <h3 className="font-semibold mb-2">{d.name}</h3>
                  <AsciiDiagram content={d.diagram} accent="blue" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
