import React from 'react';
import { Suggestion } from '../types';
import './Suggestions.css';

interface SuggestionsProps {
  suggestions: Suggestion[];
  onSuggestionClick: (suggestion: Suggestion) => void;
}

const Suggestions: React.FC<SuggestionsProps> = ({ suggestions, onSuggestionClick }) => {
  return (
    <div className="suggestions">
      {suggestions.map((suggestion, index) => (
        <button
          key={`${suggestion.word}-${index}`}
          className="suggestion-item"
          onClick={() => onSuggestionClick(suggestion)}
        >
          {suggestion.word}
        </button>
      ))}
    </div>
  );
};

export default Suggestions;
