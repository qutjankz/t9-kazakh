import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { ActivityEntry, LevelSummary } from '../types';
import './pages.css';

const WEEKDAYS = ['Жк', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн'];

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function lastNDays(n: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (n - 1 - i));
    return d;
  });
}

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'жаңа ғана';
  if (mins < 60) return `${mins} мин бұрын`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} сағ бұрын`;
  return `${Math.round(hours / 24)} күн бұрын`;
}

const ActivityPage: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ActivityEntry[] | null>(null);
  const [levels, setLevels] = useState<LevelSummary[]>([]);

  useEffect(() => {
    api.activityLog(30).then(setEntries).catch(() => setEntries([]));
    api.levels().then(setLevels).catch(() => {});
  }, []);

  const xpByDay = useMemo(() => {
    const map = new Map<string, number>();
    const active = new Set<string>();
    for (const e of entries ?? []) {
      const key = dayKey(new Date(e.createdAt));
      map.set(key, (map.get(key) ?? 0) + e.xpGained);
      active.add(key);
    }
    return { map, active };
  }, [entries]);

  const week = lastNDays(7).map((d) => ({ date: d, xp: xpByDay.map.get(dayKey(d)) ?? 0 }));
  const weekMax = Math.max(20, ...week.map((d) => d.xp));
  const weekTotal = week.reduce((s, d) => s + d.xp, 0);

  const month = lastNDays(28).map((d) => ({
    date: d,
    xp: xpByDay.map.get(dayKey(d)) ?? 0,
    active: xpByDay.active.has(dayKey(d)),
  }));

  const graded = (entries ?? []).filter((e) => e.totalCount > 0);
  const correct = graded.reduce((s, e) => s + e.correctCount, 0);
  const total = graded.reduce((s, e) => s + e.totalCount, 0);
  const accuracy = total ? Math.round((correct / total) * 100) : null;

  const recent = (entries ?? []).filter((e) => e.type !== 'LOGIN').slice(0, 12);
  const levelTitle = (id: number | null) => levels.find((l) => l.id === id)?.title ?? `${id}-деңгей`;

  const intensity = (xp: number, active: boolean) => {
    if (xp >= 60) return 4;
    if (xp >= 30) return 3;
    if (xp >= 10) return 2;
    if (xp > 0 || active) return 1;
    return 0;
  };

  return (
    <div>
      <h1 className="page-title">Белсенділік</h1>
      <p className="page-subtitle">Соңғы 30 күндегі прогресің</p>

      <div className="activity-top">
        <div className="streak-card">
          <span className="streak-card-flame">🔥</span>
          <div>
            <div className="streak-card-num">{user?.currentStreak ?? 0} күн</div>
            <div className="streak-card-label">Ағымдағы серия · рекорд {user?.longestStreak ?? 0}</div>
          </div>
        </div>
        <div className="mini-stats">
          <div className="mini-stat">
            <div className="mini-stat-value">{weekTotal}</div>
            <div className="mini-stat-label">XP осы аптада</div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-value">{accuracy === null ? '—' : `${accuracy}%`}</div>
            <div className="mini-stat-label">Орташа дәлдік</div>
          </div>
        </div>
      </div>

      <h2 className="section-title">Апталық XP</h2>
      <div className="card week-chart">
        {week.map((d, i) => (
          <div key={i} className="week-col">
            <div className="week-bar-wrap">
              {d.xp > 0 && <span className="week-bar-value">{d.xp}</span>}
              <div
                className={`week-bar ${i === week.length - 1 ? 'is-today' : ''}`}
                style={{ height: `${(d.xp / weekMax) * 100}%`, animationDelay: `${i * 0.05}s` }}
              />
            </div>
            <span className={`week-label ${i === week.length - 1 ? 'is-today' : ''}`}>{WEEKDAYS[d.date.getDay()]}</span>
          </div>
        ))}
      </div>

      <h2 className="section-title">Соңғы 4 апта</h2>
      <div className="card heatmap">
        {month.map((d, i) => (
          <div
            key={i}
            className={`heat-cell heat-${intensity(d.xp, d.active)}`}
            title={`${d.date.toLocaleDateString('kk-KZ')}: ${d.xp} XP`}
            style={{ animationDelay: `${i * 0.015}s` }}
          />
        ))}
      </div>

      <h2 className="section-title">Соңғы әрекеттер</h2>
      {entries === null ? (
        <p className="page-subtitle">Жүктелуде…</p>
      ) : recent.length === 0 ? (
        <div className="card empty-state">Әзірге ештеңе жоқ — алғашқы деңгейді бастап көр! 🚀</div>
      ) : (
        <ul className="activity-list">
          {recent.map((e) => (
            <li key={e.id} className="activity-item">
              <span className="activity-icon">{e.type === 'LEVEL_COMPLETE' ? '🏁' : '🎮'}</span>
              <div className="activity-body">
                <div className="activity-title">
                  {e.type === 'LEVEL_COMPLETE' ? `Деңгей: ${levelTitle(e.levelId)}` : 'Жаттығу ойыны'}
                </div>
                <div className="activity-meta">
                  {e.totalCount > 0 && `${e.correctCount}/${e.totalCount} дұрыс · `}
                  {timeAgo(e.createdAt)}
                </div>
              </div>
              <span className="activity-xp">+{e.xpGained} XP</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityPage;
