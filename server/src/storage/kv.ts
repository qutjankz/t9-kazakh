import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { getStore } from '@netlify/blobs';

interface KV {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
}

// Local dev: one JSON file per key under server/.data.
function fileKV(dir: string): KV {
  const pathFor = (key: string) => join(dir, `${encodeURIComponent(key)}.json`);
  return {
    async get<T>(key: string) {
      try {
        return JSON.parse(await readFile(pathFor(key), 'utf8')) as T;
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
        throw e;
      }
    },
    async set(key, value) {
      await mkdir(dir, { recursive: true });
      const tmp = `${pathFor(key)}.tmp`;
      await writeFile(tmp, JSON.stringify(value, null, 2));
      await rename(tmp, pathFor(key));
    },
  };
}

// Netlify: built-in Blobs store. getStore() is resolved per call because the
// Lambda-compat runtime only provides the Blobs context once the request arrives.
function blobsKV(): KV {
  const store = () => getStore({ name: 'qazaqsha', consistency: 'strong' });
  return {
    async get<T>(key: string) {
      return (await store().get(key, { type: 'json' })) as T | null;
    },
    async set(key, value) {
      await store().setJSON(key, value);
    },
  };
}

let backend: KV = fileKV(resolve(process.env.DATA_DIR ?? '.data'));

export function useBlobsStorage() {
  backend = blobsKV();
}

export const kv: KV = {
  get: (key) => backend.get(key),
  set: (key, value) => backend.set(key, value),
};
