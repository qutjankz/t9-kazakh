export interface Dictionary {
  [key: string]: string;
}

export interface Suggestion {
  word: string;
  start: number;
  end: number;
  isPartial?: boolean;
}
