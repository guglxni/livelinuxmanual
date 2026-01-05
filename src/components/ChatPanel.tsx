import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  context?: string;
}

export function ChatPanel({ context }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: userMessage,
          context: context 
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer || 'No response' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error connecting to assistant.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full border-l-2 border-bauhaus-black bg-bauhaus-white">
      <div className="p-3 border-b-2 border-bauhaus-black flex items-center gap-2">
        <div className="w-3 h-3 bg-bauhaus-blue rounded-full"></div>
        <span className="font-semibold text-sm uppercase tracking-wider">Assistant</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-bauhaus-dark-gray text-sm">
            Ask questions about Linux system programming. The assistant has context from the current lesson.
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${
              msg.role === 'user'
                ? 'bg-bauhaus-gray'
                : 'bg-bauhaus-black text-bauhaus-white'
            } p-3 text-sm`}
          >
            <div className="text-xs font-mono uppercase mb-1 opacity-60">
              {msg.role === 'user' ? 'You' : 'Assistant'}
            </div>
            <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="bg-bauhaus-black text-bauhaus-white p-3">
            <div className="text-xs font-mono uppercase mb-1 opacity-60">Assistant</div>
            <div className="flex gap-1">
              <span className="animate-pulse">.</span>
              <span className="animate-pulse delay-100">.</span>
              <span className="animate-pulse delay-200">.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t-2 border-bauhaus-black">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this topic..."
            className="flex-1 px-3 py-2 border-2 border-bauhaus-black font-mono text-sm focus:outline-none focus:border-bauhaus-blue"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-bauhaus-black text-bauhaus-white font-semibold text-sm uppercase tracking-wider hover:bg-bauhaus-blue transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatPanel;
