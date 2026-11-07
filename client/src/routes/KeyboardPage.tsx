import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Suggestion } from '../types';
import TextInput from '../components/TextInput';
import Suggestions from '../components/Suggestions';
import Keyboard from '../components/Keyboard';
import { useKazakhSpellchecker } from '../spellcheck/useKazakhSpellchecker';
import { useCuratedDictionary } from '../hooks/useCuratedDictionary';
import './pages.css';

// The original T9 tool, kept as a free-typing utility.
const KeyboardPage: React.FC = () => {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { dictionary } = useCuratedDictionary();
  const { checker } = useKazakhSpellchecker();

  const getCurrentWord = (value: string, position: number) => {
    let start = position;
    while (start > 0 && value[start - 1] !== ' ' && value[start - 1] !== '\n') start--;
    let end = position;
    while (end < value.length && value[end] !== ' ' && value[end] !== '\n') end++;
    return { word: value.substring(start, end).toLowerCase().trim(), start, end };
  };

  const checkWord = (value: string, position: number) => {
    const { word, start, end } = getCurrentWord(value, position);
    if (!word) {
      setSuggestions([]);
      return;
    }

    const next: Suggestion[] = [];
    for (const incorrect in dictionary) {
      if (word === incorrect.toLowerCase() && dictionary[incorrect] !== word) {
        next.push({ word: dictionary[incorrect], start, end });
      }
    }
    for (const incorrect in dictionary) {
      const lower = incorrect.toLowerCase();
      if (lower.startsWith(word) && lower !== word) {
        next.push({ word: dictionary[incorrect], start, end, isPartial: true });
      }
    }
    if (next.length === 0 && checker && word.length >= 3 && !checker.isCorrect(word)) {
      for (const candidate of checker.suggest(word).slice(0, 5)) next.push({ word: candidate, start, end });
    }
    setSuggestions(next.slice(0, 5));
  };

  const applyText = (newText: string, newCursor: number, recheck = true) => {
    setText(newText);
    setCursorPos(newCursor);
    setTimeout(() => {
      const el = textareaRef.current;
      if (el) {
        el.selectionStart = el.selectionEnd = newCursor;
        el.focus();
      }
      if (recheck) checkWord(newText, newCursor);
    }, 0);
  };

  const handleKeyPress = (key: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    applyText(text.substring(0, s) + key + text.substring(e), s + key.length);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleBackspace = () => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    if (s !== e) applyText(text.substring(0, s) + text.substring(e), s);
    else if (s > 0) applyText(text.substring(0, s - 1) + text.substring(s), s - 1);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const { start, end } = getCurrentWord(text, cursorPos);
    setSuggestions([]);
    applyText(text.substring(0, start) + suggestion.word + text.substring(end), start + suggestion.word.length, false);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  return (
    <div className="keyboard-page">
      <Link to="/games" className="back-link">
        ‹ Ойындар
      </Link>
      <div className="keyboard-page-input">
        <TextInput
          ref={textareaRef}
          value={text}
          onChange={(t: string, c: number) => {
            setText(t);
            setCursorPos(c);
            checkWord(t, c);
          }}
          cursorPos={cursorPos}
          onCursorChange={setCursorPos}
        />
        <Suggestions suggestions={suggestions} onSuggestionClick={handleSuggestionClick} />
      </div>
      <Keyboard onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
    </div>
  );
};

export default KeyboardPage;
