export type ThemeId =
  | 'ombres'
  | 'sombre'
  | 'assassin'
  | 'neon'
  | 'ghost'
  | 'blood'
  | 'hacker';

export interface AppConfig {
  banMsg: string;
  okMsg: string;
  anim: boolean;
  bg: boolean;
  theme: ThemeId;
}

export interface HistoryItem {
  num: string;
  banned: boolean;
  ts: number;
}

export interface VerdictState {
  open: boolean;
  banned: boolean;
  num: string;
  reason: string;
  ts: string;
}
