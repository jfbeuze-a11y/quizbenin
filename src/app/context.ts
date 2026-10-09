import { createContext, useContext } from 'react';
import type { Mode } from '../engine/adaptive';
import type { SeriesSummary } from '../engine/rewards';
import type { DeptId, ThemeId } from '../data/types';

export type Route =
  | { name: 'welcome' }
  | { name: 'onboard' }
  | { name: 'unlock'; profileId: string }
  | { name: 'home' }
  | { name: 'adventure' }
  | { name: 'ranking' }
  | { name: 'profile' }
  | { name: 'settings' }
  | { name: 'parent' }
  | { name: 'revision' }
  | { name: 'duel' }
  | { name: 'quiz'; mode: Mode; title: string; dept?: DeptId; theme?: ThemeId; seed?: string; n?: number }
  | { name: 'results'; summary: SeriesSummary; mode: Mode; title: string; dept?: DeptId; seed?: string };

export interface AppCtx {
  go: (r: Route) => void;
  toast: (text: string) => void;
  gate: (reason: string, onPass: () => void) => void;
  celebrate: () => void;
  /** Ouvre une publicité plein écran ; `done(completed)` est appelé à la fermeture. */
  showAd: (kind: 'flyer' | 'video' | 'rewarded', done?: (completed: boolean) => void) => void;
}

export const Ctx = createContext<AppCtx>(null as unknown as AppCtx);
export const useApp = () => useContext(Ctx);
