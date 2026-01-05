import { Layout } from '../components/Layout';
import { SignalTable } from '../components/SignalTable';
import { AsciiDiagram } from '../components/AsciiDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { DIAGRAMS } from '../lib/diagon';

const SIGNAL_HANDLER_EXAMPLE = `#include <signal.h>
#include <stdio.h>
#include <unistd.h>

volatile sig_atomic_t got_signal = 0;

static void handler(int sig) {
    got_signal = 1;
}

int main(void) {
    struct sigaction sa;
    
    sa.sa_handler = handler;
    sa.sa_flags = 0;
    sigemptyset(&sa.sa_mask);
    
    if (sigaction(SIGINT, &sa, NULL) == -1) {
        perror("sigaction");
        return 1;
    }
    
    printf("PID: %ld\\n", (long)getpid());
    printf("Press Ctrl-C...\\n");
    
    while (!got_signal)
        pause();
    
    printf("\\nCaught SIGINT!\\n");
    return 0;
}`;

const SIGPROCMASK_EXAMPLE = `sigset_t block_set, old_set;

// Initialize empty set
sigemptyset(&block_set);

// Add SIGINT to the set
sigaddset(&block_set, SIGINT);

// Block SIGINT, save old mask
sigprocmask(SIG_BLOCK, &block_set, &old_set);

/* Critical section - SIGINT blocked */

// Restore old mask (unblock SIGINT)
sigprocmask(SIG_SETMASK, &old_set, NULL);`;

export default function Signals() {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-bauhaus-red flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-bauhaus-dark-gray">
              Chapter 5
            </div>
            <h1 className="text-2xl font-bold">Signals Reference</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Signal Flow Diagram */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-l-4 border-bauhaus-blue pl-4">
              Signal Lifecycle
            </h2>
            <AsciiDiagram content={DIAGRAMS.signalFlow} title="Signal Generation to Delivery" accent="blue" />
          </section>

          {/* Signal Table */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-l-4 border-bauhaus-yellow pl-4">
              Common Signals
            </h2>
            <SignalTable />
          </section>

          {/* Signal Handler Example */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-l-4 border-bauhaus-red pl-4">
              Signal Handler Pattern
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-bauhaus-dark-gray mb-2">
                  Basic Handler with sigaction()
                </h3>
                <CodeBlock code={SIGNAL_HANDLER_EXAMPLE} language="c" />
              </div>
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-bauhaus-dark-gray mb-2">
                  Blocking Signals with sigprocmask()
                </h3>
                <CodeBlock code={SIGPROCMASK_EXAMPLE} language="c" />
              </div>
            </div>
          </section>

          {/* Key Points */}
          <section className="border-2 border-bauhaus-black p-6">
            <h2 className="text-xl font-bold mb-4">Key Points</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-bauhaus-red mt-2 flex-shrink-0"></div>
                <span><strong>SIGKILL (9)</strong> and <strong>SIGSTOP (19)</strong> cannot be caught, blocked, or ignored</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-bauhaus-blue mt-2 flex-shrink-0"></div>
                <span>Standard signals are <strong>not queued</strong> - multiple signals of same type while blocked result in single delivery</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-bauhaus-yellow mt-2 flex-shrink-0"></div>
                <span>Use <strong>sig_atomic_t</strong> for variables accessed by both handler and main program</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-bauhaus-black mt-2 flex-shrink-0"></div>
                <span>Signal handlers should be <strong>async-signal-safe</strong> - see signal-safety(7)</span>
              </li>
            </ul>
          </section>

          {/* API Quick Reference */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-l-4 border-bauhaus-blue pl-4">
              API Quick Reference
            </h2>
            <div className="bg-bauhaus-black text-bauhaus-white p-4 font-mono text-sm overflow-x-auto">
              <div className="mb-2">// Change signal disposition</div>
              <div className="text-yellow-400">int sigaction(int sig, const struct sigaction *act, struct sigaction *oldact);</div>
              <div className="mt-4 mb-2">// Modify signal mask</div>
              <div className="text-yellow-400">int sigprocmask(int how, const sigset_t *set, sigset_t *oldset);</div>
              <div className="text-gray-500 ml-4">// how: SIG_BLOCK, SIG_UNBLOCK, SIG_SETMASK</div>
              <div className="mt-4 mb-2">// Signal set operations</div>
              <div className="text-yellow-400">int sigemptyset(sigset_t *set);</div>
              <div className="text-yellow-400">int sigfillset(sigset_t *set);</div>
              <div className="text-yellow-400">int sigaddset(sigset_t *set, int sig);</div>
              <div className="text-yellow-400">int sigdelset(sigset_t *set, int sig);</div>
              <div className="text-yellow-400">int sigismember(const sigset_t *set, int sig);</div>
              <div className="mt-4 mb-2">// Wait for signal</div>
              <div className="text-yellow-400">int pause(void);</div>
              <div className="text-yellow-400">int sigpending(sigset_t *set);</div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
