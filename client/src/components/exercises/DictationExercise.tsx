import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { KAZAKH_LETTERS, russify, tokenize } from '../../utils/kazakh';
import FeedbackBar, { type FeedbackState } from './FeedbackBar';
import type { ExerciseProps } from './types';
import './exercises.css';

interface WordCheck {
  typed: string;
  expected: string;
  ok: boolean;
}

function compareSentence(typed: string, target: string): WordCheck[] {
  const t = tokenize(typed);
  return tokenize(target).map((expected, i) => ({
    typed: t[i] ?? '',
    expected,
    ok: t[i] === expected,
  }));
}

const DictationExercise: React.FC<ExerciseProps> = ({ exercise, onProgress, onComplete }) => {
  const sentences = exercise.config.sentences ?? [];
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [checks, setChecks] = useState<WordCheck[]>([]);
  const [totals, setTotals] = useState({ correct: 0, total: 0 });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pendingCaret = useRef<number | null>(null);

  const target = sentences[index];

  // Restore the caret after React writes the new value (which moves it to the end).
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (el && pendingCaret.current !== null) {
      el.selectionStart = el.selectionEnd = pendingCaret.current;
      pendingCaret.current = null;
    }
  }, [text]);

  useEffect(() => {
    onProgress(index / Math.max(1, sentences.length));
    inputRef.current?.focus();
  }, [index, sentences.length, onProgress]);

  const insertLetter = (letter: string) => {
    const el = inputRef.current;
    if (!el || feedback !== 'idle') return;
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    pendingCaret.current = start + letter.length;
    setText(text.slice(0, start) + letter + text.slice(end));
    el.focus();
    if (navigator.vibrate) navigator.vibrate(8);
  };

  const check = useCallback(() => {
    const result = compareSentence(text, target);
    const correctWords = result.filter((w) => w.ok).length;
    setChecks(result);
    setTotals((t) => ({ correct: t.correct + correctWords, total: t.total + result.length }));
    setFeedback(correctWords === result.length ? 'correct' : 'wrong');
  }, [text, target]);

  const next = useCallback(() => {
    if (index + 1 >= sentences.length) {
      onComplete(totals);
      return;
    }
    setIndex(index + 1);
    setText('');
    setChecks([]);
    setFeedback('idle');
  }, [index, sentences.length, totals, onComplete]);

  if (!target) return null;

  return (
    <div className="exercise">
      <h2 className="exercise-title">Қазақ әріптерімен дұрыс жаз</h2>
      <p className="exercise-subtitle">
        Сөйлем орыс пернетақтасымен терілген. Оны қазақ әріптерімен түзет · {index + 1} / {sentences.length}
      </p>

      <div key={index} className="dictation-prompt anim-fade-up">
        <span className="dictation-prompt-label">Түзет:</span>
        <span className="dictation-prompt-text">{russify(target)}</span>
      </div>

      <textarea
        ref={inputRef}
        className={`field dictation-field ${feedback === 'wrong' ? 'anim-shake' : ''}`}
        value={text}
        disabled={feedback !== 'idle'}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.preventDefault();
        }}
        placeholder="Осында жаз…"
        rows={3}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />

      <div className="kz-letters">
        {KAZAKH_LETTERS.map((l) => (
          <button
            key={l}
            className="kz-letter"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insertLetter(l)}
            disabled={feedback !== 'idle'}
          >
            {l}
          </button>
        ))}
      </div>

      {feedback !== 'idle' && (
        <div className="dictation-diff anim-fade-up">
          {checks.map((w, i) => (
            <span key={i} className={w.ok ? 'diff-ok' : 'diff-bad'} title={w.ok ? '' : `Сен жаздың: ${w.typed || '—'}`}>
              {w.expected}
            </span>
          ))}
        </div>
      )}

      <FeedbackBar
        state={feedback}
        canCheck={text.trim().length > 0}
        onCheck={check}
        onContinue={next}
        correctAnswer={target}
      />
    </div>
  );
};

export default DictationExercise;
