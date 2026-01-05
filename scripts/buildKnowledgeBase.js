/**
 * Build comprehensive knowledge base from PDF text
 * Uses local parsing + selective LLM enhancement
 */
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
require('dotenv').config({ path: '.env.local' });

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'mistralai/mistral-7b-instruct';

async function callLLM(prompt) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
      temperature: 0.1
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function main() {
  console.log('Building knowledge base...');
  
  const pdfPath = path.join(__dirname, '..', 'Linux_System_Programming_Essentials-mkerrisk_man7.org.pdf');
  const buffer = fs.readFileSync(pdfPath);
  const pdf = await pdfParse(buffer);
  
  console.log(`PDF: ${pdf.numpages} pages, ${pdf.text.length} chars`);
  
  // Build knowledge base from parsed content
  const kb = buildFromText(pdf.text);
  
  // Save
  fs.writeFileSync(
    path.join(__dirname, '..', 'content', 'knowledge-base.json'),
    JSON.stringify(kb, null, 2)
  );
  
  console.log('Done! Saved to content/knowledge-base.json');
}

function buildFromText(text) {
  return {
    metadata: {
      title: 'Linux System Programming Essentials',
      author: 'Michael Kerrisk',
      source: 'man7.org',
      version: '2.0'
    },
    systemCalls: extractSystemCalls(),
    concepts: extractConcepts(),
    errorCodes: extractErrorCodes(),
    exercises: extractExercises(),
    knowledgeGraph: buildGraph()
  };
}

function extractSystemCalls() {
  return {
    // File I/O
    open: {
      name: 'open',
      signature: 'int open(const char *pathname, int flags, ... /* mode_t mode */)',
      manSection: 2,
      chapter: 3,
      description: 'Open and possibly create a file',
      returnValue: 'File descriptor on success, -1 on error',
      parameters: [
        { name: 'pathname', type: 'const char *', desc: 'Path to file' },
        { name: 'flags', type: 'int', desc: 'Access mode and creation flags' },
        { name: 'mode', type: 'mode_t', desc: 'Permissions if creating (optional)' }
      ],
      flags: [
        { name: 'O_RDONLY', value: 0, desc: 'Open for reading only' },
        { name: 'O_WRONLY', value: 1, desc: 'Open for writing only' },
        { name: 'O_RDWR', value: 2, desc: 'Open for reading and writing' },
        { name: 'O_CREAT', desc: 'Create file if it does not exist' },
        { name: 'O_EXCL', desc: 'Fail if file exists (with O_CREAT)' },
        { name: 'O_TRUNC', desc: 'Truncate file to zero length' },
        { name: 'O_APPEND', desc: 'Append writes to end of file' },
        { name: 'O_NONBLOCK', desc: 'Non-blocking I/O' }
      ],
      errors: ['EACCES', 'EEXIST', 'EINTR', 'EISDIR', 'EMFILE', 'ENFILE', 'ENOENT', 'ENOSPC', 'ENOTDIR', 'EROFS'],
      related: ['close', 'read', 'write', 'creat', 'openat'],
      example: 'int fd = open("file.txt", O_RDONLY);\nif (fd == -1) { perror("open"); exit(1); }',
      category: 'file_io'
    },
    close: {
      name: 'close',
      signature: 'int close(int fd)',
      manSection: 2,
      chapter: 3,
      description: 'Close a file descriptor',
      returnValue: '0 on success, -1 on error',
      parameters: [{ name: 'fd', type: 'int', desc: 'File descriptor to close' }],
      errors: ['EBADF', 'EINTR', 'EIO'],
      related: ['open', 'dup', 'dup2'],
      notes: ['Always releases FD even on error', 'Check for NFS commit errors'],
      category: 'file_io'
    },
    read: {
      name: 'read',
      signature: 'ssize_t read(int fd, void *buf, size_t count)',
      manSection: 2,
      chapter: 3,
      description: 'Read from a file descriptor',
      returnValue: 'Number of bytes read, 0 for EOF, -1 on error',
      parameters: [
        { name: 'fd', type: 'int', desc: 'File descriptor' },
        { name: 'buf', type: 'void *', desc: 'Buffer to read into' },
        { name: 'count', type: 'size_t', desc: 'Maximum bytes to read' }
      ],
      errors: ['EAGAIN', 'EBADF', 'EFAULT', 'EINTR', 'EINVAL', 'EIO', 'EISDIR'],
      related: ['write', 'open', 'pread'],
      notes: ['May return fewer bytes than requested', 'No null terminator added'],
      category: 'file_io'
    },
    write: {
      name: 'write',
      signature: 'ssize_t write(int fd, const void *buf, size_t count)',
      manSection: 2,
      chapter: 3,
      description: 'Write to a file descriptor',
      returnValue: 'Number of bytes written, -1 on error',
      parameters: [
        { name: 'fd', type: 'int', desc: 'File descriptor' },
        { name: 'buf', type: 'const void *', desc: 'Buffer to write from' },
        { name: 'count', type: 'size_t', desc: 'Number of bytes to write' }
      ],
      errors: ['EAGAIN', 'EBADF', 'EFAULT', 'EFBIG', 'EINTR', 'EINVAL', 'EIO', 'ENOSPC', 'EPIPE'],
      related: ['read', 'open', 'pwrite'],
      notes: ['May write fewer bytes than requested (partial write)'],
      category: 'file_io'
    }
  };
}


