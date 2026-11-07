import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCuratedDictionary } from '../../hooks/useCuratedDictionary';
import { sample } from '../../utils/random';
import FeedbackBar, { type FeedbackState } from './FeedbackBar';
import type { ExerciseProps } from './types';
import './exercises.css';

interface Question {
  word: string;
  isCorrect: boolean;
  correction: string;
}

// Same mechanic as the original "Ойын": show a word, decide whether it's spelled
// correctly. Pool = curated mistake → correction pairs from dictionary.json.
const TrueFalseExercise: React.FC<ExerciseProps> = ({ exercise, onProgress, onComplete }) => {
  const { dictionary, loading } = useCuratedDictionary();
  const count = exercise.config.questionCount ?? 10;

  const questions = useMemo<Question[]>(() => {
    const pool: Question[] = [];
    const corrects = new Set<string>();
    for (const [wrong, right] of Object.entries(dictionary)) {
      pool.push({ word: wrong, isCorrect: false, correction: right });
      corrects.add(right);
    }
    for (const right of corrects) pool.push({ word: right, isCorrect: true, correction: right });
    return sample(pool, count);
  }, [dictionary, count]);

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [correct, setCorrect] = useState(0);
  const q = questions[index];

  useEffect(() => {
    if (questions.length) onProgress(index / questions.length);
  }, [index, questions.length, onProgress]);

  const choose = useCallback(
    (value: boolean) => {
      if (feedback !== 'idle' || !q) return;
      setAnswer(value);
      const ok = value === q.isCorrect;
      if (ok) setCorrect((c) => c + 1);
      setFeedback(ok ? 'correct' : 'wrong');
    },
    [feedback, q]
  );

  const next = useCallback(() => {
    if (index + 1 >= questions.length) {
      onComplete({ correct, total: questions.length });
      return;
    }
    setIndex(index + 1);
    setAnswer(null);
    setFeedback('idle');
  }, [index, questions.length, correct, onComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === '1') choose(true);
      if (e.key === 'ArrowRight' || e.key === '2') choose(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choose]);

  if (loading || !q) {
    return <div className="exercise exercise-loading">Жүктелуде…</div>;
  }

  const buttonState = (value: boolean) => {
    if (feedback === 'idle') return '';
    if (value === q.isCorrect) return 'is-correct';
    if (value === answer) return 'is-wrong anim-shake';
    return 'is-dim';
  };

  return (
    <div className="exercise">
      <h2 className="exercise-title">Бұл сөз дұрыс жазылған ба?</h2>
      <p className="exercise-subtitle">
        {index + 1} / {questions.length}
      </p>

      <div key={index} className="tf-word anim-pop">
        {q.word}
      </div>

      <div className="tf-buttons">
        <button className={`tf-btn tf-yes ${buttonState(true)}`} disabled={feedback !== 'idle'} onClick={() => choose(true)}>
          <span className="tf-icon">✓</span>Дұрыс
        </button>
        <button className={`tf-btn tf-no ${buttonState(false)}`} disabled={feedback !== 'idle'} onClick={() => choose(false)}>
          <span className="tf-icon">✕</span>Қате
        </button>
      </div>

      {feedback !== 'idle' && (
        <FeedbackBar
          state={feedback}
          canCheck={false}
          onCheck={() => {}}
          onContinue={next}
          correctAnswer={q.isCorrect ? `«${q.word}» дұрыс жазылған` : `${q.word} → ${q.correction}`}
        />
      )}
    </div>
  );
};

export default TrueFalseExercise;
