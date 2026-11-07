import { ACHIEVEMENTS, type Achievement } from '../content/index.js';
import type { UserDoc } from '../storage/users.js';

type AwardedAchievement = Pick<Achievement, 'id' | 'title' | 'description' | 'icon'>;

/** Awards every achievement whose trigger is newly met (mutates the doc; caller saves). */
export function checkAndAwardAchievements(user: UserDoc): AwardedAchievement[] {
  const progress = Object.values(user.progress);
  const stats = {
    LEVELS_COMPLETED: progress.length,
    PERFECT_SCORE: progress.filter((p) => p.bestStars === 3).length,
    STREAK_DAYS: user.currentStreak,
    TOTAL_XP: user.totalXp,
    GAMES_PLAYED: user.activity.filter((a) => a.type === 'PRACTICE_GAME').length,
  };

  const awarded: AwardedAchievement[] = [];
  const now = new Date().toISOString();
  for (const a of ACHIEVEMENTS) {
    if (user.achievements[a.id] || stats[a.triggerType] < a.triggerValue) continue;
    user.achievements[a.id] = now;
    awarded.push({ id: a.id, title: a.title, description: a.description, icon: a.icon });
  }
  return awarded;
}
