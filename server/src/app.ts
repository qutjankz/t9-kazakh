import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';
import { api } from './routes.js';

export const app = express();

// Behind Netlify's (or any) HTTPS proxy: lets req.secure reflect X-Forwarded-Proto.
app.set('trust proxy', true);

app.use(express.json());
app.use(cookieParser());
app.use('/api', api);
app.use(errorHandler);
