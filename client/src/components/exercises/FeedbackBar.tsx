import React, { useEffect, useMemo } from 'react';
import './exercises.css';

export type FeedbackState = 'idle' | 'correct' | 'wrong';

const PRAISE = ['Керемет!', 'Жарайсың!', 'Тамаша!', 'Дұрыс!', 'Өте жақсы!'];

interface Props {
  state: FeedbackState;
  canCheck: boolean;
  onCheck: () => void;
  onContinue: () => void;
  correctAnswer?: string;
  checkLabel?: string;
}

const FeedbackBar: React.FC<Props> = ({ state, canCheck, onCheck, onContinue, correctAnswer, checkLabel = 'Тексеру' }) => {
  const praise = useMemo(() => PRAISE[Math.floor(Math.random() * PRAISE.length)], [state]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat) return;
      // Stop the browser also "clicking" whichever button has focus.
      e.preventDefault();
      if (state === 'idle' && canCheck) onCheck();
      else if (state !== 'idle') onContinue();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, canCheck, onCheck, onContinue]);

  useEffect(() => {
    if (state === 'wrong' && navigator.vibrate) navigator.vibrate([30, 40, 30]);
    if (state === 'correct' && navigator.vibrate) navigator.vibrate(15);
  }, [state]);

  if (state === 'idle') {
    return (
      <div className="feedback-bar">
        <div className="feedback-inner">
          <button className="btn btn-block" disabled={!canCheck} onClick={onCheck}>
            {checkLabel}
          </button>
        </div>
      </div>
    );
  }

  const correct = state === 'correct';
  return (
    <div className={`feedback-bar feedback-${state}`}>
      <div className="feedback-inner feedback-reveal">
        <div className="feedback-message">
          <span className="feedback-icon anim-pop">{correct ? '✓' : '✕'}</span>
          <div>
            <div className="feedback-title">
              {correct ? praise : 'Дұрыс жауап:'}
            </div>
            {!correct && correctAnswer && <div className="feedback-answer">{correctAnswer}</div>}
          </div>
        </div>
        <button className={`btn btn-block ${correct ? '' : 'btn-red'}`} onClick={onContinue}>
          Жалғастыру
        </button>
      </div>
    </div>
  );
};

export default FeedbackBar;
