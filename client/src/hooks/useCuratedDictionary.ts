import { useEffect, useState } from 'react';
import type { Dictionary } from '../types';

let cache: Dictionary | null = null;

export function useCuratedDictionary() {
  const [dictionary, setDictionary] = useState<Dictionary>(cache ?? {});
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    fetch('/dictionary.json')
      .then((r) => r.json())
      .then((data: Dictionary) => {
        // Guard against self-mapped entries ("x": "x"), which would put a correct
        // word into the pool flagged as a mistake.
        cache = Object.fromEntries(Object.entries(data).filter(([wrong, right]) => wrong !== right));
        setDictionary(cache);
      })
      .catch((err) => console.error('dictionary.json жүктелмеді:', err))
      .finally(() => setLoading(false));
  }, []);

  return { dictionary, loading };
}
