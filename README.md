# Live Linux Manual

An interactive, comprehensive learning platform for Linux System Programming based on Michael Kerrisk's "Linux System Programming Essentials" course.

## Features

### Learning Experience
- Interactive curriculum with 8 chapters covering File I/O, Processes, Signals, and more
- AI-powered chat assistant for contextual help
- Spaced repetition quizzes for concept mastery
- Progress tracking with XP and achievements
- Skill tree visualization

### Technical Reference
- Comprehensive API reference for system calls
- Signal reference table with all standard signals
- Error code (errno) documentation
- strace usage guide

### Visual Learning
- Bauhaus-inspired minimal design
- ASCII diagrams using Diagon-style rendering:
  - Process memory layout
  - Fork/exec lifecycle
  - Signal flow
  - File descriptor tables
  - Wait status encoding
  - Pipe communication
  - Process states

### Progress Tracking
- Section completion tracking
- Concept mastery levels (0-5)
- XP and leveling system
- Achievement badges
- Learning streaks

## Tech Stack

- Next.js 15 with React 18
- TypeScript
- Bauhaus CSS design system
- localStorage for progress persistence
- OpenRouter API for AI chat

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

```
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=mistralai/mistral-7b-instruct
```

## Project Structure

```
src/
  components/
    Layout.tsx          # Main layout with navigation
    Sidebar.tsx         # Chapter/section navigation
    LessonContent.tsx   # Lesson display
    ChatPanel.tsx       # AI assistant
    CodeBlock.tsx       # Syntax-highlighted code
    AsciiDiagram.tsx    # ASCII diagram renderer
    Terminal.tsx        # Interactive terminal
    KnowledgeGraph.tsx  # Interactive graph visualization
    SkillTree.tsx       # Skill progression tree
    ProgressDashboard.tsx # Progress overview
    QuickQuiz.tsx       # Spaced repetition quizzes
    SignalTable.tsx     # Signal reference
    ErrnoTable.tsx      # Error code reference
  lib/
    diagon.ts           # ASCII diagram generator
    progress.ts         # Progress tracking system
  pages/
    index.tsx           # Main learning page
    dashboard.tsx       # Progress dashboard
    reference.tsx       # API reference
    signals.tsx         # Signal reference
    strace.tsx          # strace guide
    exercises.tsx       # Practice exercises
  styles/
    globals.css         # Bauhaus design system
content/
  knowledge-base.json   # Comprehensive knowledge base
  linux-curriculum.json # Course curriculum
  knowledge-graph.json  # Concept relationships
```

## Design System

The platform uses a Bauhaus-inspired design with:
- Primary colors: Red (#be1e2d), Blue (#21409a), Yellow (#f9a825)
- IBM Plex Sans/Mono typography
- Geometric shapes and clean lines
- High contrast for readability

## Knowledge Base

The knowledge base includes:
- 20+ system calls with full documentation
- 6 core concepts (File Descriptors, errno, Process, Signal, Zombie, Orphan)
- 30+ error codes
- 20+ signals
- 10+ exercises at beginner/intermediate/advanced levels
- 2 comprehensive projects

## Contributing

Contributions welcome! Please read the contributing guidelines first.

## License

MIT

## Credits

Based on Michael Kerrisk's "Linux System Programming Essentials" course from man7.org.
