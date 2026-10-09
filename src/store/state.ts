import { useSyncExternalStore } from 'react';
import { DEFAULT_AVATAR, GRADES, type AvatarConfig, type GradeId } from '../data/catalog';
import type { DeptId, ThemeId, UniverseId } from '../data/types';

export interface SeenEntry {
  /** Dernière fois vue (ms) */
  t: number;
  /** Boîte de répétition espacée : 0 = ratée récemment */
  box: number;
  /** Date à laquelle la question ratée doit revenir (ms) */
  due?: number;
  ok: boolean;
}

export interface Settings {
  sound: boolean;
  vibration: boolean;
  eco: boolean;
  dyslexia: boolean;
  theme: 'auto' | 'dark' | 'light';
  autoRead: boolean;
}

export interface ParentControls {
  duels: boolean;
  leaderboards: boolean;
  dailyLimitMin: number;
  curfew: boolean;
}

export interface Profile {
  id: string;
  pseudo: string;
  avatar: AvatarConfig;
  birthYear: number;
  grade: GradeId;
  dept: DeptId;
  country: 'BJ';
  pin?: string;
  secretImg?: string;
  createdAt: number;

  xp: number;
  coins: number;
  jokers: { fifty: number; time: number; skip: number };
  owned: string[];
  ratings: Partial<Record<ThemeId, number>>;
  seen: Record<string, SeenEntry>;
  streak: { count: number; lastDay: string | null; graceWeek: string | null };
  badges: string[];
  cards: string[];
  worlds: Partial<Record<DeptId, number>>;
  stats: {
    series: number;
    answered: number;
    correct: number;
    perfect: number;
    dailyDone: string[];
    themeAnswered: Partial<Record<ThemeId, number>>;
    themeCorrect: Partial<Record<ThemeId, number>>;
    danhomeCorrect: number;
    secondsByDay: Record<string, number>;
  };
  ads: { day: string; flyers: number; interstitials: number; rewarded: number; seriesSinceFlyer: number; gamesToday: number; adSeconds: number };
  parent: ParentControls;
  settings: Settings;
}

export interface AppState {
  version: 1;
  profiles: Profile[];
  activeId: string | null;
  /** Fréquence de réussite observée par question (remontée au serveur en production) */
  qstats: Record<string, { n: number; ok: number }>;
}

const KEY = 'quizbenin:v1';

export function today(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const j = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${j}`;
}

export function universeOf(p: Pick<Profile, 'grade'>): UniverseId {
  return GRADES.find((g) => g.id === p.grade)?.universe ?? 'champions';
}

export function ageOf(p: Pick<Profile, 'birthYear'>): number {
  return new Date().getFullYear() - p.birthYear;
}

export function newProfile(input: Pick<Profile, 'pseudo' | 'birthYear' | 'grade' | 'dept'> & Partial<Profile>): Profile {
  const u = universeOf(input);
  return {
    id: Math.random().toString(36).slice(2, 10),
    avatar: { ...DEFAULT_AVATAR },
    country: 'BJ',
    createdAt: Date.now(),
    xp: 0,
    coins: 50,
    jokers: { fifty: 2, time: 2, skip: 1 },
    owned: [],
    ratings: {},
    seen: {},
    streak: { count: 0, lastDay: null, graceWeek: null },
    badges: [],
    cards: [],
    worlds: {},
    stats: { series: 0, answered: 0, correct: 0, perfect: 0, dailyDone: [], themeAnswered: {}, themeCorrect: {}, danhomeCorrect: 0, secondsByDay: {} },
    ads: { day: today(), flyers: 0, interstitials: 0, rewarded: 0, seriesSinceFlyer: 0, gamesToday: 0, adSeconds: 0 },
    parent: { duels: true, leaderboards: true, dailyLimitMin: 60, curfew: true },
    settings: { sound: true, vibration: true, eco: false, dyslexia: false, theme: 'auto', autoRead: u === 'petits' },
    ...input,
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as AppState;
      if (s.version === 1) return s;
    }
  } catch {
    /* stockage indisponible : on repart d'un état vide */
  }
  return { version: 1, profiles: [], activeId: null, qstats: {} };
}

let state: AppState = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota ou mode privé */
  }
}

export function getState() {
  return state;
}

export function setState(fn: (draft: AppState) => void) {
  const draft = structuredClone(state);
  fn(draft);
  state = draft;
  persist();
  listeners.forEach((l) => l());
}

export function updateProfile(id: string, fn: (p: Profile) => void) {
  setState((s) => {
    const p = s.profiles.find((x) => x.id === id);
    if (p) fn(p);
  });
}

export function useAppState(): AppState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state
  );
}

export function useActiveProfile(): Profile | null {
  const s = useAppState();
  return s.profiles.find((p) => p.id === s.activeId) ?? null;
}

/** Remet à zéro les compteurs publicitaires quotidiens si la date a changé. */
export function rollDay(p: Profile) {
  const d = today();
  if (p.ads.day !== d) p.ads = { day: d, flyers: 0, interstitials: 0, rewarded: 0, seriesSinceFlyer: 0, gamesToday: 0, adSeconds: 0 };
}

export function levelOf(xp: number) {
  // Chaque niveau demande un peu plus d'XP que le précédent.
  let level = 1;
  let need = 100;
  let rest = xp;
  while (rest >= need) {
    rest -= need;
    level++;
    need = Math.round(need * 1.18);
  }
  return { level, into: rest, need };
}

/** Lundi de la semaine ISO, pour le jour de grâce hebdomadaire. */
export function weekKey(d = new Date()): string {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  return today(x);
}

export function touchStreak(p: Profile) {
  const d = today();
  const s = p.streak;
  if (s.lastDay === d) return;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const y2 = new Date();
  y2.setDate(y2.getDate() - 2);
  if (s.lastDay === today(y)) s.count += 1;
  else if (s.lastDay === today(y2) && s.graceWeek !== weekKey()) {
    // Un jour manqué par semaine ne casse pas la flamme.
    s.count += 1;
    s.graceWeek = weekKey();
  } else s.count = 1;
  s.lastDay = d;
}

export function exportProfile(p: Profile): string {
  return JSON.stringify(p, null, 2);
}
