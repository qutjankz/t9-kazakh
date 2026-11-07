import React from 'react';
import type { CompleteLevelResponse } from '../../types';
import { useCountUp } from '../../hooks/useCountUp';
import Confetti from './Confetti';
import './feedback.css';

interface Props {
  levelTitle: string;
  result: CompleteLevelResponse;
  onContinue: () => void;
  onReplay: () => void;
}

const HEADLINES = ['Деңгей аяқталды!', 'Деңгей аяқталды!', 'Жақсы нәтиже!', 'Мінсіз!'];

const LevelComplete: React.FC<Props> = ({ levelTitle, result, onContinue, onReplay }) => {
  const xp = useCountUp(result.xpEarned, 1000, 700);
  const accuracy = useCountUp(result.scorePct, 1000, 900);

  return (
    <div className="level-complete">
      {result.starsEarned > 0 && <Confetti />}

      <div className="lc-mascot anim-bounce">{result.starsEarned === 3 ? '🏆' : result.starsEarned > 0 ? '🎉' : '💪'}</div>
      <h1 className="lc-title anim-fade-up">{result.starsEarned === 0 ? 'Аяқтадың!' : HEADLINES[result.starsEarned]}</h1>
      <p className="lc-subtitle anim-fade-up">{levelTitle}</p>

      <div className="lc-stars">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`lc-star ${n <= result.starsEarned ? 'is-earned' : ''}`}
            style={{ animationDelay: `${0.3 + n * 0.25}s` }}
          >
            ★
          </span>
        ))}
      </div>

      <div className="lc-stats">
        <div className="lc-stat lc-stat-xp anim-pop" style={{ animationDelay: '0.5s' }}>
          <div className="lc-stat-label">Жалпы XP</div>
          <div className="lc-stat-value">⚡ {xp}</div>
        </div>
        <div className="lc-stat lc-stat-acc anim-pop" style={{ animationDelay: '0.65s' }}>
          <div className="lc-stat-label">Дәлдік</div>
          <div className="lc-stat-value">🎯 {accuracy}%</div>
        </div>
      </div>

      {result.newAchievements.length > 0 && (
        <div className="lc-achievements">
          <div className="lc-achievements-title">Жаңа жетістік!</div>
          {result.newAchievements.map((a, i) => (
            <div key={a.id} className="lc-achievement anim-pop" style={{ animationDelay: `${1.1 + i * 0.2}s` }}>
              <span className="lc-achievement-icon">{a.icon}</span>
              <div>
                <div className="lc-achievement-name">{a.title}</div>
                <div className="lc-achievement-desc">{a.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="lc-actions">
        <button className="btn btn-block" onClick={onContinue}>
          Жалғастыру
        </button>
        <button className="btn btn-block btn-ghost" onClick={onReplay}>
          Қайта өту
        </button>
      </div>
    </div>
  );
};

export default LevelComplete;
