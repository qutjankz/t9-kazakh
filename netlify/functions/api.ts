import serverless from 'serverless-http';
import { app } from '../../server/src/app';
import { useBlobsStorage } from '../../server/src/storage/kv';

// Functions v2 runtime: Netlify injects the full Blobs context (including the
// uncached edge URL that strong-consistency reads need) — the Lambda-compat
// runtime does not, which made every read fail.
useBlobsStorage();
const handle = serverless(app);

const NULL_BODY_STATUSES = new Set([101, 204, 205, 304]);

export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const headers = Object.fromEntries(req.headers);
  headers['x-forwarded-proto'] ??= url.protocol.replace(':', '');

  const body = req.method === 'GET' || req.method === 'HEAD' ? null : await req.text();
  const res = (await handle(
    {
      httpMethod: req.method,
      path: url.pathname,
      headers,
      queryStringParameters: Object.fromEntries(url.searchParams),
      body,
      isBase64Encoded: false,
    },
    {}
  )) as {
    statusCode: number;
    headers?: Record<string, string | number | boolean>;
    multiValueHeaders?: Record<string, (string | number | boolean)[]>;
    body?: string;
    isBase64Encoded?: boolean;
  };

  const out = new Headers();
  for (const [k, v] of Object.entries(res.headers ?? {})) {
    if (!res.multiValueHeaders?.[k]) out.set(k, String(v));
  }
  for (const [k, values] of Object.entries(res.multiValueHeaders ?? {})) {
    for (const v of values) out.append(k, String(v));
  }

  const responseBody = NULL_BODY_STATUSES.has(res.statusCode)
    ? null
    : res.isBase64Encoded
      ? Buffer.from(res.body ?? '', 'base64')
      : (res.body ?? '');
  return new Response(responseBody, { status: res.statusCode, headers: out });
};

export const config = { path: '/api/*' };
