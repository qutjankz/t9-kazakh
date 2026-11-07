import { randomUUID } from 'node:crypto';
import type { ActivityType, UserDoc } from '../storage/users.js';
import { todayStr, daysBetween } from '../utils/date.js';

const MAX_ACTIVITY_ENTRIES = 300;

interface RecordActivityInput {
  type: ActivityType;
  xpGained?: number;
  levelId?: number;
  correctCount?: number;
  totalCount?: number;
}

/**
 * Appends an activity entry, bumps totalXp, and recomputes the streak (mutates
 * the doc; caller saves). A "day" is the server's local calendar date: same day
 * -> unchanged, exactly one day later -> +1, bigger gap -> reset to 1.
 */
export function recordActivity(user: UserDoc, input: RecordActivityInput) {
  const xpGained = input.xpGained ?? 0;

  user.activity.unshift({
    id: randomUUID(),
    type: input.type,
    levelId: input.levelId ?? null,
    xpGained,
    correctCount: input.correctCount ?? 0,
    totalCount: input.totalCount ?? 0,
    createdAt: new Date().toISOString(),
  });
  user.activity.length = Math.min(user.activity.length, MAX_ACTIVITY_ENTRIES);

  const today = todayStr();
  if (user.lastActiveDate !== today) {
    const consecutive = user.lastActiveDate !== null && daysBetween(user.lastActiveDate, today) === 1;
    user.currentStreak = consecutive ? user.currentStreak + 1 : 1;
  }
  user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
  user.lastActiveDate = today;
  user.totalXp += xpGained;
}
