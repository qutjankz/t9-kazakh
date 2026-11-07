const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error(
    'Missing JWT_SECRET. Locally: copy server/.env.example to server/.env. On Netlify: Site configuration → Environment variables.'
  );
}

export const env = {
  // Deliberately not PORT: dev tooling commonly sets PORT for the frontend process.
  port: Number(process.env.API_PORT ?? 4000),
  jwtSecret,
};
