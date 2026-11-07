import type {
  AchievementStatus,
  ActivityEntry,
  Avatar,
  CompleteLevelResponse,
  EarnedAchievement,
  ExerciseResult,
  LevelDetail,
  LevelSummary,
  User,
} from '../types';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: options.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data?.details?.[0]?.message;
    throw new ApiError(res.status, detail || data?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  register: (username: string, password: string, displayName?: string) =>
    request<User>('/auth/register', { method: 'POST', body: { username, password, displayName } }),
  login: (username: string, password: string) =>
    request<User>('/auth/login', { method: 'POST', body: { username, password } }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  me: () => request<User>('/auth/me'),

  levels: () => request<LevelSummary[]>('/levels'),
  level: (id: number) => request<LevelDetail>(`/levels/${id}`),
  completeLevel: (id: number, exerciseResults: ExerciseResult[]) =>
    request<CompleteLevelResponse>(`/levels/${id}/complete`, { method: 'POST', body: { exerciseResults } }),

  avatars: () => request<Avatar[]>('/avatars'),
  updateProfile: (data: { displayName?: string; avatarId?: string }) =>
    request<User>('/profile', { method: 'PATCH', body: data }),

  activityLog: (days = 30) => request<ActivityEntry[]>(`/activity/log?days=${days}`),
  logPractice: (gameType: 'DICTATION' | 'TRUE_FALSE', correctCount: number, total: number) =>
    request<{ xpGained: number; newAchievements: EarnedAchievement[]; user: User }>('/activity/log-practice', {
      method: 'POST',
      body: { gameType, correctCount, total },
    }),

  achievements: () => request<AchievementStatus[]>('/achievements'),
};
