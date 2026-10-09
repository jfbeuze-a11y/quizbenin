import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Ctx, type AppCtx, type Route } from './context';
import { waxTile, WAX_HERO } from './wax';
import { getState, rollDay, setState, today, universeOf, updateProfile, useActiveProfile } from '../store/state';
import { nextCreative } from '../engine/ads';
import { AdOverlay, Confetti, ParentalGate, Toast, type AdKind } from '../components/ui';
import { Icon } from '../components/Icon';
import { Welcome, Onboarding, Unlock, Logo } from '../screens/Welcome';
import { Home } from '../screens/Home';
import { Quiz } from '../screens/Quiz';
import { Results } from '../screens/Results';
import { Adventure } from '../screens/Adventure';
import { ProfileScreen } from '../screens/Profile';
import { Ranking } from '../screens/Ranking';
import { Settings } from '../screens/Settings';
import { Parent } from '../screens/Parent';
import { Revision } from '../screens/Revision';
import { Duel } from '../screens/Duel';
import type { AdCreative } from '../data/catalog';

const WAX: Record<string, string> = {
  champions: waxTile('rgba(255,255,255,0.05)'),
  aventuriers: waxTile('rgba(255,196,46,0.08)'),
  petits: waxTile('rgba(255,138,31,0.13)'),
  light: waxTile('rgba(20,18,12,0.05)'),
};

const PUBLIC_ROUTES: Route['name'][] = ['welcome', 'onboard', 'unlock', 'parent'];

const TABS = [
  { route: 'home', label: 'Accueil', icon: 'home' },
  { route: 'adventure', label: 'Aventure', icon: 'map' },
  { route: 'ranking', label: 'Classement', icon: 'trophy' },
  { route: 'profile', label: 'Profil', icon: 'user' },
] as const;

function isLocked(p: NonNullable<ReturnType<typeof useActiveProfile>>, overrideUntil: number): string | null {
  if (Date.now() < overrideUntil) return null;
  const h = new Date().getHours();
  if (p.parent.curfew && (h >= 21 || h < 7)) return "Il est tard ! Le jeu reprend demain à 7 h. Bonne nuit 🌙";
  const played = p.stats.secondsByDay[today()] ?? 0;
  if (p.parent.dailyLimitMin > 0 && played >= p.parent.dailyLimitMin * 60)
    return `Tu as joué ${p.parent.dailyLimitMin} minutes aujourd'hui. C'est le moment de faire une pause !`;
  return null;
}

