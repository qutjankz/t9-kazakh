import type { Exercise, Word } from '../../types';

export interface ExerciseProps {
  exercise: Exercise;
  words: Word[];
  onProgress: (fraction: number) => void;
  onComplete: (result: { correct: number; total: number }) => void;
}
