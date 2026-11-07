import React, { useCallback, useState } from 'react';
import type { ExerciseResult, LevelDetail } from '../../types';
import FlashcardExercise from './FlashcardExercise';
import MultipleChoiceExercise from './MultipleChoiceExercise';
import TrueFalseExercise from './TrueFalseExercise';
import DictationExercise from './DictationExercise';
import type { ExerciseProps } from './types';
import './exercises.css';

const COMPONENTS: Record<string, React.FC<ExerciseProps>> = {
  FLASHCARD: FlashcardExercise,
  MULTIPLE_CHOICE: MultipleChoiceExercise,
  TRUE_FALSE: TrueFalseExercise,
  DICTATION: DictationExercise,
};

interface Props {
  level: LevelDetail;
  onExit: () => void;
  onFinished: (results: ExerciseResult[]) => void;
}

const ExerciseRunner: React.FC<Props> = ({ level, onExit, onFinished }) => {
  const [index, setIndex] = useState(0);
  const [inner, setInner] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);

  const exercise = level.exercises[index];
  const Component = COMPONENTS[exercise.type];
  const progress = ((index + inner) / level.exercises.length) * 100;

  const handleComplete = useCallback(
    ({ correct, total }: { correct: number; total: number }) => {
      const nextResults = [...results, { exerciseId: exercise.id, type: exercise.type, correct, total }];
      setResults(nextResults);
      if (index + 1 >= level.exercises.length) {
        setInner(1);
        onFinished(nextResults);
      } else {
        setInner(0);
        setIndex(index + 1);
      }
    },
    [results, exercise, index, level.exercises.length, onFinished]
  );

  return (
    <div className="runner">
      <header className="runner-header">
        <button className="runner-close" onClick={onExit} aria-label="Шығу">
          ✕
        </button>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }}>
            <div className="progress-shine" />
          </div>
        </div>
        <span className="runner-step">
          {index + 1}/{level.exercises.length}
        </span>
      </header>

      <main className="runner-body">
        {Component ? (
          <Component
            key={exercise.id}
            exercise={exercise}
            words={level.words}
            onProgress={setInner}
            onComplete={handleComplete}
          />
        ) : (
          <p>Белгісіз жаттығу түрі: {exercise.type}</p>
        )}
      </main>
    </div>
  );
};

export default ExerciseRunner;
