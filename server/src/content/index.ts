import levelsJson from './levels.json' with { type: 'json' };
import avatarsJson from './avatars.json' with { type: 'json' };
import achievementsJson from './achievements.json' with { type: 'json' };
import type { ExerciseType } from '../services/xpService.js';

export interface ExerciseConfig {
  questionCount?: number;
  sentences?: string[];
}

export interface Level {
  id: number;
  order: number;
  title: string;
  description: string;
  words: { id: string; kk: string; ru: string; example: string | null }[];
  exercises: { id: string; order: number; type: ExerciseType; config: ExerciseConfig }[];
}

export interface Avatar {
  id: string;
  emoji: string;
  label: string;
}

export type TriggerType = 'LEVELS_COMPLETED' | 'STREAK_DAYS' | 'TOTAL_XP' | 'PERFECT_SCORE' | 'GAMES_PLAYED';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  triggerType: TriggerType;
  triggerValue: number;
}

// Content ships with the code: editing these JSON files and redeploying is how
// levels change. Word/exercise ids are derived, so they stay stable across deploys.
export const LEVELS: Level[] = levelsJson
  .map((l) => ({
    id: l.id,
    order: l.order,
    title: l.title,
    description: l.description,
    words: l.words.map((w, i) => ({ id: `${l.id}-w${i + 1}`, kk: w.kk, ru: w.ru, example: w.example ?? null })),
    exercises: l.exercises.map((e) => ({
      id: `${l.id}-e${e.order}`,
      order: e.order,
      type: e.type as ExerciseType,
      config: e.config as ExerciseConfig,
    })),
  }))
  .sort((a, b) => a.order - b.order);

export const AVATARS: Avatar[] = avatarsJson;
export const ACHIEVEMENTS = achievementsJson as Achievement[];

export const findLevel = (id: number) => LEVELS.find((l) => l.id === id);
export const isValidAvatar = (id: string) => AVATARS.some((a) => a.id === id);
