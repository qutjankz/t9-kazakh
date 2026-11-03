import React, { useState } from 'react';
import { Dictionary } from '../types';
import { useKazakhSpellchecker } from '../spellcheck/useKazakhSpellchecker';
import './Dictation.css';

type Props = {
  dictionary: Dictionary;
  onBack?: () => void;
};

const Dictation: React.FC<Props> = ({ dictionary, onBack }) => {
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<Array<{ word: string, suggestions: string[] }>>([]);
  const [checked, setChecked] = useState(false);
  const { checker, loading: dictLoading, error: dictError } = useKazakhSpellchecker();

  const normalize = (w: string) => w.toLowerCase();

  const handleCheck = () => {
    const tokens = (text || '').split(/\s+/).filter(Boolean);
    const foundErrors: Array<{ word: string, suggestions: string[] }> = [];

    // prepare map of incorrect words to correct words
    const keyMap: { [k: string]: string } = {};
    for (const k in dictionary) keyMap[normalize(k)] = dictionary[k];

    for (const raw of tokens) {
      const token = raw.replace(/[^\u0400-\u04FFa-zA-Zʼ''-]/g, '') || raw;
      const n = normalize(token);
      if (n.length === 0) continue;

      if (keyMap[n]) {
        // known incorrect form from dictionary.json — exact curated correction
        foundErrors.push({ word: raw, suggestions: [keyMap[n]] });
        continue;
      }

      // Полноценная проверка по словарю Hunspell (53k+ слов и суффиксы казахского языка).
      // Показываем несколько кандидатов — первый по релевантности не всегда тот,
      // что имел в виду пользователь.
      if (checker && !checker.isCorrect(n)) {
        foundErrors.push({ word: raw, suggestions: checker.suggest(n).slice(0, 5) });
      }
    }

    setErrors(foundErrors);
    setChecked(true);
  };

  const applySuggestion = (errorIndex: number, suggestion: string) => {
    const target = errors[errorIndex].word;
    const idx = text.indexOf(target);
    if (idx === -1) return;
    setText(text.slice(0, idx) + suggestion + text.slice(idx + target.length));
    setChecked(false);
    setErrors([]);
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

      {dictLoading && (
        <div className="result-row" style={{ color: '#888' }}>Сөздік жүктелініп жатыр… (54 мың сөз)</div>
      )}
      {dictError && (
        <div className="result-row" style={{ color: '#b91c1c' }}>
          Толық сөздік жүктелмеді, тек белгілі қателер тексеріледі.
        </div>
      )}

      <div className="dictation-check-wrap">
        <button className="primary-btn" onClick={handleCheck} disabled={dictLoading}>Тексеру</button>
      </div>

      {checked && (
        <div className="dictation-results">
          <div className="result-row">Жалпы сөздер: <strong>{totalWords}</strong></div>
          <div className="result-row">Қате сөздер: <strong>{errors.length}</strong></div>
          <div className="result-row">Дұрыс: <strong>{percent}%</strong></div>

          {errors.length > 0 && (
            <div className="errors-list">
              <strong>Қателер:</strong>
              <ul>
                {errors.map((e, i) => (
                  <li key={i}>
                    <span className="err-word">{e.word}</span>
                    {e.suggestions.length > 0 && (
                      <span className="err-sugg-list">
                        {' → '}
                        {e.suggestions.map((s, si) => (
                          <button
                            key={si}
                            type="button"
                            className="err-sugg-btn"
                            onClick={() => applySuggestion(i, s)}
                          >
                            {s}
                          </button>
                        ))}
                      </span>
                    )}
                  </li>
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
