import { CARDS, DEPARTMENTS, UNIVERSES } from '../data/catalog';
import { QUESTIONS } from '../data/questions';
import type { DeptId } from '../data/types';
import { levelOf, rollDay, today, touchStreak, universeOf, type Profile } from '../store/state';
import type { Mode } from './adaptive';

export interface AnswerLog {
  qid: string;
  ok: boolean;
  ms: number;
  skipped?: boolean;
}

export interface SeriesSummary {
  correct: number;
  total: number;
  xp: number;
  coins: number;
  levelBefore: number;
  levelAfter: number;
  newBadges: string[];
  newCards: string[];
  stars?: number;
  unlocked?: DeptId;
  bonusJoker?: 'fifty' | 'time' | 'skip';
}

const byId = new Map(QUESTIONS.map((q) => [q.id, q]));

export function finishSeries(p: Profile, mode: Mode, answers: AnswerLog[], dept?: DeptId): SeriesSummary {
  rollDay(p);
  const universe = universeOf(p);
  const timer = UNIVERSES[universe].timer;
  const levelBefore = levelOf(p.xp).level;
  const correct = answers.filter((a) => a.ok).length;
  const total = answers.length;

  let xp = 0;
  for (const a of answers) {
    if (!a.ok) continue;
    xp += 10;
    if (timer && a.ms < (timer * 1000) / 2) xp += 5;
  }
  const perfect = correct === total && total > 0;
  if (perfect) xp += 30;
  if (mode === 'daily') xp += 20;
  const coins = correct * 3 + 10 + (perfect ? 15 : 0);

  p.xp += xp;
  p.coins += coins;
  p.stats.series += 1;
  if (perfect) p.stats.perfect += 1;
  if (mode === 'daily' && !p.stats.dailyDone.includes(today())) p.stats.dailyDone.push(today());
  p.ads.seriesSinceFlyer += 1;
  p.ads.gamesToday += 1;
  touchStreak(p);

  const newCards: string[] = [];
  for (const a of answers) {
    const card = byId.get(a.qid)?.card;
    if (a.ok && card && CARDS[card] && !p.cards.includes(card) && !newCards.includes(card)) newCards.push(card);
  }
  p.cards.push(...newCards);

  let bonusJoker: SeriesSummary['bonusJoker'];
  if (perfect) {
    const kinds = ['fifty', 'time', 'skip'] as const;
    bonusJoker = kinds[Math.floor(Math.random() * kinds.length)];
    p.jokers[bonusJoker] += 1;
  }

  let stars: number | undefined;
  let unlocked: DeptId | undefined;
  if (mode === 'adventure' && dept) {
    stars = correct >= total ? 3 : correct >= Math.ceil(total * 0.9) ? 2 : correct >= Math.ceil(total * 0.7) ? 1 : 0;
    const before = p.worlds[dept] ?? 0;
    if (stars > before) p.worlds[dept] = stars;
    const idx = DEPARTMENTS.findIndex((d) => d.id === dept);
    const next = DEPARTMENTS[idx + 1];
    if (stars > 0 && before === 0 && next) unlocked = next.id;
  }

  const newBadges = checkBadges(p);
  return { correct, total, xp, coins, levelBefore, levelAfter: levelOf(p.xp).level, newBadges, newCards, stars, unlocked, bonusJoker };
}

export function isWorldOpen(p: Profile, dept: DeptId): boolean {
  const idx = DEPARTMENTS.findIndex((d) => d.id === dept);
  if (idx <= 0) return true;
  return (p.worlds[DEPARTMENTS[idx - 1].id] ?? 0) > 0;
}

function checkBadges(p: Profile): string[] {
  const rules: Record<string, boolean> = {
    first: p.stats.series >= 1,
    perfect: p.stats.perfect >= 1,
    abomey: p.stats.danhomeCorrect >= 50,
    geo: (p.stats.themeCorrect.geographie ?? 0) >= 30,
    flame7: p.streak.count >= 7,
    explorer: Object.values(p.worlds).filter((s) => (s ?? 0) > 0).length >= 4,
    collector: p.cards.length >= 8,
    daily: p.stats.dailyDone.length >= 5,
  };
  const earned = Object.entries(rules)
    .filter(([id, ok]) => ok && !p.badges.includes(id))
    .map(([id]) => id);
  p.badges.push(...earned);
  return earned;
}
