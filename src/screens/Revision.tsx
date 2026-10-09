import { type CSSProperties } from 'react';
import { useApp } from '../app/context';
import { Icon } from '../components/Icon';
import { THEMES } from '../data/catalog';
import type { ThemeId } from '../data/types';
import { playerRating, poolFor } from '../engine/adaptive';
import { universeOf, useActiveProfile } from '../store/state';

export function Revision() {
  const { go } = useApp();
  const p = useActiveProfile()!;
  const u = universeOf(p);
  const exam = u === 'champions' ? 'BEPC' : 'CEP';
  const pool = poolFor(u, p.country);
  const now = Date.now();
  const due = pool.filter((q) => (p.seen[q.id]?.due ?? Infinity) <= now).length;

  const themes = (Object.keys(THEMES) as ThemeId[])
    .map((t) => {
      const answered = p.stats.themeAnswered[t] ?? 0;
      const correct = p.stats.themeCorrect[t] ?? 0;
      return { t, count: pool.filter((q) => q.theme === t).length, answered, rate: answered ? correct / answered : null, rating: playerRating(p, t) };
    })
    .filter((x) => x.count > 0)
    .sort((a, b) => a.rating - b.rating);

  return (
    <main className="screen full enter">
      <button className="icon-btn" onClick={() => go({ name: 'home' })} aria-label="Retour">
        <Icon name="back" />
      </button>
      <h1 style={{ fontSize: '1.8rem', marginTop: 18 }}>Révision {exam}</h1>
      <p className="muted">Des séries alignées sur le programme. Les thèmes les plus fragiles sont en haut.</p>

      <button className="hero" style={{ minHeight: 0, marginTop: 8 }} onClick={() => go({ name: 'quiz', mode: 'revision', title: `Révision ${exam}` })}>
        <div className="row">
          <div>
            <div className="kicker">Série mixte</div>
            <h3 style={{ fontSize: '1.25rem' }}>{due > 0 ? `${due} question${due > 1 ? 's' : ''} à revoir` : 'Toutes matières'}</h3>
          </div>
          <span className="go">
            <Icon name="play" />
          </span>
        </div>
      </button>

      <div className="section-title">
        <h2>Par thème</h2>
      </div>
      <div className="list">
        {themes.map((x) => (
          <button key={x.t} className="list-row" onClick={() => go({ name: 'quiz', mode: 'revision', title: `Révision · ${THEMES[x.t].label}`, theme: x.t })}>
            <span className="theme-chip" style={{ '--c': THEMES[x.t].color, padding: 8 } as CSSProperties} aria-hidden="true">
              {THEMES[x.t].icon}
            </span>
            <span className="lbl">
              <strong>{THEMES[x.t].label}</strong>
              <small>{x.rate === null ? 'Pas encore travaillé' : `${Math.round(x.rate * 100)} % de réussite sur ${x.answered} questions`}</small>
            </span>
            <Icon name="chevron" />
          </button>
        ))}
      </div>
    </main>
  );
}
