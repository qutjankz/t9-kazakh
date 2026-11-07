import React, { useCallback, useEffect, useState } from 'react';
import type { Word } from '../../types';
import { sample, shuffle } from '../../utils/random';
import FeedbackBar, { type FeedbackState } from './FeedbackBar';
import type { ExerciseProps } from './types';
import './exercises.css';

interface Question {
  prompt: string;
  promptLang: 'kk' | 'ru';
  answer: string;
  options: string[];
}

function buildQuestions(words: Word[], count: number): Question[] {
  return sample(words, Math.min(count, words.length)).map((word, i) => {
    const kkToRu = i % 2 === 0;
    const field: 'kk' | 'ru' = kkToRu ? 'ru' : 'kk';
    const answer = word[field];
    const distractors = sample(
      [...new Set(words.filter((w) => w.id !== word.id).map((w) => w[field]))].filter((v) => v !== answer),
      3
    );
    return {
      prompt: kkToRu ? word.kk : word.ru,
      promptLang: kkToRu ? 'kk' : 'ru',
      answer,
      options: shuffle([answer, ...distractors]),
    };
  });
}

const MultipleChoiceExercise: React.FC<ExerciseProps> = ({ exercise, words, onProgress, onComplete }) => {
  const [questions] = useState(() => buildQuestions(words, exercise.config.questionCount ?? 8));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [correct, setCorrect] = useState(0);
  const q = questions[index];

  useEffect(() => {
    onProgress(index / questions.length);
  }, [index, questions.length, onProgress]);

  const check = useCallback(() => {
    if (!selected) return;
    const ok = selected === q.answer;
    if (ok) setCorrect((c) => c + 1);
    setFeedback(ok ? 'correct' : 'wrong');
  }, [selected, q]);

  const next = useCallback(() => {
    if (index + 1 >= questions.length) {
      onComplete({ correct, total: questions.length });
      return;
    }
    setIndex(index + 1);
    setSelected(null);
    setFeedback('idle');
  }, [index, questions.length, correct, onComplete]);

  useEffect(() => {
    if (feedback !== 'idle') return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= q.options.length) setSelected(q.options[n - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [q, feedback]);

  return (
    <div className="exercise">
      <h2 className="exercise-title">
        {q.promptLang === 'kk' ? 'Бұл сөз нені білдіреді?' : 'Қазақша қалай болады?'}
      </h2>

      <div key={index} className="mc-prompt anim-fade-up">
        <span className="mc-prompt-mascot">{q.promptLang === 'kk' ? '🦊' : '🦉'}</span>
        <div className="speech-bubble">{q.prompt}</div>
      </div>

      <div className="mc-options">
        {q.options.map((opt, i) => {
          let state = '';
          if (feedback !== 'idle') {
            if (opt === q.answer) state = 'is-correct';
            else if (opt === selected) state = 'is-wrong anim-shake';
          } else if (opt === selected) {
            state = 'is-selected';
          }
          return (
            <button
              key={opt}
              className={`choice ${state}`}
              disabled={feedback !== 'idle'}
              onClick={() => setSelected(opt)}
            >
              <span className="choice-key">{i + 1}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      <FeedbackBar
        state={feedback}
        canCheck={selected !== null}
        onCheck={check}
        onContinue={next}
        correctAnswer={q.answer}
      />
    </div>
  );
};

export default MultipleChoiceExercise;