export function App() {
  const profile = useActiveProfile();
  const [route, setRoute] = useState<Route>(() => (getState().activeId ? { name: 'home' } : { name: 'welcome' }));
  const [toastMsg, setToastMsg] = useState<{ text: string; k: number } | null>(null);
  const [gateReq, setGateReq] = useState<{ reason: string; onPass: () => void } | null>(null);
  const [confetti, setConfetti] = useState(0);
  const [ad, setAd] = useState<{ kind: AdKind; creative: AdCreative; done?: (c: boolean) => void } | null>(null);
  const [override, setOverride] = useState(0);
  // Démarrage : écran de chargement, puis spot vidéo de 7 s, puis l'application.
  const [launch, setLaunch] = useState<'splash' | 'spot' | 'done'>('splash');

  // Google Play Familles interdit les vidéos plein écran avant l'écran de chargement :
  // le spot passe donc après le logo, une seule fois par lancement.
  useEffect(() => {
    const id = setTimeout(() => {
      setLaunch('spot');
      setAd({ kind: 'launch', creative: nextCreative(), done: () => setLaunch('done') });
    }, 1200);
    return () => clearTimeout(id);
  }, []);

  // Pas de profil actif : retour au choix du profil.
  useEffect(() => {
    if (!profile && !PUBLIC_ROUTES.includes(route.name)) setRoute({ name: 'welcome' });
  }, [profile, route.name]);

  // Temps de jeu (tableau de bord parent, limites quotidiennes, plafond publicitaire).
  useEffect(() => {
    if (!profile) return;
    const id = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      updateProfile(profile.id, (p) => {
        const d = today();
        p.stats.secondsByDay[d] = (p.stats.secondsByDay[d] ?? 0) + 15;
      });
    }, 15000);
    return () => clearInterval(id);
  }, [profile?.id]);

  // Enregistrement du service worker : jeu hors connexion après la première visite.
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('sw.js').catch(() => {});
  }, []);

  const go = useCallback((r: Route) => {
    setRoute(r);
    document.querySelector('.screen')?.scrollTo({ top: 0 });
  }, []);

  const ctx: AppCtx = useMemo(
    () => ({
      go,
      toast: (text) => setToastMsg({ text, k: Date.now() }),
      gate: (reason, onPass) => setGateReq({ reason, onPass }),
      celebrate: () => setConfetti((c) => c + 1),
      showAd: (kind, done) => setAd({ kind, creative: nextCreative(), done }),
    }),
    [go]
  );

  const universe = profile ? universeOf(profile) : 'champions';
  const theme = profile?.settings.theme ?? 'auto';
  const waxKey = theme === 'light' && universe !== 'petits' ? 'light' : universe;

  const lockReason = profile && !PUBLIC_ROUTES.includes(route.name) ? isLocked(profile, override) : null;
  const showTabs = launch === 'done' && profile && ['home', 'adventure', 'ranking', 'profile'].includes(route.name) && !lockReason;
  const rankingAllowed = profile && universe !== 'petits' && profile.parent.leaderboards;

  let screen;
  if (launch !== 'done') {
    screen = (
      <div className="screen full splash">
        <Logo />
        <div className="splash-bar" aria-label="Chargement">
          <i />
        </div>
      </div>
    );
  } else if (!profile && !PUBLIC_ROUTES.includes(route.name)) {
    // Profil désactivé (changement de profil) : l'effet ci-dessus ramène à l'accueil.
    screen = <Welcome />;
  } else if (lockReason) {
    screen = (
      <div className="screen full enter">
        <div className="lockscreen">
          <div className="em">⏸️</div>
          <h2>Pause</h2>
          <p className="muted">{lockReason}</p>
          <button className="btn btn-ghost" onClick={() => ctx.gate('Débloquer le jeu pendant 30 minutes.', () => setOverride(Date.now() + 30 * 60_000))}>
            <Icon name="shield" /> Accès parent
          </button>
          <button className="btn btn-quiet" onClick={() => setState((s) => void (s.activeId = null))}>
            Changer de profil
          </button>
        </div>
      </div>
    );
  } else
    switch (route.name) {
      case 'welcome':
        screen = <Welcome />;
        break;
      case 'onboard':
        screen = <Onboarding />;
        break;
      case 'unlock':
        screen = <Unlock profileId={route.profileId} />;
        break;
      case 'home':
        screen = <Home />;
        break;
      case 'adventure':
        screen = <Adventure />;
        break;
      case 'ranking':
        screen = <Ranking />;
        break;
      case 'profile':
        screen = <ProfileScreen />;
        break;
      case 'settings':
        screen = <Settings />;
        break;
      case 'parent':
        screen = <Parent />;
        break;
      case 'revision':
        screen = <Revision />;
        break;
      case 'duel':
        screen = <Duel />;
        break;
      case 'quiz':
        screen = <Quiz key={JSON.stringify(route)} route={route} />;
        break;
      case 'results':
        screen = <Results key={JSON.stringify(route.summary)} route={route} />;
        break;
    }

  return (
    <Ctx.Provider value={ctx}>
      <div className="stage">
        <div
          className="app"
          data-universe={universe}
          data-theme={theme}
          data-eco={profile?.settings.eco ?? false}
          data-dyslexia={profile?.settings.dyslexia ?? false}
          style={{ '--wax-bg': WAX[waxKey], '--wax-hero': WAX_HERO } as CSSProperties}
        >
          {screen}

          {showTabs && (
            <nav className="tabbar" aria-label="Navigation principale">
              {TABS.filter((t) => t.route !== 'ranking' || rankingAllowed).map((t) => (
                <button key={t.route} className="tab" aria-current={route.name === t.route ? 'page' : undefined} onClick={() => go({ name: t.route })}>
                  <Icon name={t.icon} />
                  {t.label}
                </button>
              ))}
            </nav>
          )}

          <Confetti fire={confetti} />

          {ad && (
            <AdOverlay
              kind={ad.kind}
              ad={ad.creative}
              onClick={() => ctx.gate("Cette publicité ouvre un site externe. Un adulte doit confirmer.", () => ctx.toast('Lien externe (démo) : rien n\'a été ouvert'))}
              onClose={(completed, seconds) => {
                if (profile) updateProfile(profile.id, (p) => {
                  rollDay(p);
                  p.ads.adSeconds += seconds;
                  if (ad.kind === 'flyer') {
                    p.ads.flyers += 1;
                    p.ads.seriesSinceFlyer = 0;
                  }
                  if (ad.kind === 'video') p.ads.interstitials += 1;
                  if (ad.kind === 'rewarded' && completed) p.ads.rewarded += 1;
                });
                const done = ad.done;
                setAd(null);
                done?.(completed);
              }}
            />
          )}

          {gateReq && (
            <ParentalGate
              reason={gateReq.reason}
              onCancel={() => setGateReq(null)}
              onPass={() => {
                const f = gateReq.onPass;
                setGateReq(null);
                f();
              }}
            />
          )}

          {toastMsg && <Toast key={toastMsg.k} text={toastMsg.text} />}
        </div>
      </div>
    </Ctx.Provider>
  );
}