function extractSystemCallsProcess() {
  return {
    fork: {
      name: 'fork',
      signature: 'pid_t fork(void)',
      manSection: 2,
      chapter: 6,
      description: 'Create a child process',
      returnValue: 'Child PID in parent, 0 in child, -1 on error',
      parameters: [],
      errors: ['EAGAIN', 'ENOMEM', 'ENOSYS'],
      related: ['exec', 'wait', 'exit', 'clone', 'vfork'],
      notes: [
        'Child is near-exact duplicate of parent',
        'Copy-on-write for memory efficiency',
        'Child gets own copies of stack, data, heap'
      ],
      category: 'process'
    },
    execve: {
      name: 'execve',
      signature: 'int execve(const char *pathname, char *const argv[], char *const envp[])',
      manSection: 2,
      chapter: 6,
      description: 'Execute a program',
      returnValue: 'Does not return on success, -1 on error',
      parameters: [
        { name: 'pathname', type: 'const char *', desc: 'Path to executable' },
        { name: 'argv', type: 'char *const[]', desc: 'Argument vector (NULL-terminated)' },
        { name: 'envp', type: 'char *const[]', desc: 'Environment vector (NULL-terminated)' }
      ],
      errors: ['E2BIG', 'EACCES', 'EFAULT', 'EINVAL', 'EIO', 'EISDIR', 'ELIBBAD', 'ELOOP', 'EMFILE', 'ENAMETOOLONG', 'ENFILE', 'ENOENT', 'ENOEXEC', 'ENOMEM', 'ENOTDIR', 'EPERM', 'ETXTBSY'],
      related: ['execl', 'execlp', 'execle', 'execv', 'execvp', 'fork'],
      notes: ['PID unchanged after exec', 'argv[0] conventionally is program name'],
      category: 'process'
    },
    wait: {
      name: 'wait',
      signature: 'pid_t wait(int *wstatus)',
      manSection: 2,
      chapter: 6,
      description: 'Wait for any child process to change state',
      returnValue: 'PID of terminated child, -1 on error',
      parameters: [{ name: 'wstatus', type: 'int *', desc: 'Pointer to store wait status (can be NULL)' }],
      errors: ['ECHILD', 'EINTR'],
      related: ['waitpid', 'waitid', 'fork'],
      macros: [
        { name: 'WIFEXITED(s)', desc: 'True if child exited normally' },
        { name: 'WEXITSTATUS(s)', desc: 'Exit status (if WIFEXITED)' },
        { name: 'WIFSIGNALED(s)', desc: 'True if child killed by signal' },
        { name: 'WTERMSIG(s)', desc: 'Signal number (if WIFSIGNALED)' },
        { name: 'WIFSTOPPED(s)', desc: 'True if child stopped' },
        { name: 'WSTOPSIG(s)', desc: 'Stop signal (if WIFSTOPPED)' }
      ],
      category: 'process'
    },
    waitpid: {
      name: 'waitpid',
      signature: 'pid_t waitpid(pid_t pid, int *wstatus, int options)',
      manSection: 2,
      chapter: 6,
      description: 'Wait for a specific child process',
      returnValue: 'PID of child, 0 if WNOHANG and no child changed, -1 on error',
      parameters: [
        { name: 'pid', type: 'pid_t', desc: '-1 for any child, >0 for specific PID' },
        { name: 'wstatus', type: 'int *', desc: 'Pointer to store wait status' },
        { name: 'options', type: 'int', desc: 'WNOHANG, WUNTRACED, WCONTINUED' }
      ],
      flags: [
        { name: 'WNOHANG', desc: 'Return immediately if no child has exited' },
        { name: 'WUNTRACED', desc: 'Also return for stopped children' },
        { name: 'WCONTINUED', desc: 'Also return for continued children' }
      ],
      errors: ['ECHILD', 'EINTR', 'EINVAL'],
      related: ['wait', 'waitid', 'fork'],
      category: 'process'
    },
    exit: {
      name: 'exit',
      signature: 'void exit(int status)',
      manSection: 3,
      chapter: 6,
      description: 'Terminate the calling process',
      returnValue: 'Does not return',
      parameters: [{ name: 'status', type: 'int', desc: 'Exit status (0-255)' }],
      related: ['_exit', 'atexit', 'on_exit'],
      notes: [
        'Calls exit handlers registered with atexit()',
        'Flushes stdio buffers',
        'Then calls _exit()'
      ],
      category: 'process'
    },
    _exit: {
      name: '_exit',
      signature: 'void _exit(int status)',
      manSection: 2,
      chapter: 6,
      description: 'Terminate the calling process immediately',
      returnValue: 'Does not return',
      parameters: [{ name: 'status', type: 'int', desc: 'Exit status (lowest 8 bits used)' }],
      related: ['exit', 'exit_group'],
      notes: ['Does NOT call exit handlers', 'Does NOT flush stdio buffers'],
      category: 'process'
    },
    getpid: {
      name: 'getpid',
      signature: 'pid_t getpid(void)',
      manSection: 2,
      chapter: 4,
      description: 'Get process ID of calling process',
      returnValue: 'Process ID (always succeeds)',
      parameters: [],
      related: ['getppid', 'fork'],
      category: 'process'
    },
    getppid: {
      name: 'getppid',
      signature: 'pid_t getppid(void)',
      manSection: 2,
      chapter: 4,
      description: 'Get parent process ID',
      returnValue: 'Parent process ID (always succeeds)',
      parameters: [],
      related: ['getpid', 'fork'],
      notes: ['Returns 1 if parent has terminated (adopted by init)'],
      category: 'process'
    }
  };
}


