import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Dictionary, Suggestion } from './types';
import TextInput from './components/TextInput';
import Suggestions from './components/Suggestions';
import Keyboard from './components/Keyboard';
import Dictation from './components/Dictation';
import Game from './components/Game';

function App() {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dictionary, setDictionary] = useState<Dictionary>({});
  const [activeTab, setActiveTab] = useState<'keyboard' | 'dictation' | 'game'>('keyboard');
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Загрузка словаря
  useEffect(() => {
    fetch('/dictionary.json')
      .then(response => response.json())
      .then(data => {
        setDictionary(data);
        console.log('Словарь загружен:', Object.keys(data).length, 'слов');
      })
      .catch(error => {
        console.error('Ошибка загрузки словаря:', error);
        // Резервный словарь
        setDictionary({
          "калай": "қалай",
          "жаксы": "жақсы",
          "рахмет": "рахмет",
          "кош": "қош",
          "китап": "кітап"
        });
      });
  }, []);

  // Получение текущего слова
  const getCurrentWord = (textValue: string, position: number) => {
    let start = position;
    while (start > 0 && textValue[start - 1] !== ' ' && textValue[start - 1] !== '\n') {
      start--;
    }

    let end = position;
    while (end < textValue.length && textValue[end] !== ' ' && textValue[end] !== '\n') {
      end++;
    }

    const word = textValue.substring(start, end).toLowerCase().trim();
    return { word, start, end };
  };

  // Проверка слова и показ подсказок
  const checkWord = (textValue: string, position: number) => {
    const { word, start, end } = getCurrentWord(textValue, position);

    if (word.length === 0) {
      setSuggestions([]);
      return;
    }

    const newSuggestions: Suggestion[] = [];

    // Точное совпадение
    for (let incorrect in dictionary) {
      if (word === incorrect.toLowerCase()) {
        const correct = dictionary[incorrect];
        if (correct !== word) {
          newSuggestions.push({
            word: correct,
            start,
            end,
          });
        }
      }
    }

    // Частичное совпадение
    for (let incorrect in dictionary) {
      if (incorrect.toLowerCase().startsWith(word) && incorrect.toLowerCase() !== word) {
        const correct = dictionary[incorrect];
        newSuggestions.push({
          word: correct,
          start,
          end,
          isPartial: true,
        });
      }
    }

    setSuggestions(newSuggestions.slice(0, 5));
  };

  // Обработка изменения текста
  const handleTextChange = (newText: string, newCursorPos: number) => {
    setText(newText);
    setCursorPos(newCursorPos);
    checkWord(newText, newCursorPos);
  };

  // Вставка символа
  const handleKeyPress = (key: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.substring(0, start) + key + text.substring(end);
    const newCursorPos = start + key.length;

    setText(newText);
    setCursorPos(newCursorPos);

    setTimeout(() => {
      if (textarea) {
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        textarea.focus();
      }
      checkWord(newText, newCursorPos);
    }, 0);

    // Вибрация
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  // Удаление символа
  const handleBackspace = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    let newText = text;
    let newCursorPos = start;

    if (start !== end) {
      newText = text.substring(0, start) + text.substring(end);
    } else if (start > 0) {
      newText = text.substring(0, start - 1) + text.substring(start);
      newCursorPos = start - 1;
    }

    setText(newText);
    setCursorPos(newCursorPos);

    setTimeout(() => {
      if (textarea) {
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        textarea.focus();
      }
      checkWord(newText, newCursorPos);
    }, 0);
  };

  // Замена слова
  const handleSuggestionClick = (suggestion: Suggestion) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end } = getCurrentWord(text, cursorPos);
    const newText = text.substring(0, start) + suggestion.word + text.substring(end);
    const newCursorPos = start + suggestion.word.length;

    setText(newText);
    setCursorPos(newCursorPos);
    setSuggestions([]);

    setTimeout(() => {
      if (textarea) {
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        textarea.focus();
      }
    }, 0);

    // Вибрация
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  return (
    <div className="app-container">
      <div className="top-tabs" style={{ marginBottom: 12 }}>
        <button
          className={`tab-btn ${activeTab === 'keyboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('keyboard')}
        >
          Клавиатура
        </button>
        <button
          className={`tab-btn ${activeTab === 'dictation' ? 'active' : ''}`}
          onClick={() => setActiveTab('dictation')}
        >
          Диктант
        </button>
        <button
          className={`tab-btn ${activeTab === 'game' ? 'active' : ''}`}
          onClick={() => setActiveTab('game')}
        >
          Ойын
        </button>
      </div>
      {activeTab === 'keyboard' && (
        <>
          <div className="text-area-wrapper">
            <TextInput
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              cursorPos={cursorPos}
              onCursorChange={setCursorPos}
            />
            <Suggestions
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>
          <Keyboard
            onKeyPress={handleKeyPress}
            onBackspace={handleBackspace}
          />
        </>
      )}

      {activeTab === 'dictation' && (
        <Dictation dictionary={dictionary} onBack={() => setActiveTab('keyboard')} />
      )}

      {activeTab === 'game' && (
        <Game dictionary={dictionary} />
      )}
    </div>
  );
}

export default App;
