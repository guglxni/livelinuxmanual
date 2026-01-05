/**
 * User Progress Tracking System
 * Stores learning progress in localStorage with spaced repetition support
 */

export interface ConceptProgress {
  id: string;
  name: string;
  level: number; // 0-5 mastery level
  lastReviewed: string;
  nextReview: string;
  reviewCount: number;
  correctCount: number;
  streak: number;
}

export interface SectionProgress {
  id: string;
  completed: boolean;
  completedAt?: string;
  timeSpent: number; // seconds
  quizScore?: number;
}

export interface UserProgress {
  userId: string;
  startedAt: string;
  lastActive: string;
  totalTimeSpent: number;
  sections: Record<string, SectionProgress>;
  concepts: Record<string, ConceptProgress>;
  achievements: string[];
  currentStreak: number;
  longestStreak: number;
  xp: number;
  level: number;
}

const STORAGE_KEY = 'linux_manual_progress';
const XP_PER_SECTION = 50;
const XP_PER_CONCEPT = 25;
const XP_PER_QUIZ = 100;

// Spaced repetition intervals (in days)
const SR_INTERVALS = [1, 3, 7, 14, 30, 60];

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') return createDefaultProgress();
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const progress = createDefaultProgress();
    saveProgress(progress);
    return progress;
  }
  
  return JSON.parse(stored);
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  progress.lastActive = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function createDefaultProgress(): UserProgress {
  return {
    userId: generateUserId(),
    startedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    totalTimeSpent: 0,
    sections: {},
    concepts: {},
    achievements: [],
    currentStreak: 0,
    longestStreak: 0,
    xp: 0,
    level: 1
  };
}

function generateUserId(): string {
  return 'user_' + Math.random().toString(36).substring(2, 15);
}

export function markSectionComplete(sectionId: string): UserProgress {
  const progress = getProgress();
  
  if (!progress.sections[sectionId]?.completed) {
    progress.sections[sectionId] = {
      id: sectionId,
      completed: true,
      completedAt: new Date().toISOString(),
      timeSpent: progress.sections[sectionId]?.timeSpent || 0
    };
    progress.xp += XP_PER_SECTION;
    progress.level = calculateLevel(progress.xp);
    checkAchievements(progress);
  }
  
  saveProgress(progress);
  return progress;
}

export function updateSectionTime(sectionId: string, seconds: number): void {
  const progress = getProgress();
  
  if (!progress.sections[sectionId]) {
    progress.sections[sectionId] = {
      id: sectionId,
      completed: false,
      timeSpent: 0
    };
  }
  
  progress.sections[sectionId].timeSpent += seconds;
  progress.totalTimeSpent += seconds;
  
  saveProgress(progress);
}

export function updateConceptMastery(
  conceptId: string, 
  conceptName: string, 
  correct: boolean
): UserProgress {
  const progress = getProgress();
  const now = new Date();
  
  if (!progress.concepts[conceptId]) {
    progress.concepts[conceptId] = {
      id: conceptId,
      name: conceptName,
      level: 0,
      lastReviewed: now.toISOString(),
      nextReview: now.toISOString(),
      reviewCount: 0,
      correctCount: 0,
      streak: 0
    };
  }
  
  const concept = progress.concepts[conceptId];
  concept.reviewCount++;
  concept.lastReviewed = now.toISOString();
  
  if (correct) {
    concept.correctCount++;
    concept.streak++;
    
    // Level up if streak is good
    if (concept.streak >= 2 && concept.level < 5) {
      concept.level++;
      progress.xp += XP_PER_CONCEPT;
    }
    
    // Calculate next review using spaced repetition
    const intervalDays = SR_INTERVALS[Math.min(concept.level, SR_INTERVALS.length - 1)];
    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + intervalDays);
    concept.nextReview = nextReview.toISOString();
  } else {
    concept.streak = 0;
    // Reset level slightly on wrong answer
    if (concept.level > 0) concept.level--;
    // Review again soon
    concept.nextReview = now.toISOString();
  }
  
  progress.level = calculateLevel(progress.xp);
  checkAchievements(progress);
  saveProgress(progress);
  
  return progress;
}