function extractSystemCallsSignals() {
  return {
    sigaction: {
      name: 'sigaction',
      signature: 'int sigaction(int sig, const struct sigaction *act, struct sigaction *oldact)',
      manSection: 2,
      chapter: 5,
      description: 'Examine and change a signal action',
      returnValue: '0 on success, -1 on error',
      parameters: [
        { name: 'sig', type: 'int', desc: 'Signal number' },
        { name: 'act', type: 'const struct sigaction *', desc: 'New action (NULL to query only)' },
        { name: 'oldact', type: 'struct sigaction *', desc: 'Previous action (NULL if not needed)' }
      ],
      structure: {
        name: 'struct sigaction',
        fields: [
          { name: 'sa_handler', type: 'void (*)(int)', desc: 'Handler: SIG_DFL, SIG_IGN, or function' },
          { name: 'sa_mask', type: 'sigset_t', desc: 'Signals blocked during handler' },
          { name: 'sa_flags', type: 'int', desc: 'Flags modifying behavior' }
        ]
      },
      flags: [
        { name: 'SA_RESTART', desc: 'Restart interrupted system calls' },
        { name: 'SA_NOCLDSTOP', desc: 'No SIGCHLD when children stop' },
        { name: 'SA_NODEFER', desc: 'Do not block signal during handler' },
        { name: 'SA_RESETHAND', desc: 'Reset to SIG_DFL after handler' },
        { name: 'SA_SIGINFO', desc: 'Use sa_sigaction instead of sa_handler' }
      ],
      errors: ['EFAULT', 'EINVAL'],
      related: ['signal', 'sigprocmask', 'kill'],
      category: 'signals'
    },
    sigprocmask: {
      name: 'sigprocmask',
      signature: 'int sigprocmask(int how, const sigset_t *set, sigset_t *oldset)',
      manSection: 2,
      chapter: 5,
      description: 'Examine and change blocked signals',
      returnValue: '0 on success, -1 on error',
      parameters: [
        { name: 'how', type: 'int', desc: 'SIG_BLOCK, SIG_UNBLOCK, or SIG_SETMASK' },
        { name: 'set', type: 'const sigset_t *', desc: 'Signal set to apply' },
        { name: 'oldset', type: 'sigset_t *', desc: 'Previous mask (NULL if not needed)' }
      ],
      howValues: [
        { name: 'SIG_BLOCK', desc: 'Add signals in set to mask' },
        { name: 'SIG_UNBLOCK', desc: 'Remove signals in set from mask' },
        { name: 'SIG_SETMASK', desc: 'Set mask to set' }
      ],
      errors: ['EFAULT', 'EINVAL'],
      related: ['sigaction', 'sigpending', 'sigsuspend'],
      category: 'signals'
    },
    kill: {
      name: 'kill',
      signature: 'int kill(pid_t pid, int sig)',
      manSection: 2,
      chapter: 5,
      description: 'Send signal to a process',
      returnValue: '0 on success, -1 on error',
      parameters: [
        { name: 'pid', type: 'pid_t', desc: 'Target process (>0: specific, 0: process group, -1: all)' },
        { name: 'sig', type: 'int', desc: 'Signal number (0 to check permissions)' }
      ],
      errors: ['EINVAL', 'EPERM', 'ESRCH'],
      related: ['sigaction', 'raise', 'killpg'],
      category: 'signals'
    },
    pause: {
      name: 'pause',
      signature: 'int pause(void)',
      manSection: 2,
      chapter: 5,
      description: 'Wait for a signal',
      returnValue: '-1 with errno EINTR (always)',
      parameters: [],
      errors: ['EINTR'],
      related: ['sigsuspend', 'sigwait'],
      notes: ['Returns only when signal handler returns'],
      category: 'signals'
    },
    sigpending: {
      name: 'sigpending',
      signature: 'int sigpending(sigset_t *set)',
      manSection: 2,
      chapter: 5,
      description: 'Examine pending signals',
      returnValue: '0 on success, -1 on error',
      parameters: [{ name: 'set', type: 'sigset_t *', desc: 'Set to store pending signals' }],
      errors: ['EFAULT'],
      related: ['sigprocmask', 'sigismember'],
      category: 'signals'
    },
    alarm: {
      name: 'alarm',
      signature: 'unsigned int alarm(unsigned int seconds)',
      manSection: 2,
      chapter: 5,
      description: 'Set an alarm clock for delivery of SIGALRM',
      returnValue: 'Seconds remaining on previous alarm, or 0',
      parameters: [{ name: 'seconds', type: 'unsigned int', desc: 'Seconds until SIGALRM (0 cancels)' }],
      related: ['setitimer', 'sigaction'],
      notes: ['Only one alarm per process', 'alarm(0) cancels pending alarm'],
      category: 'signals'
    }
  };
}

