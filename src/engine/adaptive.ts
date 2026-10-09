import { QUESTIONS } from '../data/questions';
import { UNIVERSES } from '../data/catalog';
import type { DeptId, Question, ThemeId, UniverseId } from '../data/types';
import { universeOf, type AppState, type Profile } from '../store/state';

// Moteur d'adaptation (cahier des charges, section 3.4) :
// - un score de type Elo par joueur et par thème, un score de difficulté par question ;
// - sélection des questions qui visent ~70 % de réussite ;
// - pas de question revue dans les 30 jours, sauf révision ;
// - questions ratées réintroduites à intervalles croissants.

const DAY = 86_400_000;
const NO_REPEAT_DAYS = 30;
const TARGET = 0.7;
const K = 32;
const BASE_RATING = 1000;
const INTERVALS = [1, 3, 7, 14];

export type Mode = 'quick' | 'adventure' | 'revision' | 'daily' | 'duel';

export interface Prepared {
  q: Question;
  choices: string[];
  answer: number;
}

export function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function poolFor(universe: UniverseId, country = 'BJ'): Question[] {
  return QUESTIONS.filter((q) => q.u.includes(universe) && (q.scope !== 'national' || q.country === country));
}

export function questionRating(q: Question, qstats: AppState['qstats']): number {
  let d = 700 + q.diff * 120;
  const s = qstats[q.id];
  if (s && s.n >= 5) d += (TARGET - s.ok / s.n) * 300;
  return d;
}

export function playerRating(p: Profile, theme: ThemeId): number {
  return p.ratings[theme] ?? BASE_RATING;
}

function expected(r: number, d: number) {
  return 1 / (1 + Math.pow(10, (d - r) / 400));
}

export function prepare(q: Question, universe: UniverseId, rand: () => number = Math.random): Prepared {
  const max = UNIVERSES[universe].maxChoices;
  const isVF = q.choices.length === 2 && q.choices[0] === 'Vrai';
  if (isVF) return { q, choices: q.choices, answer: q.answer };
  const right = q.choices[q.answer];
  const wrong = shuffle(q.choices.filter((_, i) => i !== q.answer), rand).slice(0, max - 1);
  const choices = shuffle([right, ...wrong], rand);
  return { q, choices, answer: choices.indexOf(right) };
}

export interface PickOptions {
  profile: Profile;
  qstats: AppState['qstats'];
  mode: Mode;
  n: number;
  theme?: ThemeId;
  dept?: DeptId;
  seed?: string;
}

export function pickSeries(o: PickOptions): Prepared[] {
  const universe = universeOf(o.profile);
  const pool = poolFor(universe, o.profile.country);

  // Séries identiques pour tout le monde : défi du jour et duel.
  if (o.mode === 'daily' || o.mode === 'duel') {
    const rand = rng(`${o.seed}|${universe}`);
    return shuffle(pool, rand).slice(0, o.n).map((q) => prepare(q, universe, rand));
  }

  const now = Date.now();
  const seen = o.profile.seen;
  const themed = o.theme ? pool.filter((q) => q.theme === o.theme) : pool;

  const due = themed
    .filter((q) => seen[q.id]?.due !== undefined && seen[q.id].due! <= now)
    .sort((a, b) => seen[a.id].due! - seen[b.id].due!);
  const maxDue = o.mode === 'revision' ? Math.ceil(o.n / 2) : 2;
  const picked: Question[] = due.slice(0, maxDue);

  const fresh = (q: Question) => {
    const e = seen[q.id];
    return !e || now - e.t > NO_REPEAT_DAYS * DAY;
  };

  const score = (q: Question) => {
    const p = expected(playerRating(o.profile, q.theme), questionRating(q, o.qstats));
    return Math.abs(p - TARGET) + Math.random() * 0.18;
  };

  const fill = (candidates: Question[]) => {
    const rest = candidates.filter((q) => !picked.includes(q));
    const ordered = [
      ...rest.filter(fresh).sort((a, b) => score(a) - score(b)),
      // Banque épuisée : on reprend les questions les plus anciennement vues.
      ...rest.filter((q) => !fresh(q)).sort((a, b) => seen[a.id].t - seen[b.id].t),
    ];
    for (const q of ordered) {
      if (picked.length >= o.n) break;
      picked.push(q);
    }
  };

  if (o.dept) fill(shuffle(themed.filter((q) => q.dept === o.dept)));
  fill(themed);
  if (picked.length < o.n && o.theme) fill(pool);

  return shuffle(picked).map((q) => prepare(q, universe));
}

/** Met à jour le profil et les statistiques de la question. */
export function recordAnswer(p: Profile, qstats: AppState['qstats'], q: Question, ok: boolean) {
  const now = Date.now();
  const r = playerRating(p, q.theme);
  const d = questionRating(q, qstats);
  p.ratings[q.theme] = Math.round(r + K * ((ok ? 1 : 0) - expected(r, d)));

  const prev = p.seen[q.id];
  if (!ok) {
    p.seen[q.id] = { t: now, box: 0, due: now + INTERVALS[0] * DAY, ok: false };
  } else if (prev?.due !== undefined) {
    const box = prev.box + 1;
    p.seen[q.id] = { t: now, box, due: box < INTERVALS.length ? now + INTERVALS[box] * DAY : undefined, ok: true };
  } else {
    p.seen[q.id] = { t: now, box: INTERVALS.length, ok: true };
  }

  const s = (qstats[q.id] ??= { n: 0, ok: 0 });
  s.n++;
  if (ok) s.ok++;
}

/** Thèmes classés du plus fragile au plus solide, pour le bilan de révision et l'espace parent. */
export function themeStrengths(p: Profile): { theme: ThemeId; rating: number; answered: number; rate: number }[] {
  return (Object.keys(p.stats.themeAnswered) as ThemeId[])
    .map((theme) => {
      const answered = p.stats.themeAnswered[theme] ?? 0;
      const correct = p.stats.themeCorrect[theme] ?? 0;
      return { theme, rating: playerRating(p, theme), answered, rate: answered ? correct / answered : 0 };
    })
    .sort((a, b) => a.rating - b.rating);
}
