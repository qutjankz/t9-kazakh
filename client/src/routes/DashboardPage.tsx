import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { LevelSummary } from '../types';
import './pages.css';

const UNITS = [
  { title: '1-бөлім', subtitle: 'Негіздер: сәлемдесу, сандар, отбасы', color: 'green', from: 1, to: 5 },
  { title: '2-бөлім', subtitle: 'Күнделікті өмір: уақыт, киім, табиғат', color: 'purple', from: 6, to: 10 },
  { title: '3-бөлім', subtitle: 'Еркін сөйлеу: қала, етістік, сұрақтар', color: 'blue', from: 11, to: 15 },
];

const ZIGZAG = [0, 1, 2, 1, 0, -1, -2, -1];

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [levels, setLevels] = useState<LevelSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [lockedShake, setLockedShake] = useState<number | null>(null);

  useEffect(() => {
    api.levels().then(setLevels).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="page-error">{error}</p>;
  if (!levels) return <div className="map-skeleton" />;

  const completed = levels.filter((l) => l.status === 'COMPLETED').length;
  const current = levels.find((l) => l.status === 'UNLOCKED' || l.status === 'IN_PROGRESS');

  const onNodeClick = (level: LevelSummary) => {
    if (level.status === 'LOCKED') {
      setLockedShake(level.id);
      setTimeout(() => setLockedShake(null), 450);
      setSelected(null);
      return;
    }
    setSelected(selected === level.id ? null : level.id);
  };

  return (
    <div className="dashboard" onClick={() => setSelected(null)}>
      <section className="hello-card">
        <div>
          <h1 className="hello-title">Сәлем, {user?.displayName}! 👋</h1>
          <p className="hello-sub">
            {completed === levels.length
              ? 'Барлық деңгейлер өтілді — керемет!'
              : `${completed} / ${levels.length} деңгей өтілді`}
          </p>
          <div className="hello-progress">
            <div className="hello-progress-fill" style={{ width: `${(completed / levels.length) * 100}%` }} />
          </div>
        </div>
        <div className="hello-streak">
          <span className="hello-flame">🔥</span>
          <span className="hello-streak-num">{user?.currentStreak ?? 0}</span>
          <span className="hello-streak-label">күн</span>
        </div>
      </section>

      {UNITS.map((unit) => {
        const unitLevels = levels.filter((l) => l.order >= unit.from && l.order <= unit.to);
        if (unitLevels.length === 0) return null;
        return (
          <section key={unit.title} className={`unit unit-${unit.color}`}>
            <header className="unit-header">
              <div className="unit-title">{unit.title}</div>
              <div className="unit-subtitle">{unit.subtitle}</div>
            </header>

            <div className="path">
              {unitLevels.map((level, i) => {
                const isCurrent = level.id === current?.id;
                const offset = ZIGZAG[i % ZIGZAG.length] * 52;
                const state = level.status === 'COMPLETED' ? 'done' : level.status === 'LOCKED' ? 'locked' : 'open';
                return (
                  <div
                    key={level.id}
                    className={`path-row ${selected === level.id ? 'is-open' : ''} ${isCurrent ? 'is-current-row' : ''}`}
                    style={{ translate: `${offset}px 0`, animationDelay: `${i * 0.06}s` }}
                  >
                    {isCurrent && selected !== level.id && <div className="start-bubble">БАСТА</div>}

                    <button
                      className={`node node-${state} ${isCurrent ? 'is-current' : ''} ${lockedShake === level.id ? 'anim-shake' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNodeClick(level);
                      }}
                      aria-label={`${level.order}-деңгей: ${level.title}`}
                    >
                      <span className="node-icon">{state === 'done' ? '✓' : state === 'locked' ? '🔒' : '★'}</span>
                    </button>

                    {state === 'done' && (
                      <div className="node-stars">
                        {[1, 2, 3].map((n) => (
                          <span key={n} className={n <= level.bestStars ? 'is-on' : ''}>
                            ★
                          </span>
                        ))}
                      </div>
                    )}

                    {selected === level.id && (
                      <div className="node-popover anim-pop" onClick={(e) => e.stopPropagation()}>
                        <div className="popover-level">{level.order}-деңгей</div>
                        <div className="popover-title">{level.title}</div>
                        <div className="popover-desc">{level.description}</div>
                        <button className="btn btn-block" onClick={() => navigate(`/levels/${level.id}`)}>
                          {state === 'done' ? 'Қайталау · +XP' : 'Бастау · +20 XP'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {lockedShake !== null && <div className="locked-hint">Алдымен алдыңғы деңгейді аяқта 🔒</div>}
    </div>
  );
};

export default DashboardPage;