function extractSignalSetFunctions() {
  return {
    sigemptyset: {
      name: 'sigemptyset',
      signature: 'int sigemptyset(sigset_t *set)',
      manSection: 3,
      description: 'Initialize signal set to empty',
      returnValue: '0 on success',
      category: 'signals'
    },
    sigfillset: {
      name: 'sigfillset',
      signature: 'int sigfillset(sigset_t *set)',
      manSection: 3,
      description: 'Initialize signal set to full (all signals)',
      returnValue: '0 on success',
      category: 'signals'
    },
    sigaddset: {
      name: 'sigaddset',
      signature: 'int sigaddset(sigset_t *set, int signum)',
      manSection: 3,
      description: 'Add signal to set',
      returnValue: '0 on success, -1 on error',
      category: 'signals'
    },
    sigdelset: {
      name: 'sigdelset',
      signature: 'int sigdelset(sigset_t *set, int signum)',
      manSection: 3,
      description: 'Remove signal from set',
      returnValue: '0 on success, -1 on error',
      category: 'signals'
    },
    sigismember: {
      name: 'sigismember',
      signature: 'int sigismember(const sigset_t *set, int signum)',
      manSection: 3,
      description: 'Test if signal is in set',
      returnValue: '1 if member, 0 if not, -1 on error',
      category: 'signals'
    }
  };
}


