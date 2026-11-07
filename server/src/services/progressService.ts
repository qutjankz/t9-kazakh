import { LEVELS, findLevel, type ExerciseConfig, type Level } from '../content/index.js';
import { HttpError } from '../middleware/errorHandler.js';
import type { UserDoc } from '../storage/users.js';
import { recordActivity } from './activityService.js';
import { checkAndAwardAchievements } from './achievementsService.js';
import { LEVEL_COMPLETION_BONUS, starsForAccuracy, xpForExercise, type ExerciseType } from './xpService.js';

export interface ExerciseResultInput {
  exerciseId: string;
  type: ExerciseType;
  correct: number;
  total: number;
}

function levelStatus(user: UserDoc, level: Level) {
  if (user.progress[level.id]) return 'COMPLETED';
  if (level.order === 1) return 'UNLOCKED';
  const previous = LEVELS.find((l) => l.order === level.order - 1);
  return previous && user.progress[previous.id] ? 'UNLOCKED' : 'LOCKED';
}

function summary(user: UserDoc, level: Level) {
  const p = user.progress[level.id];
  return {
    id: level.id,
    order: level.order,
    title: level.title,
    description: level.description,
    status: levelStatus(user, level),
    bestStars: p?.bestStars ?? 0,
    bestScore: p?.bestScore ?? 0,
  };
}

function requireUnlocked(user: UserDoc, levelId: number) {
  const level = findLevel(levelId);
  if (!level) throw new HttpError(404, 'Деңгей табылмады');
  if (levelStatus(user, level) === 'LOCKED') throw new HttpError(403, 'Деңгей әлі ашылмаған');
  return level;
}

export function listLevelsForUser(user: UserDoc) {
  return LEVELS.map((level) => summary(user, level));
}

export function getLevelDetail(user: UserDoc, levelId: number) {
  const level = requireUnlocked(user, levelId);
  return { ...summary(user, level), words: level.words, exercises: level.exercises };
}

function maxQuestions(type: ExerciseType, config: ExerciseConfig, wordCount: number) {
  switch (type) {
    case 'FLASHCARD':
      return wordCount;
    case 'MULTIPLE_CHOICE':
      return Math.min(config.questionCount ?? 8, wordCount);
    case 'TRUE_FALSE':
      return config.questionCount ?? 10;
    case 'DICTATION':
      return (config.sentences ?? []).reduce((n, s) => n + s.split(/\s+/).filter(Boolean).length, 0);
  }
}

/** Scores a finished level and updates the doc in place (caller saves). */
export function completeLevel(user: UserDoc, levelId: number, results: ExerciseResultInput[]) {
  const level = requireUnlocked(user, levelId);

  // Scores are counted client-side, so clamp each one to what the exercise can
  // actually contain and require every exercise exactly once.
  const byId = new Map(results.map((r) => [r.exerciseId, r]));
  if (byId.size !== results.length || results.length !== level.exercises.length || level.exercises.some((e) => !byId.has(e.id))) {
    throw new HttpError(400, 'Деңгейдің барлық жаттығуын орындау керек');
  }

  const existing = user.progress[level.id];
  const isReplay = Boolean(existing);

  let exerciseXp = 0;
  let scoredCorrect = 0;
  let scoredTotal = 0;
  for (const exercise of level.exercises) {
    const r = byId.get(exercise.id)!;
    const total = Math.min(r.total, maxQuestions(exercise.type, exercise.config, level.words.length));
    const correct = Math.min(r.correct, total);
    exerciseXp += xpForExercise(exercise.type, correct, !isReplay, isReplay);
    if (exercise.type !== 'FLASHCARD') {
      scoredCorrect += correct;
      scoredTotal += total;
    }
  }

  const stars = starsForAccuracy(scoredCorrect, scoredTotal);
  const scorePct = scoredTotal === 0 ? 100 : Math.round((scoredCorrect / scoredTotal) * 100);
  const xpEarned = exerciseXp + (isReplay ? 0 : LEVEL_COMPLETION_BONUS);

  user.progress[level.id] = {
    bestStars: Math.max(existing?.bestStars ?? 0, stars),
    bestScore: Math.max(existing?.bestScore ?? 0, scorePct),
    xpEarned: (existing?.xpEarned ?? 0) + xpEarned,
    attempts: (existing?.attempts ?? 0) + 1,
    completedAt: new Date().toISOString(),
  };

  recordActivity(user, {
    type: 'LEVEL_COMPLETE',
    xpGained: xpEarned,
    levelId,
    correctCount: scoredCorrect,
    totalCount: scoredTotal,
  });
  const newAchievements = checkAndAwardAchievements(user);

  const levelUnlocked = LEVELS.some((l) => l.order === level.order + 1);
  return { xpEarned, starsEarned: stars, scorePct, newAchievements, levelUnlocked };
}
