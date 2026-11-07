import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ExerciseRunner from '../components/exercises/ExerciseRunner';
import LevelComplete from '../components/feedback/LevelComplete';
import type { CompleteLevelResponse, ExerciseResult, LevelDetail } from '../types';
import './pages.css';

type Phase = 'loading' | 'intro' | 'playing' | 'saving' | 'done' | 'error';

const EXERCISE_LABELS: Record<string, { icon: string; label: string }> = {
  FLASHCARD: { icon: '🃏', label: 'Жаңа сөздер' },
  MULTIPLE_CHOICE: { icon: '🧩', label: 'Аудармасын тап' },
  TRUE_FALSE: { icon: '✅', label: 'Дұрыс па, қате ме?' },
  DICTATION: { icon: '✍️', label: 'Диктант' },
};

const LevelPlayPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [level, setLevel] = useState<LevelDetail | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompleteLevelResponse | null>(null);
  const [lastResults, setLastResults] = useState<ExerciseResult[] | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    api
      .level(Number(id))
      .then((l) => {
        setLevel(l);
        setPhase('intro');
      })
      .catch((e) => {
        setError(e.message);
        setPhase('error');
      });
  }, [id]);

  const save = useCallback(
    async (results: ExerciseResult[]) => {
      setLastResults(results);
      setPhase('saving');
      try {
        const res = await api.completeLevel(Number(id), results);
        setResult(res);
        setPhase('done');
        refresh().catch(() => {});
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Сақтау мүмкін болмады');
        setPhase('error');
      }
    },
    [id, refresh]
  );

  const exit = () => {
    if (phase !== 'playing' || window.confirm('Шығасыз ба? Бұл деңгейдегі прогресс сақталмайды.')) navigate('/');
  };

  if (phase === 'loading') return <div className="splash"><div className="splash-logo anim-bounce">🦊</div></div>;

  if (phase === 'error' || !level) {
    return (
      <div className="center-message">
        <div className="center-emoji">😕</div>
        <p>{error}</p>
        {lastResults && (
          <button className="btn btn-blue" onClick={() => save(lastResults)}>
            Қайта жіберу
          </button>
        )}
        <button className="btn btn-ghost" onClick={() => navigate('/')}>
          Картаға оралу
        </button>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="level-intro">
        <button className="runner-close level-intro-close" onClick={() => navigate('/')} aria-label="Шығу">
          ✕
        </button>
        <div className="level-intro-badge anim-pop">{level.order}</div>
        <h1 className="level-intro-title anim-fade-up">{level.title}</h1>
        <p className="level-intro-desc anim-fade-up">{level.description}</p>

        <ul className="level-intro-steps">
          {level.exercises.map((ex, i) => (
            <li key={ex.id} className="anim-fade-up" style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
              <span>{EXERCISE_LABELS[ex.type]?.icon}</span>
              {EXERCISE_LABELS[ex.type]?.label ?? ex.type}
            </li>
          ))}
        </ul>

        <p className="level-intro-words">{level.words.length} жаңа сөз</p>
        <button className="btn btn-block" onClick={() => setPhase('playing')} autoFocus>
          Бастау
        </button>
      </div>
    );
  }

  if (phase === 'done' && result) {
    return (
      <LevelComplete
        levelTitle={level.title}
        result={result}
        onContinue={() => navigate('/')}
        onReplay={() => {
          setResult(null);
          setAttempt((a) => a + 1);
          setPhase('playing');
        }}
      />
    );
  }

  return (
    <>
      <ExerciseRunner key={attempt} level={level} onExit={exit} onFinished={save} />
      {phase === 'saving' && <div className="saving-overlay">Сақталуда…</div>}
    </>
  );
};

export default LevelPlayPage;