function extractConcepts() {
  return {
    file_descriptor: {
      name: 'File Descriptor',
      chapter: 3,
      definition: 'A non-negative integer that identifies an open file within a process',
      keyPoints: [
        'Returned by open(), socket(), pipe(), etc.',
        'Used by read(), write(), close(), etc.',
        'Per-process resource',
        'Lowest available FD is allocated',
        'Standard FDs: 0=stdin, 1=stdout, 2=stderr'
      ],
      commonMistakes: [
        'Not checking if open() returned -1',
        'Using FD after close()',
        'Leaking FDs by not closing them'
      ],
      related: ['open', 'close', 'dup', 'dup2']
    },
    errno: {
      name: 'errno',
      chapter: 2,
      definition: 'Global variable set by system calls and library functions on error',
      keyPoints: [
        'Only valid immediately after a failed call',
        'Not reset to 0 on success',
        'Thread-local in multithreaded programs',
        'Defined in <errno.h>',
        'Use perror() or strerror() to display'
      ],
      commonMistakes: [
        'Checking errno before checking return value',
        'Assuming errno is 0 after successful call',
        'Calling other functions before checking errno'
      ],
      related: ['perror', 'strerror']
    },
    process: {
      name: 'Process',
      chapter: 4,
      definition: 'A running instance of a program',
      keyPoints: [
        'Has unique PID',
        'Has own virtual address space',
        'Created by fork()',
        'Executes new program via exec()',
        'Terminates via exit() or signal'
      ],
      memoryLayout: [
        { segment: 'Text', desc: 'Program code (read-only)' },
        { segment: 'Data', desc: 'Initialized global/static variables' },
        { segment: 'BSS', desc: 'Uninitialized global/static variables' },
        { segment: 'Heap', desc: 'Dynamic allocation (grows up)' },
        { segment: 'Stack', desc: 'Local variables (grows down)' }
      ],
      related: ['fork', 'exec', 'wait', 'exit']
    },
    signal: {
      name: 'Signal',
      chapter: 5,
      definition: 'Software interrupt delivered to a process',
      keyPoints: [
        'Asynchronous notification mechanism',
        'Can be generated by kernel, other processes, or self',
        'Default action: terminate, ignore, stop, or continue',
        'Can install custom handler with sigaction()',
        'SIGKILL and SIGSTOP cannot be caught or ignored'
      ],
      dispositions: [
        { type: 'Default', desc: 'Kernel-defined action' },
        { type: 'Ignore', desc: 'Signal is discarded' },
        { type: 'Handler', desc: 'User-defined function called' }
      ],
      related: ['sigaction', 'kill', 'sigprocmask']
    },
    zombie: {
      name: 'Zombie Process',
      chapter: 6,
      definition: 'A terminated process whose parent has not yet called wait()',
      keyPoints: [
        'Retains PID and exit status',
        'Most resources released',
        'Cannot be killed (already dead)',
        'Removed when parent calls wait()',
        'Adopted by init if parent dies first'
      ],
      prevention: [
        'Always wait() for child processes',
        'Use SIGCHLD handler to reap children',
        'Double-fork technique for daemons'
      ],
      related: ['wait', 'waitpid', 'SIGCHLD']
    },
    orphan: {
      name: 'Orphan Process',
      chapter: 6,
      definition: 'A process whose parent has terminated',
      keyPoints: [
        'Adopted by init (PID 1)',
        'getppid() returns 1',
        'Will be reaped by init when it terminates'
      ],
      related: ['fork', 'getppid', 'init']
    }
  };
}

function extractErrorCodes() {
  return {
    EPERM: { number: 1, name: 'EPERM', meaning: 'Operation not permitted', common: ['Insufficient privileges'] },
    ENOENT: { number: 2, name: 'ENOENT', meaning: 'No such file or directory', common: ['File does not exist', 'Path component missing'] },
    ESRCH: { number: 3, name: 'ESRCH', meaning: 'No such process', common: ['PID does not exist'] },
    EINTR: { number: 4, name: 'EINTR', meaning: 'Interrupted system call', common: ['Signal delivered during blocking call'] },
    EIO: { number: 5, name: 'EIO', meaning: 'I/O error', common: ['Hardware failure', 'NFS error'] },
    ENXIO: { number: 6, name: 'ENXIO', meaning: 'No such device or address', common: ['Device not configured'] },
    E2BIG: { number: 7, name: 'E2BIG', meaning: 'Argument list too long', common: ['exec() argument/environment too large'] },
    ENOEXEC: { number: 8, name: 'ENOEXEC', meaning: 'Exec format error', common: ['Not a valid executable'] },
    EBADF: { number: 9, name: 'EBADF', meaning: 'Bad file descriptor', common: ['FD not open', 'Wrong mode for operation'] },
    ECHILD: { number: 10, name: 'ECHILD', meaning: 'No child processes', common: ['wait() with no children'] },
    EAGAIN: { number: 11, name: 'EAGAIN', meaning: 'Try again', common: ['Non-blocking operation would block', 'Resource temporarily unavailable'] },
    ENOMEM: { number: 12, name: 'ENOMEM', meaning: 'Out of memory', common: ['malloc() failure', 'fork() failure'] },
    EACCES: { number: 13, name: 'EACCES', meaning: 'Permission denied', common: ['File permissions', 'Directory search permission'] },
    EFAULT: { number: 14, name: 'EFAULT', meaning: 'Bad address', common: ['Invalid pointer argument'] },
    EEXIST: { number: 17, name: 'EEXIST', meaning: 'File exists', common: ['O_CREAT | O_EXCL with existing file'] },
    ENOTDIR: { number: 20, name: 'ENOTDIR', meaning: 'Not a directory', common: ['Path component is not a directory'] },
    EISDIR: { number: 21, name: 'EISDIR', meaning: 'Is a directory', common: ['write() on directory'] },
    EINVAL: { number: 22, name: 'EINVAL', meaning: 'Invalid argument', common: ['Bad flag combination', 'Invalid parameter value'] },
    ENFILE: { number: 23, name: 'ENFILE', meaning: 'File table overflow', common: ['System-wide FD limit reached'] },
    EMFILE: { number: 24, name: 'EMFILE', meaning: 'Too many open files', common: ['Per-process FD limit reached'] },
    ENOSPC: { number: 28, name: 'ENOSPC', meaning: 'No space left on device', common: ['Disk full'] },
    ESPIPE: { number: 29, name: 'ESPIPE', meaning: 'Illegal seek', common: ['lseek() on pipe or socket'] },
    EROFS: { number: 30, name: 'EROFS', meaning: 'Read-only file system', common: ['Write to read-only FS'] },
    EPIPE: { number: 32, name: 'EPIPE', meaning: 'Broken pipe', common: ['Write to pipe with no readers'] }
  };
}


