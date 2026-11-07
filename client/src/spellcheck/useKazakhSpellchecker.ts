import { useEffect, useRef, useState } from 'react';
import nspell from 'nspell';

const AFF_URL = '/dictionaries/kk_KZ/kk_KZ.aff';
const DIC_URL = '/dictionaries/kk_KZ/kk_KZ.dic';

export interface KazakhSpellchecker {
  isCorrect: (word: string) => boolean;
  suggest: (word: string) => string[];
}

interface State {
  checker: KazakhSpellchecker | null;
  loading: boolean;
  error: string | null;
}

export function useKazakhSpellchecker(): State {
  const [state, setState] = useState<State>({ checker: null, loading: true, error: null });
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    Promise.all([
      fetch(AFF_URL).then((r) => r.text()),
      fetch(DIC_URL).then((r) => r.text()),
    ])
      .then(([aff, dic]) => {
        const instance = nspell(aff, dic);
        setState({
          checker: {
            isCorrect: (word: string) => instance.correct(word),
            suggest: (word: string) => instance.suggest(word),
          },
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        console.error('Казақша сөздік жүктелмеді:', err);
        setState({ checker: null, loading: false, error: 'Сөздік жүктелмеді' });
      });
  }, []);

  return state;
}
