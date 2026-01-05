import React, { useState } from 'react';

const ERRNO_LIST = [
  { num: 1, name: 'EPERM', desc: 'Operation not permitted' },
  { num: 2, name: 'ENOENT', desc: 'No such file or directory' },
  { num: 3, name: 'ESRCH', desc: 'No such process' },
  { num: 4, name: 'EINTR', desc: 'Interrupted system call' },
  { num: 5, name: 'EIO', desc: 'I/O error' },
  { num: 9, name: 'EBADF', desc: 'Bad file descriptor' },
  { num: 10, name: 'ECHILD', desc: 'No child processes' },
  { num: 11, name: 'EAGAIN', desc: 'Try again (also EWOULDBLOCK)' },
  { num: 12, name: 'ENOMEM', desc: 'Out of memory' },
  { num: 13, name: 'EACCES', desc: 'Permission denied' },
  { num: 14, name: 'EFAULT', desc: 'Bad address' },
  { num: 17, name: 'EEXIST', desc: 'File exists' },
  { num: 20, name: 'ENOTDIR', desc: 'Not a directory' },
  { num: 21, name: 'EISDIR', desc: 'Is a directory' },
  { num: 22, name: 'EINVAL', desc: 'Invalid argument' },
  { num: 23, name: 'ENFILE', desc: 'File table overflow' },
  { num: 24, name: 'EMFILE', desc: 'Too many open files' },
  { num: 28, name: 'ENOSPC', desc: 'No space left on device' },
  { num: 30, name: 'EROFS', desc: 'Read-only file system' },
  { num: 32, name: 'EPIPE', desc: 'Broken pipe' },
];

export function ErrnoTable() {
  const [filter, setFilter] = useState('');
  
  const filtered = ERRNO_LIST.filter(e => 
    e.name.toLowerCase().includes(filter.toLowerCase()) ||
    e.desc.toLowerCase().includes(filter.toLowerCase()) ||
    e.num.toString().includes(filter)
  );

  return (
    <div className="my-4">
      <div className="mb-3">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by name, number, or description..."
          className="w-full px-3 py-2 border-2 border-bauhaus-black font-mono text-sm"
        />
      </div>
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full border-2 border-bauhaus-black font-mono text-sm">
          <thead className="sticky top-0">
            <tr className="bg-bauhaus-black text-bauhaus-white">
              <th className="p-2 text-left border-r border-bauhaus-dark-gray w-16">#</th>
              <th className="p-2 text-left border-r border-bauhaus-dark-gray w-32">Name</th>
              <th className="p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((err, idx) => (
              <tr key={err.num} className={idx % 2 === 0 ? 'bg-bauhaus-white' : 'bg-bauhaus-gray'}>
                <td className="p-2 border-r border-bauhaus-gray">{err.num}</td>
                <td className="p-2 border-r border-bauhaus-gray font-semibold text-bauhaus-red">
                  {err.name}
                </td>
                <td className="p-2">{err.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-bauhaus-dark-gray">
        Use errno(1) command or check &lt;errno.h&gt; for complete list
      </div>
    </div>
  );
}

export default ErrnoTable;
