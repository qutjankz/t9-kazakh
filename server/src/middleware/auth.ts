import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';
import { findUserById, type UserDoc } from '../storage/users.js';

export interface AuthedRequest extends Request {
  user?: UserDoc;
}

export const COOKIE_NAME = 'qz_session';

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  let userId: string;
  try {
    userId = (jwt.verify(token, env.jwtSecret) as { sub: string }).sub;
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
    return;
  }

  try {
    const user = await findUserById(userId);
    if (!user) {
      res.status(401).json({ error: 'User no longer exists' });
      return;
    }
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}
