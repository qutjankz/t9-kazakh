import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Avatar } from '../types';

let cache: Avatar[] | null = null;
let inflight: Promise<Avatar[]> | null = null;

export function useAvatars() {
  const [avatars, setAvatars] = useState<Avatar[]>(cache ?? []);

  useEffect(() => {
    if (cache) return;
    inflight ??= api.avatars().then((list) => (cache = list));
    inflight.then(setAvatars).catch(() => {
      inflight = null;
    });
  }, []);

  const emojiFor = (id: string) => avatars.find((a) => a.id === id)?.emoji ?? '🦊';
  return { avatars, emojiFor };
}
