import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';
import { api } from './routes.js';

export const app = express();

// Behind Netlify's (or any) HTTPS proxy: lets req.secure reflect X-Forwarded-Proto.
app.set('trust proxy', true);

// On Netlify, /api/* is rewritten to the function; depending on the runtime the
// path arrives either as /api/... or /.netlify/functions/api/... — normalize it.
const FUNCTION_PREFIX = '/.netlify/functions/api';
app.use((req, _res, next) => {
  if (req.url.startsWith(FUNCTION_PREFIX)) req.url = '/api' + req.url.slice(FUNCTION_PREFIX.length);
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use('/api', api);
app.use(errorHandler);