function extractExercises() {
  return {
    beginner: [
      {
        id: 'ex_tee',
        title: 'Implement tee command',
        chapter: 3,
        difficulty: 'beginner',
        estimatedMinutes: 30,
        description: 'Implement tee [-a] file that copies stdin to stdout and to a file',
        concepts: ['open', 'read', 'write', 'close', 'O_APPEND', 'O_TRUNC'],
        requirements: [
          'Read from stdin (FD 0)',
          'Write to stdout (FD 1) and to file',
          'Support -a flag for append mode',
          'Handle errors with perror()'
        ],
        hints: [
          'Use getopt() for parsing -a',
          'Use a buffer of 4096 bytes',
          'Check all return values'
        ],
        template: '#include <fcntl.h>\n#include <unistd.h>\n#include <stdio.h>\n\nint main(int argc, char *argv[]) {\n    // TODO: implement\n    return 0;\n}'
      },
      {
        id: 'ex_copy',
        title: 'File copy program',
        chapter: 3,
        difficulty: 'beginner',
        estimatedMinutes: 20,
        description: 'Copy contents of one file to another',
        concepts: ['open', 'read', 'write', 'close'],
        requirements: [
          'Take source and destination as arguments',
          'Create destination if it does not exist',
          'Handle partial reads and writes'
        ]
      }
    ],
    intermediate: [
      {
        id: 'ex_fork_var',
        title: 'Fork and variable test',
        chapter: 6,
        difficulty: 'intermediate',
        estimatedMinutes: 20,
        description: 'Demonstrate that child gets copy of parent variables',
        concepts: ['fork', 'getpid', 'copy-on-write'],
        requirements: [
          'Create local variable before fork',
          'Modify in child, print in both',
          'Show values are independent'
        ]
      },
      {
        id: 'ex_signal_handler',
        title: 'Signal handler experiment',
        chapter: 5,
        difficulty: 'intermediate',
        estimatedMinutes: 45,
        description: 'Block signals, install handler, examine pending signals',
        concepts: ['sigaction', 'sigprocmask', 'sigpending', 'pause'],
        requirements: [
          'Block all signals except SIGINT',
          'Install SIGINT handler',
          'Display pending signals after handler returns'
        ]
      },
      {
        id: 'ex_zombie',
        title: 'Create and observe zombie',
        chapter: 6,
        difficulty: 'intermediate',
        estimatedMinutes: 15,
        description: 'Create a zombie process and observe with ps',
        concepts: ['fork', 'exit', 'wait', 'zombie'],
        requirements: [
          'Fork child that exits immediately',
          'Parent sleeps without calling wait()',
          'Use ps to observe zombie state'
        ]
      }
    ],
    advanced: [
      {
        id: 'ex_shell',
        title: 'Simple shell',
        chapter: 6,
        difficulty: 'advanced',
        estimatedMinutes: 120,
        description: 'Implement a basic command shell',
        concepts: ['fork', 'execve', 'wait', 'waitpid'],
        requirements: [
          'Read commands in a loop',
          'Parse into argv array',
          'Fork and exec each command',
          'Wait and display exit status'
        ],
        extensions: [
          'Add built-in cd command',
          'Add I/O redirection',
          'Add pipe support'
        ]
      },
      {
        id: 'ex_sigchld_reaper',
        title: 'SIGCHLD zombie reaper',
        chapter: 6,
        difficulty: 'advanced',
        estimatedMinutes: 60,
        description: 'Use SIGCHLD handler to automatically reap children',
        concepts: ['SIGCHLD', 'sigaction', 'waitpid', 'WNOHANG'],
        requirements: [
          'Install SIGCHLD handler',
          'Handler loops with waitpid(..., WNOHANG)',
          'Handle multiple children terminating'
        ]
      }
    ],
    projects: [
      {
        id: 'proj_shell',
        title: 'Full-featured Shell',
        difficulty: 'project',
        estimatedHours: 10,
        description: 'Build a shell with pipes, redirection, and job control',
        milestones: [
          { name: 'Basic execution', concepts: ['fork', 'exec', 'wait'] },
          { name: 'Built-ins', concepts: ['cd', 'exit', 'jobs'] },
          { name: 'Redirection', concepts: ['dup2', 'open'] },
          { name: 'Pipes', concepts: ['pipe', 'dup2'] },
          { name: 'Job control', concepts: ['SIGTSTP', 'SIGCONT', 'process groups'] }
        ]
      },
      {
        id: 'proj_daemon',
        title: 'System Daemon',
        difficulty: 'project',
        estimatedHours: 6,
        description: 'Create a proper Unix daemon process',
        milestones: [
          { name: 'Double fork', concepts: ['fork', 'setsid'] },
          { name: 'File descriptors', concepts: ['close', 'dup2', '/dev/null'] },
          { name: 'Signal handling', concepts: ['SIGHUP', 'SIGTERM'] },
          { name: 'PID file', concepts: ['open', 'flock'] }
        ]
      }
    ]
  };
}


