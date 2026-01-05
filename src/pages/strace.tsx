import { Layout } from '../components/Layout';
import { AsciiDiagram } from '../components/AsciiDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Terminal } from '../components/Terminal';
import { DIAGRAMS } from '../lib/diagon';

const STRACE_OPTIONS = [
  { opt: '-o file', desc: 'Write output to file instead of stderr' },
  { opt: '-f', desc: 'Follow child processes created by fork()' },
  { opt: '-p PID', desc: 'Attach to running process with given PID' },
  { opt: '-e trace=set', desc: 'Trace only specified syscalls (e.g., open,close)' },
  { opt: '-e trace=%file', desc: 'Trace file-related syscalls' },
  { opt: '-e trace=%process', desc: 'Trace process management syscalls' },
  { opt: '-e trace=%network', desc: 'Trace network-related syscalls' },
  { opt: '-e trace=%signal', desc: 'Trace signal-related syscalls' },
  { opt: '-P path', desc: 'Trace only syscalls accessing given path' },
  { opt: '-y', desc: 'Show pathnames for file descriptors' },
  { opt: '-yy', desc: 'Show protocol info for sockets' },
  { opt: '-c', desc: 'Count time, calls, and errors per syscall' },
  { opt: '-t / -tt', desc: 'Show timestamp (with microseconds)' },
  { opt: '-T', desc: 'Show time spent in each syscall' },
  { opt: '-v', desc: 'Verbose output (don\'t abbreviate)' },
  { opt: '-s N', desc: 'Maximum string size to print (default 32)' },
];

const INJECT_EXAMPLE = `# Inject ENOENT error on 3rd close() call
strace -e close -e inject=close:error=2:when=3 ./program

# Inject delay before syscall
strace -e inject=read:delay_enter=1000000 ./program

# Make open() return success without executing
strace -e inject=open:retval=3 ./program`;

export default function Strace() {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-bauhaus-blue flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-bauhaus-dark-gray">
              Chapter 7
            </div>
            <h1 className="text-2xl font-bold">strace Reference</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Output Format */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-l-4 border-bauhaus-yellow pl-4">
              Output Format
            </h2>
            <AsciiDiagram content={DIAGRAMS.straceOutput} title="Understanding strace Output" accent="yellow" />
          </section>

          {/* Basic Usage */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-l-4 border-bauhaus-blue pl-4">
              Basic Usage
            </h2>
            <div className="bg-bauhaus-black text-bauhaus-white p-4 font-mono text-sm space-y-4">
              <div>
                <span className="text-gray-500"># Trace a command</span>
                <div className="text-green-400">$ strace ls</div>
              </div>
              <div>
                <span className="text-gray-500"># Save output to file</span>
                <div className="text-green-400">$ strace -o trace.log ./program</div>
              </div>
              <div>
                <span className="text-gray-500"># Attach to running process</span>
                <div className="text-green-400">$ strace -p 1234</div>
              </div>
              <div>
                <span className="text-gray-500"># Follow child processes</span>
                <div className="text-green-400">$ strace -f ./program</div>
              </div>
            </div>
          </section>

          {/* Options Table */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-l-4 border-bauhaus-red pl-4">
              Common Options
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-2 border-bauhaus-black font-mono text-sm">
                <thead>
                  <tr className="bg-bauhaus-black text-bauhaus-white">
                    <th className="p-3 text-left border-r border-bauhaus-dark-gray w-40">Option</th>
                    <th className="p-3 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {STRACE_OPTIONS.map((opt, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-bauhaus-white' : 'bg-bauhaus-gray'}>
                      <td className="p-3 border-r border-bauhaus-gray font-semibold text-bauhaus-blue">
                        {opt.opt}
                      </td>
                      <td className="p-3">{opt.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Filtering */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-l-4 border-bauhaus-yellow pl-4">
              Filtering Examples
            </h2>
            <div className="bg-bauhaus-black text-bauhaus-white p-4 font-mono text-sm space-y-4">
              <div>
                <span className="text-gray-500"># Trace only open and close</span>
                <div className="text-green-400">$ strace -e trace=open,close ls</div>
              </div>
              <div>
                <span className="text-gray-500"># Trace all file operations</span>
                <div className="text-green-400">$ strace -e trace=%file ls</div>
              </div>
              <div>
                <span className="text-gray-500"># Exclude specific syscalls</span>
                <div className="text-green-400">$ strace -e trace=!mmap,mprotect ls</div>
              </div>
              <div>
                <span className="text-gray-500"># Trace access to specific file</span>
                <div className="text-green-400">$ strace -P /etc/passwd cat /etc/passwd</div>
              </div>
              <div>
                <span className="text-gray-500"># Show file paths for FDs</span>
                <div className="text-green-400">$ strace -y cat /etc/passwd</div>
              </div>
            </div>
          </section>

          {/* Error Injection */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-l-4 border-bauhaus-red pl-4">
              System Call Tampering
            </h2>
            <p className="mb-4 text-bauhaus-dark-gray">
              strace can inject errors or modify syscall behavior for testing:
            </p>
            <CodeBlock code={INJECT_EXAMPLE} language="bash" title="Injection Examples" />
            <div className="mt-4 p-4 border-2 border-bauhaus-yellow bg-yellow-50">
              <strong>Inject Options:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li><code className="bg-bauhaus-gray px-1">:error=N</code> - Return -1 with errno=N</li>
                <li><code className="bg-bauhaus-gray px-1">:retval=N</code> - Return N (success)</li>
                <li><code className="bg-bauhaus-gray px-1">:delay_enter=us</code> - Delay before syscall</li>
                <li><code className="bg-bauhaus-gray px-1">:delay_exit=us</code> - Delay after syscall</li>
                <li><code className="bg-bauhaus-gray px-1">:when=N</code> - Apply to Nth invocation</li>
              </ul>
            </div>
          </section>

          {/* Summary Statistics */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-l-4 border-bauhaus-blue pl-4">
              Summary Statistics
            </h2>
            <div className="bg-bauhaus-black text-bauhaus-white p-4 font-mono text-sm">
              <div className="text-gray-500 mb-2"># Get syscall statistics</div>
              <div className="text-green-400 mb-4">$ strace -c ls</div>
              <pre className="text-gray-300">{`% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- --------
 25.00    0.000012           6         2           read
 20.83    0.000010           5         2           write
 16.67    0.000008           4         2           close
 12.50    0.000006           3         2           fstat
 12.50    0.000006           3         2           mmap
 12.50    0.000006           2         3         1 open
------ ----------- ----------- --------- --------- --------
100.00    0.000048                    13         1 total`}</pre>
            </div>
          </section>

          {/* Tips */}
          <section className="border-2 border-bauhaus-black p-6">
            <h2 className="text-xl font-bold mb-4">Tips</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-bauhaus-red mt-2 flex-shrink-0"></div>
                <span>strace adds significant overhead - timing measurements are indicative only</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-bauhaus-blue mt-2 flex-shrink-0"></div>
                <span>May need <code className="bg-bauhaus-gray px-1">echo 0 &gt; /proc/sys/kernel/yama/ptrace_scope</code> to trace other users' processes</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-bauhaus-yellow mt-2 flex-shrink-0"></div>
                <span>glibc wrappers may call different syscalls than expected (e.g., fork() calls clone())</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-bauhaus-black mt-2 flex-shrink-0"></div>
                <span>Use <code className="bg-bauhaus-gray px-1">-k</code> to see stack traces for each syscall</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
}
