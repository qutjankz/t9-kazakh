import { Router, type Response } from 'express';
import { z } from 'zod';
import { asyncRoute, HttpError } from './middleware/errorHandler.js';
import { requireAuth, type AuthedRequest } from './middleware/auth.js';
import { ACHIEVEMENTS, AVATARS, isValidAvatar } from './content/index.js';
import { saveUser, type UserDoc } from './storage/users.js';
import {
  registerUser,
  verifyCredentials,
  issueSessionCookie,
  clearSessionCookie,
  publicUser,
} from './services/authService.js';
import { recordActivity } from './services/activityService.js';
import { checkAndAwardAchievements } from './services/achievementsService.js';
import { completeLevel, getLevelDetail, listLevelsForUser } from './services/progressService.js';

export const api = Router();

const authed = (handler: (user: UserDoc, req: AuthedRequest, res: Response) => Promise<void> | void) => [
  requireAuth,
  asyncRoute(async (req: AuthedRequest, res: Response) => handler(req.user!, req, res)),
];

// ---------- Auth ----------

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Пайдаланушы аты кемінде 3 таңба болуы керек')
    .max(24, 'Пайдаланушы аты 24 таңбадан аспауы керек')
    .regex(/^[a-zA-Z0-9_]+$/, 'Пайдаланушы атында тек латын әріптері, сандар және «_» болады'),
  password: z.string().min(6, 'Құпиясөз кемінде 6 таңба болуы керек').max(100),
  displayName: z.string().trim().min(1).max(40).optional(),
});

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

api.post(
  '/auth/register',
  asyncRoute(async (req, res) => {
    const { username, password, displayName } = registerSchema.parse(req.body);
    const user = await registerUser(username, password, displayName || username);
    recordActivity(user, { type: 'LOGIN' });
    await saveUser(user);
    issueSessionCookie(req, res, user.id);
    res.status(201).json(publicUser(user));
  })
);

api.post(
  '/auth/login',
  asyncRoute(async (req, res) => {
    const { username, password } = loginSchema.parse(req.body);
    const user = await verifyCredentials(username, password);
    recordActivity(user, { type: 'LOGIN' });
    checkAndAwardAchievements(user);
    await saveUser(user);
    issueSessionCookie(req, res, user.id);
    res.json(publicUser(user));
  })
);

api.post('/auth/logout', (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

api.get('/auth/me', ...authed((user, _req, res) => void res.json(publicUser(user))));

// ---------- Levels ----------

api.get('/levels', ...authed((user, _req, res) => void res.json(listLevelsForUser(user))));

api.get('/levels/:id', ...authed((user, req, res) => void res.json(getLevelDetail(user, Number(req.params.id)))));

const completeSchema = z.object({
  exerciseResults: z.array(
    z.object({
      exerciseId: z.string(),
      type: z.enum(['FLASHCARD', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'DICTATION']),
      correct: z.number().int().min(0),
      total: z.number().int().min(0),
    })
  ),
});

api.post(
  '/levels/:id/complete',
  ...authed(async (user, req, res) => {
    const { exerciseResults } = completeSchema.parse(req.body);
    const result = completeLevel(user, Number(req.params.id), exerciseResults);
    await saveUser(user);
    res.json(result);
  })
);

// ---------- Profile ----------

api.get('/avatars', (_req, res) => void res.json(AVATARS));

const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(40).optional(),
  avatarId: z.string().min(1).optional(),
});

api.patch(
  '/profile',
  ...authed(async (user, req, res) => {
    const data = profileSchema.parse(req.body);
    if (data.avatarId && !isValidAvatar(data.avatarId)) throw new HttpError(400, 'Белгісіз аватар');
    if (data.displayName) user.displayName = data.displayName;
    if (data.avatarId) user.avatarId = data.avatarId;
    await saveUser(user);
    res.json(publicUser(user));
  })
);

// ---------- Activity & achievements ----------

api.get(
  '/activity/log',
  ...authed((user, req, res) => {
    const days = Math.min(90, Number(req.query.days) || 30);
    const since = Date.now() - days * 86_400_000;
    res.json(user.activity.filter((a) => new Date(a.createdAt).getTime() >= since));
  })
);

api.get(
  '/activity/streak',
  ...authed((user, _req, res) => {
    res.json({ currentStreak: user.currentStreak, longestStreak: user.longestStreak, lastActiveDate: user.lastActiveDate });
  })
);

const practiceSchema = z.object({
  gameType: z.enum(['DICTATION', 'TRUE_FALSE']),
  correctCount: z.number().int().min(0),
  total: z.number().int().min(0),
});

// Practice outside the level map earns reduced, capped XP so levels stay the main path.
const PRACTICE_XP_CAP = 20;

api.post(
  '/activity/log-practice',
  ...authed(async (user, req, res) => {
    const { correctCount, total } = practiceSchema.parse(req.body);
    const correct = Math.min(correctCount, total);
    const xpGained = Math.min(PRACTICE_XP_CAP, correct);
    recordActivity(user, { type: 'PRACTICE_GAME', xpGained, correctCount: correct, totalCount: total });
    const newAchievements = checkAndAwardAchievements(user);
    await saveUser(user);
    res.json({ xpGained, newAchievements, user: publicUser(user) });
  })
);

api.get(
  '/achievements',
  ...authed((user, _req, res) => {
    res.json(
      ACHIEVEMENTS.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon,
        earned: Boolean(user.achievements[a.id]),
        earnedAt: user.achievements[a.id] ?? null,
      }))
    );
  })
);

api.get('/health', (_req, res) => void res.json({ ok: true }));
