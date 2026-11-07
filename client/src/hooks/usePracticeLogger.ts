import { useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function usePracticeLogger(gameType: 'DICTATION' | 'TRUE_FALSE') {
  const { setUser } = useAuth();
  const { showXp, showAchievements, showToast } = useToast();

  return useCallback(
    async (correct: number, total: number) => {
      try {
        const res = await api.logPractice(gameType, correct, total);
        setUser(res.user);
        showXp(res.xpGained);
        showAchievements(res.newAchievements);
      } catch {
        showToast({ icon: '⚠️', title: 'Нәтиже сақталмады' });
      }
    },
    [gameType, setUser, showXp, showAchievements, showToast]
  );
}
