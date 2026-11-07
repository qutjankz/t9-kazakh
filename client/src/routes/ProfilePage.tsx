import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAvatars } from '../hooks/useAvatars';
import type { AchievementStatus, LevelSummary } from '../types';
import './pages.css';

const ProfilePage: React.FC = () => {
  const { user, setUser, logout } = useAuth();
  const { avatars, emojiFor } = useAvatars();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.displayName ?? '');
  const [savingName, setSavingName] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [achievements, setAchievements] = useState<AchievementStatus[]>([]);
  const [levels, setLevels] = useState<LevelSummary[]>([]);

  useEffect(() => {
    api.achievements().then(setAchievements).catch(() => {});
    api.levels().then(setLevels).catch(() => {});
  }, []);

  if (!user) return null;

  const completed = levels.filter((l) => l.status === 'COMPLETED').length;
  const stars = levels.reduce((sum, l) => sum + l.bestStars, 0);
  const earnedCount = achievements.filter((a) => a.earned).length;

  const saveName = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user.displayName) return;
    setSavingName(true);
    try {
      setUser(await api.updateProfile({ displayName: trimmed }));
      showToast({ icon: '✏️', title: 'Аты сақталды' });
    } catch (e) {
      showToast({ icon: '⚠️', title: e instanceof Error ? e.message : 'Қате' });
    } finally {
      setSavingName(false);
    }
  };

  const chooseAvatar = async (avatarId: string) => {
    const previous = user.avatarId;
    setUser({ ...user, avatarId });
    try {
      setUser(await api.updateProfile({ avatarId }));
      setPickerOpen(false);
    } catch {
      setUser({ ...user, avatarId: previous });
      showToast({ icon: '⚠️', title: 'Аватар сақталмады' });
    }
  };

  return (
    <div className="profile">
      <section className="profile-header">
        <button key={user.avatarId} className="profile-avatar anim-pop" onClick={() => setPickerOpen(!pickerOpen)} title="Аватарды өзгерту">
          {emojiFor(user.avatarId)}
          <span className="profile-avatar-edit">✏️</span>
        </button>
        <div className="profile-identity">
          <h1 className="page-title">{user.displayName}</h1>
          <p className="profile-username">@{user.username}</p>
        </div>
      </section>

      {pickerOpen && (
        <section className="card avatar-picker anim-fade-up">
          <div className="avatar-picker-title">Аватар таңда</div>
          <div className="avatar-grid">
            {avatars.map((a) => (
              <button
                key={a.id}
                className={`avatar-option ${a.id === user.avatarId ? 'is-selected' : ''}`}
                onClick={() => chooseAvatar(a.id)}
                title={a.label}
              >
                <span className="avatar-option-emoji">{a.emoji}</span>
                <span className="avatar-option-label">{a.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <h2 className="section-title">Статистика</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card-icon">🔥</span>
          <div>
            <div className="stat-card-value">{user.currentStreak}</div>
            <div className="stat-card-label">Күндік серия</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card-icon">⚡</span>
          <div>
            <div className="stat-card-value">{user.totalXp}</div>
            <div className="stat-card-label">Жалпы XP</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card-icon">✅</span>
          <div>
            <div className="stat-card-value">
              {completed}/{levels.length || 15}
            </div>
            <div className="stat-card-label">Деңгей</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card-icon">⭐</span>
          <div>
            <div className="stat-card-value">{stars}</div>
            <div className="stat-card-label">Жұлдыз</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card-icon">🏆</span>
          <div>
            <div className="stat-card-value">{user.longestStreak}</div>
            <div className="stat-card-label">Ең ұзақ серия</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card-icon">🎖️</span>
          <div>
            <div className="stat-card-value">
              {earnedCount}/{achievements.length}
            </div>
            <div className="stat-card-label">Жетістік</div>
          </div>
        </div>
      </div>

      <h2 className="section-title">Жетістіктер</h2>
      <div className="achievements-grid">
        {achievements.map((a) => (
          <div key={a.id} className={`achievement ${a.earned ? 'is-earned' : ''}`} title={a.description}>
            <span className="achievement-icon">{a.earned ? a.icon : '🔒'}</span>
            <div className="achievement-title">{a.title}</div>
            <div className="achievement-desc">{a.description}</div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Баптаулар</h2>
      <div className="card settings-card">
        <label className="settings-label" htmlFor="displayName">
          Көрсетілетін аты
        </label>
        <div className="settings-row">
          <input
            id="displayName"
            className="field"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveName()}
          />
          <button
            className="btn btn-blue"
            onClick={saveName}
            disabled={savingName || !name.trim() || name.trim() === user.displayName}
          >
            Сақтау
          </button>
        </div>
      </div>

      <button
        className="btn btn-block btn-outline logout-btn"
        onClick={async () => {
          await logout();
          navigate('/login', { replace: true });
        }}
      >
        Шығу
      </button>
    </div>
  );
};

export default ProfilePage;