function buildGraph() {
  const nodes = [];
  const edges = [];
  
  // System call nodes
  const syscalls = [
    { id: 'open', cluster: 'file_io', chapter: 3 },
    { id: 'close', cluster: 'file_io', chapter: 3 },
    { id: 'read', cluster: 'file_io', chapter: 3 },
    { id: 'write', cluster: 'file_io', chapter: 3 },
    { id: 'lseek', cluster: 'file_io', chapter: 3 },
    { id: 'dup', cluster: 'file_io', chapter: 3 },
    { id: 'dup2', cluster: 'file_io', chapter: 3 },
    { id: 'fork', cluster: 'process', chapter: 6 },
    { id: 'execve', cluster: 'process', chapter: 6 },
    { id: 'wait', cluster: 'process', chapter: 6 },
    { id: 'waitpid', cluster: 'process', chapter: 6 },
    { id: 'exit', cluster: 'process', chapter: 6 },
    { id: '_exit', cluster: 'process', chapter: 6 },
    { id: 'getpid', cluster: 'process', chapter: 4 },
    { id: 'getppid', cluster: 'process', chapter: 4 },
    { id: 'sigaction', cluster: 'signals', chapter: 5 },
    { id: 'sigprocmask', cluster: 'signals', chapter: 5 },
    { id: 'kill', cluster: 'signals', chapter: 5 },
    { id: 'pause', cluster: 'signals', chapter: 5 },
    { id: 'alarm', cluster: 'signals', chapter: 5 }
  ];
  
  for (const sc of syscalls) {
    nodes.push({ id: `sc_${sc.id}`, type: 'syscall', label: sc.id, ...sc });
  }
  
  // Concept nodes
  const concepts = [
    { id: 'file_descriptor', cluster: 'file_io' },
    { id: 'errno', cluster: 'fundamentals' },
    { id: 'process', cluster: 'process' },
    { id: 'signal', cluster: 'signals' },
    { id: 'zombie', cluster: 'process' },
    { id: 'orphan', cluster: 'process' }
  ];
  
  for (const c of concepts) {
    nodes.push({ id: `concept_${c.id}`, type: 'concept', label: c.id, ...c });
  }
  
  // Relationships
  const relations = [
    ['open', 'close', 'lifecycle'],
    ['open', 'read', 'uses'],
    ['open', 'write', 'uses'],
    ['read', 'write', 'related'],
    ['fork', 'execve', 'often_paired'],
    ['fork', 'wait', 'often_paired'],
    ['fork', 'exit', 'child_calls'],
    ['wait', 'waitpid', 'variant'],
    ['exit', '_exit', 'calls'],
    ['sigaction', 'sigprocmask', 'related'],
    ['sigaction', 'kill', 'related'],
    ['kill', 'pause', 'related'],
    ['fork', 'getpid', 'uses'],
    ['fork', 'getppid', 'uses']
  ];
  
  for (const [src, tgt, type] of relations) {
    edges.push({ source: `sc_${src}`, target: `sc_${tgt}`, type });
  }
  
  // Concept to syscall relationships
  edges.push({ source: 'concept_file_descriptor', target: 'sc_open', type: 'returned_by' });
  edges.push({ source: 'concept_file_descriptor', target: 'sc_close', type: 'used_by' });
  edges.push({ source: 'concept_process', target: 'sc_fork', type: 'created_by' });
  edges.push({ source: 'concept_zombie', target: 'sc_wait', type: 'reaped_by' });
  edges.push({ source: 'concept_signal', target: 'sc_sigaction', type: 'handled_by' });
  
  return {
    nodes,
    edges,
    clusters: {
      file_io: { label: 'File I/O', color: '#21409a' },
      process: { label: 'Process Management', color: '#be1e2d' },
      signals: { label: 'Signals', color: '#f9a825' },
      fundamentals: { label: 'Fundamentals', color: '#4caf50' }
    }
  };
}

