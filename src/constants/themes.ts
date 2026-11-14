import type { AppConfig, ThemeId } from '../types';

export const LINK_WHATSAPP = 'https://whatsapp.com/channel/0029VbDIzIRCnA7wOIaJea0z';
export const CHECK_API_URL = 'https://inconnu-check-ban-api.onrender.com/check';
export const DEFAULT_IMAGE = '/assets/kaneki-placeholder.gif';
export const DEFAULT_BG_IMAGE = '/assets/aistudio/67d1052022daff0acc1bd11adbb36e3b_a1ea3bf7.jpg';
export const CREST_IMAGE = '/assets/empire-crest.svg';

export const DEFAULTS: AppConfig = {
  banMsg:
    "Sentence des ténèbres : ce numéro a été consommé par l'abîme et banni à jamais.",
  okMsg:
    "Sursis temporaire : ce numéro respire encore dans l'ombre de 𝑲𝑬𝑵 𝑲𝑨𝑵𝑬𝑲𝑰.",
  anim: true,
  bg: true,
  theme: 'ombres',
};

export const ALT_OK_MSG =
  '♪♪𓍝»͜͡ꜛ« Ne me juge pas par mon silence. Même dans le calme, je peux devenir ton pire adversaire. ⚖️ 👑♚𓂆𓂇⋆';

export interface ThemeSpec {
  label: string;
  vars: Record<string, string>;
  pip: string;
  cube: string;
  orb1: string;
  orb2: string;
}

