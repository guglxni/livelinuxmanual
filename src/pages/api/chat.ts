import type { NextApiRequest, NextApiResponse } from 'next';
import { chatWithOpenRouter } from '../../lib/openrouter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { question, context } = req.body;
  if (!question) return res.status(400).json({ error: 'question required' });

  try {
    const systemPrompt = `You are an expert Linux system programming tutor. You help students understand concepts from Michael Kerrisk's "Linux System Programming Essentials" course.

Your responses should be:
- Clear and technically accurate
- Include code examples in C when helpful
- Reference relevant system calls and their man page sections
- Explain concepts step by step

Current lesson context: ${context || 'General Linux system programming'}

When showing code, use proper C syntax. When mentioning system calls, include the man section like open(2) or fork(2).`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ];

    const answer = await chatWithOpenRouter(messages);
    res.json({ answer });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || 'Chat failed' });
  }
}