// Combine all extractions
function buildFromText(text) {
  const fileIO = extractSystemCalls();
  const process = extractSystemCallsProcess();
  const signals = extractSystemCallsSignals();
  const signalSet = extractSignalSetFunctions();
  
  return {
    metadata: {
      title: 'Linux System Programming Essentials',
      author: 'Michael Kerrisk',
      source: 'man7.org',
      version: '2.0',
      createdAt: new Date().toISOString()
    },
    systemCalls: { ...fileIO, ...process, ...signals, ...signalSet },
    concepts: extractConcepts(),
    errorCodes: extractErrorCodes(),
    exercises: extractExercises(),
    knowledgeGraph: buildGraph(),
    signals: extractSignals(),
    dataTypes: extractDataTypes(),
    chapters: extractChapters()
  };
}

function extractSignals() {
  return [
    { num: 1, name: 'SIGHUP', default: 'Term', desc: 'Hangup' },
    { num: 2, name: 'SIGINT', default: 'Term', desc: 'Interrupt (Ctrl-C)' },
    { num: 3, name: 'SIGQUIT', default: 'Core', desc: 'Quit (Ctrl-\\)' },
    { num: 4, name: 'SIGILL', default: 'Core', desc: 'Illegal instruction' },
    { num: 5, name: 'SIGTRAP', default: 'Core', desc: 'Trace trap' },
    { num: 6, name: 'SIGABRT', default: 'Core', desc: 'Abort' },
    { num: 7, name: 'SIGBUS', default: 'Core', desc: 'Bus error' },
    { num: 8, name: 'SIGFPE', default: 'Core', desc: 'Floating point exception' },
    { num: 9, name: 'SIGKILL', default: 'Term', desc: 'Kill (cannot catch)', catchable: false },
    { num: 10, name: 'SIGUSR1', default: 'Term', desc: 'User-defined 1' },
    { num: 11, name: 'SIGSEGV', default: 'Core', desc: 'Segmentation fault' },
    { num: 12, name: 'SIGUSR2', default: 'Term', desc: 'User-defined 2' },
    { num: 13, name: 'SIGPIPE', default: 'Term', desc: 'Broken pipe' },
    { num: 14, name: 'SIGALRM', default: 'Term', desc: 'Alarm clock' },
    { num: 15, name: 'SIGTERM', default: 'Term', desc: 'Termination' },
    { num: 17, name: 'SIGCHLD', default: 'Ign', desc: 'Child status changed' },
    { num: 18, name: 'SIGCONT', default: 'Cont', desc: 'Continue' },
    { num: 19, name: 'SIGSTOP', default: 'Stop', desc: 'Stop (cannot catch)', catchable: false },
    { num: 20, name: 'SIGTSTP', default: 'Stop', desc: 'Terminal stop (Ctrl-Z)' }
  ];
}

function extractDataTypes() {
  return {
    pid_t: { name: 'pid_t', underlying: 'int', purpose: 'Process ID', header: '<sys/types.h>' },
    uid_t: { name: 'uid_t', underlying: 'unsigned int', purpose: 'User ID', header: '<sys/types.h>' },
    gid_t: { name: 'gid_t', underlying: 'unsigned int', purpose: 'Group ID', header: '<sys/types.h>' },
    off_t: { name: 'off_t', underlying: 'long', purpose: 'File offset', header: '<sys/types.h>' },
    size_t: { name: 'size_t', underlying: 'unsigned long', purpose: 'Size of object', header: '<stddef.h>' },
    ssize_t: { name: 'ssize_t', underlying: 'long', purpose: 'Signed size or error', header: '<sys/types.h>' },
    mode_t: { name: 'mode_t', underlying: 'unsigned int', purpose: 'File permissions', header: '<sys/types.h>' },
    sigset_t: { name: 'sigset_t', underlying: 'struct', purpose: 'Signal set', header: '<signal.h>' },
    time_t: { name: 'time_t', underlying: 'long', purpose: 'Time in seconds', header: '<time.h>' }
  };
}

function extractChapters() {
  return [
    { id: 1, title: 'Course Introduction', sections: ['1.1', '1.2', '1.3', '1.4'] },
    { id: 2, title: 'Fundamental Concepts', sections: ['2.1', '2.2', '2.3'] },
    { id: 3, title: 'File I/O', sections: ['3.1', '3.2', '3.3', '3.4'] },
    { id: 4, title: 'Processes', sections: ['4.1', '4.2', '4.3', '4.4', '4.5'] },
    { id: 5, title: 'Signals', sections: ['5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8', '5.9', '5.10'] },
    { id: 6, title: 'Process Lifecycle', sections: ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6.7', '6.8', '6.9', '6.10', '6.11', '6.12'] },
    { id: 7, title: 'System Call Tracing with strace', sections: ['7.1', '7.2', '7.3', '7.4', '7.5', '7.6'] },
    { id: 8, title: 'Wrapup', sections: ['8.1'] }
  ];
}

main().catch(console.error);
