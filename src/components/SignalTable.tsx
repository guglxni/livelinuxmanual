import React from 'react';

const SIGNALS = [
  { num: 1, name: 'SIGHUP', default: 'Term', desc: 'Hangup detected on controlling terminal' },
  { num: 2, name: 'SIGINT', default: 'Term', desc: 'Interrupt from keyboard (Ctrl-C)' },
  { num: 3, name: 'SIGQUIT', default: 'Core', desc: 'Quit from keyboard (Ctrl-\\)' },
  { num: 4, name: 'SIGILL', default: 'Core', desc: 'Illegal instruction' },
  { num: 6, name: 'SIGABRT', default: 'Core', desc: 'Abort signal from abort(3)' },
  { num: 8, name: 'SIGFPE', default: 'Core', desc: 'Floating-point exception' },
  { num: 9, name: 'SIGKILL', default: 'Term', desc: 'Kill signal (cannot be caught)' },
  { num: 11, name: 'SIGSEGV', default: 'Core', desc: 'Invalid memory reference' },
  { num: 13, name: 'SIGPIPE', default: 'Term', desc: 'Broken pipe' },
  { num: 14, name: 'SIGALRM', default: 'Term', desc: 'Timer signal from alarm(2)' },
  { num: 15, name: 'SIGTERM', default: 'Term', desc: 'Termination signal' },
  { num: 17, name: 'SIGCHLD', default: 'Ign', desc: 'Child stopped or terminated' },
  { num: 18, name: 'SIGCONT', default: 'Cont', desc: 'Continue if stopped' },
  { num: 19, name: 'SIGSTOP', default: 'Stop', desc: 'Stop process (cannot be caught)' },
  { num: 20, name: 'SIGTSTP', default: 'Stop', desc: 'Stop typed at terminal (Ctrl-Z)' },
];

export function SignalTable() {
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-2 border-bauhaus-black font-mono text-sm">
        <thead>
          <tr className="bg-bauhaus-black text-bauhaus-white">
            <th className="p-2 text-left border-r border-bauhaus-dark-gray">#</th>
            <th className="p-2 text-left border-r border-bauhaus-dark-gray">Signal</th>
            <th className="p-2 text-left border-r border-bauhaus-dark-gray">Default</th>
            <th className="p-2 text-left">Description</th>
          </tr>
        </thead>
        <tbody>
          {SIGNALS.map((sig, idx) => (
            <tr key={sig.num} className={idx % 2 === 0 ? 'bg-bauhaus-white' : 'bg-bauhaus-gray'}>
              <td className="p-2 border-r border-bauhaus-gray">{sig.num}</td>
              <td className="p-2 border-r border-bauhaus-gray font-semibold">
                <span className={
                  sig.name === 'SIGKILL' || sig.name === 'SIGSTOP' 
                    ? 'text-bauhaus-red' 
                    : ''
                }>
                  {sig.name}
                </span>
              </td>
              <td className="p-2 border-r border-bauhaus-gray">
                <span className={`px-1 ${
                  sig.default === 'Term' ? 'bg-red-200' :
                  sig.default === 'Core' ? 'bg-yellow-200' :
                  sig.default === 'Stop' ? 'bg-blue-200' :
                  sig.default === 'Ign' ? 'bg-gray-200' : ''
                }`}>
                  {sig.default}
                </span>
              </td>
              <td className="p-2">{sig.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 text-xs text-bauhaus-dark-gray">
        Term=Terminate, Core=Core dump, Stop=Stop process, Ign=Ignore, Cont=Continue
      </div>
    </div>
  );
}

export default SignalTable;
