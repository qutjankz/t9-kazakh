// The typical way Kazakh gets mistyped on a Russian keyboard: each Kazakh-specific
// letter collapses to its closest Russian look-alike. This is exactly the class of
// error the original T9 app's dictionary.json was built to correct.
const RUSSIAN_LOOKALIKE: Record<string, string> = {
  ә: 'а', Ә: 'А',
  ғ: 'г', Ғ: 'Г',
  қ: 'к', Қ: 'К',
  ң: 'н', Ң: 'Н',
  ө: 'о', Ө: 'О',
  ұ: 'у', Ұ: 'У',
  ү: 'у', Ү: 'У',
  һ: 'х', Һ: 'Х',
  і: 'и', І: 'И',
};

export const KAZAKH_LETTERS = ['ә', 'ғ', 'қ', 'ң', 'ө', 'ұ', 'ү', 'һ', 'і'];

export function russify(text: string): string {
  return [...text].map((ch) => RUSSIAN_LOOKALIKE[ch] ?? ch).join('');
}

export function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^Ѐ-ӿa-z-]/g, '');
}

export function tokenize(text: string): string[] {
  return text.split(/\s+/).map(normalizeWord).filter(Boolean);
}
