# Live Linux Manual

An interactive learning platform for Linux System Programming, based on Michael Kerrisk's "Linux System Programming Essentials" course.

## Design

Bauhaus-inspired minimal interface with:
- Geometric shapes and primary colors (red, blue, yellow)
- Clean typography using IBM Plex fonts
- ASCII diagrams powered by Diagon-style rendering
- RAG-powered AI assistant for contextual help

## Features

- Structured curriculum covering File I/O, Processes, Signals, Process Lifecycle, and strace
- Interactive code examples with syntax highlighting
- ASCII art diagrams for memory layout, fork/exec lifecycle, signal flow
- Exercises with templates and hints
- AI chat assistant with lesson context

## Stack

- Next.js 15 + TypeScript
- Custom CSS (Bauhaus design system)
- OpenRouter for LLM chat
- Qdrant for vector search (RAG)
- Hugging Face embeddings

## Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your API keys

# Run development server
npm run dev
```

## Environment Variables

```
OPENROUTER_API_KEY=your_key
OPENROUTER_MODEL=mistral-7b-instruct
HUGGINGFACE_API_TOKEN=your_token
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_key
QDRANT_COLLECTION=ls_content
```

## Curriculum Source

Content derived from "Linux System Programming Essentials" by Michael Kerrisk (man7.org).

## License

Educational use only. Course materials copyright Michael Kerrisk.
