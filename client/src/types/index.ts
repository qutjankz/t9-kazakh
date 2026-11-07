export interface Dictionary {
  [key: string]: string;
}

export interface Suggestion {
  word: string;
  start: number;
  end: number;
  isPartial?: boolean;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarId: string;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
}

export interface Avatar {
  id: string;
  emoji: string;
  label: string;
}

export type LevelStatus = 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED';

export interface LevelSummary {
  id: number;
  order: number;
  title: string;
  description: string;
  status: LevelStatus;
  bestStars: number;
  bestScore: number;
}

export interface Word {
  id: string;
  kk: string;
  ru: string;
  example: string | null;
}

export type ExerciseType = 'FLASHCARD' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'DICTATION';

export interface Exercise {
  id: string;
  order: number;
  type: ExerciseType;
  config: {
    questionCount?: number;
    sentences?: string[];
  };
}

export interface LevelDetail extends LevelSummary {
  words: Word[];
  exercises: Exercise[];
}

export interface ExerciseResult {
  exerciseId: string;
  type: ExerciseType;
  correct: number;
  total: number;
}

export interface EarnedAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface CompleteLevelResponse {
  xpEarned: number;
  starsEarned: number;
  scorePct: number;
  newAchievements: EarnedAchievement[];
  levelUnlocked: boolean;
}

export interface AchievementStatus extends EarnedAchievement {
  earned: boolean;
  earnedAt: string | null;
}

export interface ActivityEntry {
  id: string;
  type: 'EXERCISE_ATTEMPT' | 'LEVEL_COMPLETE' | 'PRACTICE_GAME' | 'LOGIN';
  levelId: number | null;
  xpGained: number;
  correctCount: number;
  totalCount: number;
  createdAt: string;
}
