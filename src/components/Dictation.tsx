import React, { useState } from 'react';
import { Dictionary } from '../types';
import './Dictation.css';

type Props = {
  dictionary: Dictionary;
  onBack?: () => void;
};

const Dictation: React.FC<Props> = ({ dictionary, onBack }) => {
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<Array<{ word: string, suggestion?: string }>>([]);
  const [checked, setChecked] = useState(false);

  const normalize = (w: string) => w.toLowerCase();

  const handleCheck = () => {
    const tokens = (text || '').split(/\s+/).filter(Boolean);
    const foundErrors: Array<{ word: string, suggestion?: string }> = [];

    // prepare map of incorrect words to correct words
    const keyMap: { [k: string]: string } = {};
    for (const k in dictionary) keyMap[normalize(k)] = dictionary[k];

    for (const raw of tokens) {
      const token = raw.replace(/[^\u0400-\u04FFa-zA-Zʼ''-]/g, '') || raw;
      const n = normalize(token);
      if (n.length === 0) continue;

      if (keyMap[n]) {
        // token is a known incorrect form
        foundErrors.push({ word: raw, suggestion: keyMap[n] });
      }
      // Removed: else clause that treated unknown words as errors
    }

    setErrors(foundErrors);
    setChecked(true);
  };

  const renderHighlightedText = () => {
    if (!checked || errors.length === 0) return null;

    const errorWords = new Set(errors.map(e => e.word.toLowerCase()));
    const words = text.split(/(\s+)/); // Keep whitespace

    return (
      <div className="highlighted-text">
        {words.map((word, idx) => {
          const isError = errorWords.has(word.toLowerCase().trim());
          return (
            <span key={idx} className={isError ? 'error-word' : ''}>
              {word}
            </span>
          );
        })}
      </div>
    );
  };

  const totalWords = (text || '').split(/\s+/).filter(Boolean).length;
  const correctWords = Math.max(0, totalWords - errors.length);
  const percent = totalWords === 0 ? 0 : Math.round((correctWords / totalWords) * 100);

  return (
    <div className="dictation-root card">
      <textarea
        className="dictation-input"
        value={text}
        onChange={e => { setText(e.target.value); setChecked(false); setErrors([]); }}
        placeholder="Мәтінді осында жазыңыз..."
      />

      {renderHighlightedText()}

      <div className="dictation-check-wrap">
        <button className="primary-btn" onClick={handleCheck}>Тексеру</button>
      </div>

      {checked && (
        <div className="dictation-results">
          <div className="result-row">Жалпы сөздер: <strong>{totalWords}</strong></div>
          <div className="result-row">Қате сөздер: <strong>{errors.length}</strong></div>
          <div className="result-row">Дұрыс: <strong>{percent}%</strong></div>

          {errors.length > 0 && (
            <div className="errors-list">
              <strong>Қаталар:</strong>
              <ul>
                {errors.map((e, i) => (
                  <li key={i}><span className="err-word">{e.word}</span>{e.suggestion && <span className="err-sugg"> → {e.suggestion}</span>}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dictation;
