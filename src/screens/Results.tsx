import { useEffect, useMemo, useState } from 'react';
import { useApp, type Route } from '../app/context';
import { Icon } from '../components/Icon';
import { AdBanner } from '../components/ui';
import { BADGES, CARDS, DEPARTMENTS } from '../data/catalog';
import { nextCreative, shouldShowFlyer, shouldShowInterstitial } from '../engine/ads';
import { getState, universeOf, useActiveProfile } from '../store/state';
import { duelCode } from './Duel';

const JOKER_LABEL = { fifty: '50/50', time: '+15 s', skip: 'Passer' };

export function Results({ route }: { route: Extract<Route, { name: 'results' }> }) {
  const { go, celebrate, showAd, gate, toast } = useApp();
  const p = useActiveProfile()!;
  const s = route.summary;
  const universe = universeOf(p);
  const ratio = s.total ? s.correct / s.total : 0;
  const [shown, setShown] = useState(0);
  const ad = useMemo(() => nextCreative(), []);
  const R = 82;
  const C = 2 * Math.PI * R;

  const title = ratio === 1 ? 'Sans faute !' : ratio >= 0.7 ? 'Bien joué !' : ratio >= 0.5 ? 'Pas mal !' : 'On continue !';
  const sub =
    ratio >= 0.7 ? 'Tu progresses vite. Continue comme ça.' : 'Chaque erreur est une question que tu retrouveras pour mieux la retenir.';

  useEffect(() => {
    const t1 = setTimeout(() => setShown(ratio), 80);
    if (ratio >= 0.7) setTimeout(celebrate, 350);
    // Publicité entre deux séries, jamais pendant une question (section 5.1).
    const cur = getState().profiles.find((x) => x.id === getState().activeId)!;
    const t2 = setTimeout(() => {
      if (s.unlocked && shouldShowInterstitial(cur)) showAd('video');
      else if (shouldShowFlyer(cur)) showAd('flyer');
    }, 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unlockedDept = s.unlocked ? DEPARTMENTS.find((d) => d.id === s.unlocked) : null;
  const replay = () => {
    if (route.mode === 'adventure') go({ name: 'quiz', mode: 'adventure', title: route.title, dept: route.dept });
    else if (route.mode === 'quick') go({ name: 'quiz', mode: 'quick', title: 'Quiz rapide' });
    else if (route.mode === 'revision') go({ name: 'revision' });
    else go({ name: 'home' });
  };

  return (
    <main className="screen full enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="kicker">{route.title}</span>
        <button className="icon-btn" onClick={() => go({ name: 'home' })} aria-label="Accueil">
          <Icon name="close" />
        </button>
      </div>

      <section className="result-hero">
        <div className="score-ring" role="img" aria-label={`${s.correct} bonnes réponses sur ${s.total}`}>
          <svg viewBox="0 0 190 190">
            <defs>
              <linearGradient id="tricolor" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#2ee88f" />
                <stop offset=".55" stopColor="#ffc42e" />
                <stop offset="1" stopColor="#ff4d5e" />
              </linearGradient>
            </defs>
            <circle className="track" cx="95" cy="95" r={R} />
            <circle className="run" cx="95" cy="95" r={R} strokeDasharray={C} strokeDashoffset={C * (1 - shown)} />
          </svg>
          <div className="num">
            <b>
              {s.correct}
              <span style={{ fontSize: '1.4rem', color: 'var(--ink-3)' }}>/{s.total}</span>
            </b>
            <small>bonnes réponses</small>
          </div>
        </div>
        <h1>{title}</h1>
        <p className="muted" style={{ margin: '8px auto 0', maxWidth: 320 }}>
          {sub}
        </p>
        {s.stars !== undefined && (
          <div className="stars" aria-label={`${s.stars} étoiles sur 3`}>
            {[1, 2, 3].map((i) => (
              <Icon key={i} name="star" className={i <= s.stars! ? 'on' : ''} />
            ))}
          </div>
        )}
      </section>

      <div className="gains">
        <div className="gain">
          <b style={{ color: 'var(--green)' }}>+{s.xp}</b>
          <small>XP</small>
        </div>
        <div className="gain">
          <b style={{ color: 'var(--yellow)' }}>+{s.coins}</b>
          <small>pièces</small>
        </div>
        <div className="gain">
          <b>{s.levelAfter}</b>
          <small>{s.levelAfter > s.levelBefore ? 'niveau ↑' : 'niveau'}</small>
        </div>
      </div>

      {unlockedDept && (
        <div className="unlock">
          <span className="big">{unlockedDept.emoji}</span>
          <div>
            <strong>Nouveau monde : {unlockedDept.name}</strong>
            <small className="muted">{unlockedDept.fact}</small>
          </div>
        </div>
      )}
      {s.newBadges.map((b) => {
        const d = BADGES.find((x) => x.id === b)!;
        return (
          <div key={b} className="unlock">
            <span className="big">{d.icon}</span>
            <div>
              <strong>Badge : {d.name}</strong>
              <small className="muted">{d.desc}</small>
            </div>
          </div>
        );
      })}
      {s.newCards.map((c) => (
        <div key={c} className="unlock">
          <span className="big">{CARDS[c].emoji}</span>
          <div>
            <strong>Carte : {CARDS[c].name}</strong>
            <small className="muted">Ajoutée à ta collection</small>
          </div>
        </div>
      ))}
      {s.bonusJoker && (
        <div className="unlock">
          <span className="big">🎁</span>
          <div>
            <strong>Joker bonus : {JOKER_LABEL[s.bonusJoker]}</strong>
            <small className="muted">Récompense du sans-faute</small>
          </div>
        </div>
      )}

      {route.mode === 'duel' && route.seed && (
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="kicker">Code du duel</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '.12em', margin: '6px 0' }}>{duelCode(route.seed, universe)}</div>
          <p className="muted" style={{ margin: 0, fontSize: '.9rem' }}>
            Donne ce code à ton ami : il jouera exactement les mêmes questions. Ton score : {s.correct}/{s.total}.
          </p>
        </div>
      )}

      <div className="row-gap" style={{ marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={() => go({ name: route.mode === 'adventure' ? 'adventure' : 'home' })}>
          {route.mode === 'adventure' ? 'Carte' : 'Accueil'}
        </button>
        {route.mode !== 'daily' && route.mode !== 'duel' && (
          <button className="btn btn-primary" onClick={replay}>
            <Icon name="refresh" /> Rejouer
          </button>
        )}
      </div>

      {(universe !== 'petits' || p.ads.gamesToday > 3) && (
        <AdBanner ad={ad} onClick={() => gate('Cette publicité ouvre un site externe. Un adulte doit confirmer.', () => toast('Lien externe (démo)'))} />
      )}
    </main>
  );
}
