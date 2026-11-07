import React, { createContext, useCallback, useContext, useState } from 'react';
import type { EarnedAchievement } from '../types';
import '../components/feedback/feedback.css';

interface Toast {
  id: number;
  icon: string;
  title: string;
  description?: string;
}

interface ToastApi {
  showToast: (t: Omit<Toast, 'id'>) => void;
  showAchievements: (list: EarnedAchievement[]) => void;
  showXp: (amount: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
let nextId = 1;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [xpFloats, setXpFloats] = useState<{ id: number; amount: number }[]>([]);

  const showToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = nextId++;
    setToasts((list) => [...list, { ...t, id }]);
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 4200);
  }, []);

  const showAchievements = useCallback(
    (list: EarnedAchievement[]) =>
      list.forEach((a, i) =>
        setTimeout(() => showToast({ icon: a.icon, title: `Жетістік: ${a.title}`, description: a.description }), i * 400)
      ),
    [showToast]
  );

  const showXp = useCallback((amount: number) => {
    if (amount <= 0) return;
    const id = nextId++;
    setXpFloats((list) => [...list, { id, amount }]);
    setTimeout(() => setXpFloats((list) => list.filter((x) => x.id !== id)), 1500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showAchievements, showXp }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <span className="toast-icon">{t.icon}</span>
            <div>
              <div className="toast-title">{t.title}</div>
              {t.description && <div className="toast-desc">{t.description}</div>}
            </div>
          </div>
        ))}
      </div>
      {xpFloats.map((x) => (
        <div key={x.id} className="xp-float">
          +{x.amount} XP
        </div>
      ))}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
