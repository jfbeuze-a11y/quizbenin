import { useMemo, type CSSProperties } from 'react';
import { useApp } from '../app/context';
import { Icon } from '../components/Icon';
import { AdBanner } from '../components/ui';
import { DEPARTMENTS, UNIVERSES } from '../data/catalog';
import { canWatchRewarded, nextCreative } from '../engine/ads';
import { isWorldOpen } from '../engine/rewards';
import { today, universeOf, updateProfile, useActiveProfile } from '../store/state';
import { TopBar } from './TopBar';

const GREETINGS = ['Prêt·e pour un défi ?', 'On remet ça ?', 'Ta flamme t\'attend.', 'Un quiz, cinq minutes.'];

export function Home() {
  const { go, showAd, toast, gate } = useApp();
  const p = useActiveProfile()!;
  const u = universeOf(p);
  const info = UNIVERSES[u];
  const dailyDone = p.stats.dailyDone.includes(today());
  const ad = useMemo(() => nextCreative(), []);
  const greet = useMemo(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)], []);
  const worldsDone = DEPARTMENTS.filter((d) => (p.worlds[d.id] ?? 0) > 0).length;
  const nextWorld = DEPARTMENTS.find((d) => isWorldOpen(p, d.id) && !(p.worlds[d.id] ?? 0)) ?? DEPARTMENTS[0];

  const watch = () =>
    showAd('rewarded', (completed) => {
      if (!completed) return;
      updateProfile(p.id, (x) => {
        x.jokers.fifty += 1;
        x.coins += 10;
      });
      toast('+1 joker 50/50 et +10 pièces');
    });

  return (
    <>
      <TopBar />
      <main className="screen enter">
        <p className="muted" style={{ margin: '6px 2px 14px', fontWeight: 700 }}>
          {u === 'champions' ? greet : `${info.mascot} ${info.mascotName} : « ${u === 'petits' ? 'On joue ensemble ?' : 'Une nouvelle aventure t\'attend ?'} »`}
        </p>

        <button
          className={`hero ${dailyDone ? 'done' : ''}`}
          onClick={() => !dailyDone && go({ name: 'quiz', mode: 'daily', title: 'Défi du jour', seed: today(), n: 5 })}
          disabled={dailyDone}
          aria-label={dailyDone ? 'Défi du jour terminé, reviens demain' : 'Lancer le défi du jour'}
        >
          <div>
            <div className="kicker">Défi du jour · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            <h3>
              {dailyDone ? (
                'Bien joué !'
              ) : (
                <>
                  5 questions.
                  <br />
                  Une seule chance.
                </>
              )}
            </h3>
          </div>
          <div className="row">
            <span style={{ fontWeight: 700, opacity: 0.9, fontSize: '.9rem' }}>
              {dailyDone ? 'Nouveau défi demain' : `Les mêmes pour tous les ${info.name}`}
            </span>
            {!dailyDone && (
              <span className="go">
                <Icon name="play" />
              </span>
            )}
          </div>
        </button>

        <div className="section-title">
          <h2>Jouer</h2>
        </div>
        <div className="modes">
          <button className="mode" style={{ '--c': 'var(--yellow)' } as CSSProperties} onClick={() => go({ name: 'quiz', mode: 'quick', title: 'Quiz rapide' })}>
            <span className="ico">
              <Icon name="bolt" />
            </span>
            <span>
              <strong>Quiz rapide</strong>
              <small>10 questions à ton niveau</small>
            </span>
          </button>
          <button className="mode" style={{ '--c': 'var(--green)' } as CSSProperties} onClick={() => go({ name: 'adventure' })}>
            <span className="tag">{worldsDone}/12</span>
            <span className="ico">
              <Icon name="map" />
            </span>
            <span>
              <strong>Aventure</strong>
              <small>Prochain : {nextWorld.name}</small>
            </span>
          </button>
          {u !== 'petits' && (
            <button className="mode" style={{ '--c': 'var(--cyan)' } as CSSProperties} onClick={() => go({ name: 'revision' })}>
              <span className="ico">
                <Icon name="book" />
              </span>
              <span>
                <strong>Révision {u === 'champions' ? 'BEPC' : 'CEP'}</strong>
                <small>Travaille tes points faibles</small>
              </span>
            </button>
          )}
          {u !== 'petits' && p.parent.duels && (
            <button className="mode" style={{ '--c': 'var(--red)' } as CSSProperties} onClick={() => go({ name: 'duel' })}>
              <span className="ico">
                <Icon name="swords" />
              </span>
              <span>
                <strong>Duel</strong>
                <small>Défie un ami avec un code</small>
              </span>
            </button>
          )}
          {u !== 'petits' && (
            <button className="mode wide" style={{ '--c': 'var(--violet)' } as CSSProperties} onClick={watch} disabled={!canWatchRewarded(p)}>
              <span className="ico">
                <Icon name="video" />
              </span>
              <div>
                <strong>Bonus joker</strong>
                <small>{canWatchRewarded(p) ? 'Regarde une courte vidéo si tu veux : +1 joker 50/50' : 'Reviens demain pour un nouveau bonus'}</small>
              </div>
              <Icon name="chevron" className="" />
            </button>
          )}
        </div>

        <div className="section-title">
          <h2>Mes jokers</h2>
        </div>
        <div className="card" style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          {(
            [
              ['half', '50/50', p.jokers.fifty],
              ['clock', '+ temps', p.jokers.time],
              ['skip', 'Passer', p.jokers.skip],
            ] as const
          ).map(([ic, l, n]) => (
            <div key={l} style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
              <Icon name={ic} className="" />
              <b style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>{n}</b>
              <small className="muted" style={{ fontWeight: 700 }}>
                {l}
              </small>
            </div>
          ))}
        </div>

        {u !== 'petits' && <AdBanner ad={ad} onClick={() => gate('Cette publicité ouvre un site externe. Un adulte doit confirmer.', () => toast('Lien externe (démo)'))} />}
      </main>
    </>
  );
}
