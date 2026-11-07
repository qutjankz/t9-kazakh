export type ExerciseType = 'FLASHCARD' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'DICTATION';

const XP_PER_CORRECT: Record<ExerciseType, number> = {
  FLASHCARD: 0, // flashcards award a flat bonus on first completion instead, see xpForFlashcard
  MULTIPLE_CHOICE: 2,
  TRUE_FALSE: 2,
  DICTATION: 3,
};

export const FLASHCARD_FLAT_XP = 5;
export const LEVEL_COMPLETION_BONUS = 20;
export const REPLAY_XP_MULTIPLIER = 0.5;

export function xpForExercise(
  type: ExerciseType,
  correctCount: number,
  isFirstCompletion: boolean,
  isReplay: boolean
): number {
  let xp: number;
  if (type === 'FLASHCARD') {
    xp = isFirstCompletion ? FLASHCARD_FLAT_XP : 0;
  } else {
    xp = XP_PER_CORRECT[type] * Math.max(0, correctCount);
  }
  if (isReplay) xp = Math.round(xp * REPLAY_XP_MULTIPLIER);
  return xp;
}

export function starsForAccuracy(correct: number, total: number): 0 | 1 | 2 | 3 {
  if (total === 0) return 0;
  const pct = (correct / total) * 100;
  if (pct >= 90) return 3;
  if (pct >= 75) return 2;
  if (pct >= 50) return 1;
  return 0;
}
