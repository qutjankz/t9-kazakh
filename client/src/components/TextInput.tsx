import React, { forwardRef } from 'react';
import './TextInput.css';

interface TextInputProps {
  value: string;
  onChange: (text: string, cursorPos: number) => void;
  cursorPos: number;
  onCursorChange: (pos: number) => void;
}

const TextInput = forwardRef<HTMLTextAreaElement, TextInputProps>(
  ({ value, onChange, onCursorChange }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const newCursorPos = e.target.selectionStart;
      onChange(newValue, newCursorPos);
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const target = e.target as HTMLTextAreaElement;
      onCursorChange(target.selectionStart);
    };

    const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
      const target = e.target as HTMLTextAreaElement;
      onCursorChange(target.selectionStart);
    };

    return (
      <textarea
        ref={ref}
        className="text-input"
        value={value}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        onClick={handleClick}
        placeholder="Мәтін енгізіңіз..."
        rows={5}
        readOnly
        inputMode="none"
      />
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
