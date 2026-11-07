import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './pages.css';

const AuthPage: React.FC<{ mode: 'login' | 'register' }> = ({ mode }) => {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isRegister = mode === 'register';

  if (user) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isRegister) await register(username.trim(), password, displayName.trim() || undefined);
      else await login(username.trim(), password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from !== '/login' ? from : '/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Қате орын алды');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-hero">
        <div className="auth-mascot anim-bounce">🦊</div>
        <div className="auth-brand">qazaqsha</div>
        <p className="auth-tagline">Қазақ тілін ойнап үйрен</p>
      </div>

      <form key={mode} className="auth-card anim-fade-up" onSubmit={submit}>
        <h1 className="auth-title">{isRegister ? 'Профиль құру' : 'Кіру'}</h1>

        {isRegister && (
          <input
            className="field"
            placeholder="Атыңыз (міндетті емес)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={40}
          />
        )}
        <input
          className="field"
          placeholder="Пайдаланушы аты"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="field"
          type="password"
          placeholder="Құпиясөз"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={isRegister ? 6 : undefined}
        />

        {isRegister && <p className="auth-hint">Латын әріптері, сандар және «_» · құпиясөз кемінде 6 таңба</p>}
        {error && <p className="auth-error anim-shake">{error}</p>}

        <button className="btn btn-block btn-blue" type="submit" disabled={submitting}>
          {submitting ? '…' : isRegister ? 'Тіркелу' : 'Кіру'}
        </button>

        <p className="auth-switch">
          {isRegister ? 'Профиліңіз бар ма?' : 'Профиліңіз жоқ па?'}{' '}
          <Link to={isRegister ? '/login' : '/register'} state={location.state}>
            {isRegister ? 'Кіру' : 'Тіркелу'}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default AuthPage;
