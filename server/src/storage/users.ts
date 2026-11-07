import { randomUUID } from 'node:crypto';
import { kv } from './kv.js';

export type ActivityType = 'LEVEL_COMPLETE' | 'PRACTICE_GAME' | 'LOGIN';

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  levelId: number | null;
  xpGained: number;
  correctCount: number;
  totalCount: number;
  createdAt: string;
}

export interface LevelProgress {
  bestStars: number;
  bestScore: number;
  xpEarned: number;
  attempts: number;
  completedAt: string;
}

// Everything about a user lives in one document, so each request is a single
// read + single write. Only completed levels are stored; lock state is derived.
export interface UserDoc {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  avatarId: string;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  createdAt: string;
  progress: Record<string, LevelProgress>;
  achievements: Record<string, string>;
  activity: ActivityEntry[];
}

const userKey = (id: string) => `users/${id}`;
const usernameKey = (username: string) => `usernames/${username.toLowerCase()}`;

export function findUserById(id: string) {
  return kv.get<UserDoc>(userKey(id));
}

export async function findUserByUsername(username: string) {
  const ref = await kv.get<{ id: string }>(usernameKey(username));
  return ref ? findUserById(ref.id) : null;
}

export async function isUsernameTaken(username: string) {
  return (await kv.get(usernameKey(username))) !== null;
}

export async function createUser(fields: Pick<UserDoc, 'username' | 'passwordHash' | 'displayName' | 'avatarId'>) {
  const user: UserDoc = {
    ...fields,
    id: randomUUID(),
    totalXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    createdAt: new Date().toISOString(),
    progress: {},
    achievements: {},
    activity: [],
  };
  await kv.set(userKey(user.id), user);
  await kv.set(usernameKey(user.username), { id: user.id });
  return user;
}

export function saveUser(user: UserDoc) {
  return kv.set(userKey(user.id), user);
}