export const THEMES: Record<ThemeId, ThemeSpec> = {
  ombres: {
    label: 'Ombres',
    vars: {
      '--accent': '#ff0026',
      '--accent2': '#7a0012',
      '--blue': '#b8001c',
      '--red': '#ff1a35',
      '--bg': '#050001',
      '--card': 'rgba(10,0,2,0.94)',
      '--card2': 'rgba(16,0,4,0.95)',
      '--text': '#e8d4d8',
      '--sub': 'rgba(225,110,125,0.75)',
      '--border': 'rgba(255,0,38,0.14)',
      '--border2': 'rgba(255,0,38,0.26)',
      '--font-h': "'Pirata One', 'Cinzel Decorative', serif",
      '--font-b': "'Cinzel', 'Barlow Condensed', serif",
      '--font-m': "'Share Tech Mono', monospace",
    },
    pip: '255,0,38',
    cube: '255,0,38',
    orb1: '175,0,22',
    orb2: '95,0,12',
  },
  sombre: {
    label: 'Sombre',
    vars: {
      '--accent': '#d4af37',
      '--accent2': '#a8842a',
      '--blue': '#c9a875',
      '--red': '#9e3a2e',
      '--bg': '#0a0705',
      '--card': 'rgba(10,8,4,0.9)',
      '--card2': 'rgba(14,11,6,0.92)',
      '--text': '#ece0c8',
      '--sub': 'rgba(190,160,100,0.45)',
      '--border': 'rgba(212,175,55,0.06)',
      '--border2': 'rgba(212,175,55,0.12)',
      '--font-h': "'Bebas Neue', sans-serif",
      '--font-b': "'Poppins', sans-serif",
      '--font-m': "'Share Tech Mono', monospace",
    },
    pip: '212,175,55',
    cube: '212,175,55',
    orb1: '120,90,20',
    orb2: '160,120,30',
  },
  assassin: {
    label: 'Assassin',
    vars: {
      '--accent': '#ff1a2e',
      '--accent2': '#cc0018',
      '--blue': '#ff4466',
      '--red': '#ff1a2e',
      '--bg': '#000000',
      '--card': 'rgba(8,0,2,0.9)',
      '--card2': 'rgba(12,0,4,0.92)',
      '--text': '#e8d0d4',
      '--sub': 'rgba(180,80,90,0.5)',
      '--border': 'rgba(255,20,40,0.06)',
      '--border2': 'rgba(255,20,40,0.12)',
      '--font-h': "'Orbitron', sans-serif",
      '--font-b': "'Poppins', sans-serif",
      '--font-m': "'Share Tech Mono', monospace",
    },
    pip: '255,26,46',
    cube: '255,26,46',
    orb1: '160,0,20',
    orb2: '200,10,30',
  },
  neon: {
    label: 'Neon',
    vars: {
      '--accent': '#00f0ff',
      '--accent2': '#0088ff',
      '--blue': '#00f0ff',
      '--red': '#ff00aa',
      '--bg': '#0a0015',
      '--card': 'rgba(10,0,30,0.85)',
      '--card2': 'rgba(16,0,40,0.9)',
      '--text': '#d0e0ff',
      '--sub': 'rgba(100,150,255,0.4)',
      '--border': 'rgba(0,240,255,0.08)',
      '--border2': 'rgba(0,240,255,0.15)',
      '--font-h': "'Orbitron', sans-serif",
      '--font-b': "'Barlow Condensed', sans-serif",
      '--font-m': "'Share Tech Mono', monospace",
    },
    pip: '0,240,255',
    cube: '0,200,255',
    orb1: '0,180,255',
    orb2: '255,0,170',
  },
  ghost: {
    label: 'Ghost',
    vars: {
      '--accent': '#a8b2c8',
      '--accent2': '#8892a8',
      '--blue': '#b8c2d8',
      '--red': '#d8a0a0',
      '--bg': '#0c0e12',
      '--card': 'rgba(20,22,28,0.85)',
      '--card2': 'rgba(28,30,38,0.9)',
      '--text': '#d8dce4',
      '--sub': 'rgba(160,170,190,0.4)',
      '--border': 'rgba(200,210,230,0.06)',
      '--border2': 'rgba(200,210,230,0.10)',
      '--font-h': "'Barlow Condensed', sans-serif",
      '--font-b': "'Poppins', sans-serif",
      '--font-m': "'Share Tech Mono', monospace",
    },
    pip: '168,178,200',
    cube: '168,178,200',
    orb1: '140,150,170',
    orb2: '100,110,130',
  },
  blood: {
    label: 'Blood',
    vars: {
      '--accent': '#8a0010',
      '--accent2': '#5a0008',
      '--blue': '#aa0020',
      '--red': '#cc0020',
      '--bg': '#0a0002',
      '--card': 'rgba(12,0,2,0.9)',
      '--card2': 'rgba(18,0,4,0.92)',
      '--text': '#e0b8b8',
      '--sub': 'rgba(160,60,60,0.4)',
      '--border': 'rgba(200,0,20,0.06)',
      '--border2': 'rgba(200,0,20,0.12)',
      '--font-h': "'Bebas Neue', sans-serif",
      '--font-b': "'Barlow Condensed', sans-serif",
      '--font-m': "'Share Tech Mono', monospace",
    },
    pip: '138,0,16',
    cube: '138,0,16',
    orb1: '100,0,12',
    orb2: '80,0,10',
  },
  hacker: {
    label: 'Hacker',
    vars: {
      '--accent': '#00ff64',
      '--accent2': '#00cc50',
      '--blue': '#00ff88',
      '--red': '#ff0033',
      '--bg': '#000a04',
      '--card': 'rgba(0,12,4,0.85)',
      '--card2': 'rgba(0,18,6,0.9)',
      '--text': '#b0f0c8',
      '--sub': 'rgba(0,200,80,0.35)',
      '--border': 'rgba(0,255,100,0.06)',
      '--border2': 'rgba(0,255,100,0.10)',
      '--font-h': "'Share Tech Mono', monospace",
      '--font-b': "'Share Tech Mono', monospace",
      '--font-m': "'Share Tech Mono', monospace",
    },
    pip: '0,255,100',
    cube: '0,255,100',
    orb1: '0,200,80',
    orb2: '0,150,60',
  },
};

export const THEME_ORDER: ThemeId[] = [
  'ombres',
  'sombre',
  'assassin',
  'neon',
  'ghost',
  'blood',
  'hacker',
];

export function applyThemeToDom(name: ThemeId) {
  const t = THEMES[name] || THEMES.sombre;
  const s = document.documentElement.style;
  Object.entries(t.vars).forEach(([k, v]) => s.setProperty(k, v));
  document.documentElement.dataset.theme = name;
}