export function getConceptsForReview(): ConceptProgress[] {
  const progress = getProgress();
  const now = new Date();
  
  return Object.values(progress.concepts)
    .filter(c => new Date(c.nextReview) <= now)
    .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
}

export function calculateLevel(xp: number): number {
  // XP required per level increases
  // Level 1: 0, Level 2: 100, Level 3: 250, Level 4: 500, etc.
  let level = 1;
  let required = 0;
  
  while (xp >= required) {
    level++;
    required += level * 50;
  }
  
  return level - 1;
}

export function getXpForNextLevel(currentXp: number): { current: number; required: number } {
  const level = calculateLevel(currentXp);
  let required = 0;
  let prevRequired = 0;
  
  for (let l = 1; l <= level + 1; l++) {
    prevRequired = required;
    required += l * 50;
  }
  
  return {
    current: currentXp - prevRequired,
    required: required - prevRequired
  };
}

function checkAchievements(progress: UserProgress): void {
  const achievements: Record<string, { name: string; condition: () => boolean }> = {
    'first_section': {
      name: 'First Steps',
      condition: () => Object.values(progress.sections).filter(s => s.completed).length >= 1
    },
    'chapter_complete': {
      name: 'Chapter Master',
      condition: () => {
        const completed = Object.keys(progress.sections).filter(id => progress.sections[id].completed);
        // Check if any chapter is fully complete
        const chapters = ['1', '2', '3', '4', '5', '6', '7', '8'];
        return chapters.some(ch => {
          const chapterSections = completed.filter(id => id.startsWith(ch + '.'));
          return chapterSections.length >= 3;
        });
      }
    },
    'concept_master': {
      name: 'Concept Master',
      condition: () => Object.values(progress.concepts).some(c => c.level >= 5)
    },
    'streak_7': {
      name: 'Week Warrior',
      condition: () => progress.currentStreak >= 7
    },
    'xp_1000': {
      name: 'Knowledge Seeker',
      condition: () => progress.xp >= 1000
    },
    'syscall_expert': {
      name: 'System Call Expert',
      condition: () => {
        const syscallConcepts = Object.values(progress.concepts)
          .filter(c => ['open', 'read', 'write', 'close', 'fork', 'exec', 'wait'].includes(c.id));
        return syscallConcepts.filter(c => c.level >= 3).length >= 5;
      }
    }
  };
  
  for (const [id, achievement] of Object.entries(achievements)) {
    if (!progress.achievements.includes(id) && achievement.condition()) {
      progress.achievements.push(id);
    }
  }
}

export function getAchievementDetails(id: string): { name: string; description: string; icon: string } {
  const achievements: Record<string, { name: string; description: string; icon: string }> = {
    'first_section': {
      name: 'First Steps',
      description: 'Complete your first section',
      icon: 'M'
    },
    'chapter_complete': {
      name: 'Chapter Master',
      description: 'Complete an entire chapter',
      icon: 'C'
    },
    'concept_master': {
      name: 'Concept Master',
      description: 'Master a concept to level 5',
      icon: 'S'
    },
    'streak_7': {
      name: 'Week Warrior',
      description: 'Maintain a 7-day learning streak',
      icon: 'W'
    },
    'xp_1000': {
      name: 'Knowledge Seeker',
      description: 'Earn 1000 XP',
      icon: 'K'
    },
    'syscall_expert': {
      name: 'System Call Expert',
      description: 'Master 5 core system calls',
      icon: 'E'
    }
  };
  
  return achievements[id] || { name: id, description: '', icon: '?' };
}

export function getCompletionStats(): {
  sectionsCompleted: number;
  totalSections: number;
  conceptsMastered: number;
  totalConcepts: number;
  percentComplete: number;
} {
  const progress = getProgress();
  const totalSections = 35; // Approximate total sections
  const sectionsCompleted = Object.values(progress.sections).filter(s => s.completed).length;
  const conceptsMastered = Object.values(progress.concepts).filter(c => c.level >= 3).length;
  const totalConcepts = Object.keys(progress.concepts).length || 1;
  
  return {
    sectionsCompleted,
    totalSections,
    conceptsMastered,
    totalConcepts,
    percentComplete: Math.round((sectionsCompleted / totalSections) * 100)
  };
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
