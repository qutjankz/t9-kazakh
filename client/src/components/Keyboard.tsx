import React from 'react';
import './Keyboard.css';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, onBackspace }) => {
  const row1 = ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х'];
  const row2 = ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'];
  const row3 = ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю'];
  const row4 = ['ә', 'ғ', 'қ', 'ң', 'ө', 'ұ', 'ү', 'һ', 'і'];

  return (
    <div className="keyboard">
      <div className="keyboard-row">
        {row1.map((key) => (
          <button
            key={key}
            className="key"
            onClick={() => onKeyPress(key)}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="keyboard-row">
        {row2.map((key) => (
          <button
            key={key}
            className="key"
            onClick={() => onKeyPress(key)}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="keyboard-row">
        {row3.map((key) => (
          <button
            key={key}
            className="key"
            onClick={() => onKeyPress(key)}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="keyboard-row">
        {row4.map((key) => (
          <button
            key={key}
            className="key special"
            onClick={() => onKeyPress(key)}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="keyboard-row">
        <button
          className="key wide"
          onClick={() => onKeyPress(' ')}
        >
          Пробел
        </button>
        <button
          className="key backspace"
          onClick={onBackspace}
        >
          ⌫
        </button>
      </div>
    </div>
  );
};

export default Keyboard;
