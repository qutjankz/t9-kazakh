import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { env } from '../env.js';
import { HttpError } from '../middleware/errorHandler.js';
import { COOKIE_NAME } from '../middleware/auth.js';
import { AVATARS } from '../content/index.js';
import { createUser, findUserByUsername, isUsernameTaken, type UserDoc } from '../storage/users.js';

const SALT_ROUNDS = 10;
const SESSION_TTL = '30d';
// Compared against for unknown usernames so response timing doesn't reveal which usernames exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS);

export async function registerUser(username: string, password: string, displayName: string) {
  if (await isUsernameTaken(username)) throw new HttpError(409, 'Бұл пайдаланушы аты бос емес');
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return createUser({ username, passwordHash, displayName, avatarId: AVATARS[0].id });
}

export async function verifyCredentials(username: string, password: string) {
  const user = await findUserByUsername(username);
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) throw new HttpError(401, 'Пайдаланушы аты немесе құпиясөз қате');
  return user;
}

export function issueSessionCookie(req: Request, res: Response, userId: string) {
  const token = jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: SESSION_TTL });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE_NAME);
}

export function publicUser(user: UserDoc) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarId: user.avatarId,
    totalXp: user.totalXp,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
  };
}
