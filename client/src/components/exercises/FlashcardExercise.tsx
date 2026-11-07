import React, { useEffect, useState } from 'react';
import type { ExerciseProps } from './types';
import './exercises.css';

const FlashcardExercise: React.FC<ExerciseProps> = ({ words, onProgress, onComplete }) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const word = words[index];

  useEffect(() => {
    onProgress(index / words.length);
  }, [index, words.length, onProgress]);

  const next = () => {
    if (index + 1 >= words.length) {
      onComplete({ correct: words.length, total: words.length });
      return;
    }
    setFlipped(false);
    setIndex(index + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === ' ') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === 'Enter' && flipped) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="exercise">
      <h2 className="exercise-title">Жаңа сөз</h2>
      <p className="exercise-subtitle">
        {index + 1} / {words.length} · Карточканы басып, аудармасын көр
      </p>

      <div key={word.id} className="flashcard-stage anim-pop">
        <button
          className={`flashcard ${flipped ? 'is-flipped' : ''}`}
          onClick={() => setFlipped(!flipped)}
          aria-label="Карточканы аудару"
        >
          <div className="flashcard-face flashcard-front">
            <span className="flashcard-badge">ЖАҢА</span>
            <span className="flashcard-word">{word.kk}</span>
            <span className="flashcard-hint">басып көр 👆</span>
          </div>
          <div className="flashcard-face flashcard-back">
            <span className="flashcard-word-small">{word.kk}</span>
            <span className="flashcard-translation">{word.ru}</span>
            {word.example && <span className="flashcard-example">«{word.example}»</span>}
          </div>
        </button>
      </div>

      <div className="feedback-bar">
        <div className="feedback-inner">
          {flipped ? (
            <button className="btn btn-block" onClick={next}>
              {index + 1 >= words.length ? 'Дайынмын!' : 'Келесі'}
            </button>
          ) : (
            <button className="btn btn-block btn-blue" onClick={() => setFlipped(true)}>
              Аудармасын көру
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardExercise;
