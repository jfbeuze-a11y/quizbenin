import { useState, type CSSProperties } from 'react';
import { useApp } from '../app/context';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { Overlay, Switch } from '../components/ui';
import { THEMES, UNIVERSES } from '../data/catalog';
import { themeStrengths } from '../engine/adaptive';
import { exportProfile, setState, today, universeOf, updateProfile, useAppState, type ParentControls } from '../store/state';

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function minutes(s: number) {
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
}

export function Parent() {
  const { go, toast } = useApp();
  const { profiles, activeId } = useAppState();
  const [childId, setChildId] = useState(activeId ?? profiles[0]?.id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const c = profiles.find((x) => x.id === childId);

  if (!c) {
    return (
      <main className="screen full">
        <button className="btn btn-primary" onClick={() => go({ name: 'welcome' })}>
          Retour
        </button>
      </main>
    );
  }

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    const offset = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - offset + i);
    return c.stats.secondsByDay[today(d)] ?? 0;
  });
  const weekMax = Math.max(...week, 600);
  const strengths = themeStrengths(c);
  const setCtl = <K extends keyof ParentControls>(k: K, v: ParentControls[K]) => updateProfile(c.id, (x) => void (x.parent[k] = v));
  const u = universeOf(c);

  const download = () => {
    const blob = new Blob([exportProfile(c)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `quizbenin-${c.pseudo.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <main className="screen full enter">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="icon-btn" onClick={() => go({ name: activeId ? 'settings' : 'welcome' })} aria-label="Retour">
          <Icon name="back" />
        </button>
        <div>
          <div className="kicker">Espace parent</div>
          <h1 style={{ fontSize: '1.4rem', marginTop: 4 }}>Suivi et réglages</h1>
        </div>
      </div>

      {profiles.length > 1 && (
        <div className="segmented">
          {profiles.map((x) => (
            <button key={x.id} aria-pressed={x.id === c.id} onClick={() => setChildId(x.id)}>
              {x.pseudo}
            </button>
          ))}
        </div>
      )}

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: profiles.length > 1 ? 0 : 18 }}>
        <Avatar cfg={c.avatar} size={56} />
        <div style={{ flex: 1 }}>
          <strong>{c.pseudo}</strong>
          <div className="muted" style={{ fontSize: '.85rem' }}>
            {UNIVERSES[u].name} · {c.grade} · né·e en {c.birthYear}
          </div>
        </div>
      </div>

      <div className="section-title">
        <h2>Temps de jeu</h2>
        <span className="muted" style={{ fontWeight: 700, fontSize: '.85rem' }}>
          Aujourd'hui : {minutes(c.stats.secondsByDay[today()] ?? 0)}
        </span>
      </div>
      <div className="card">
        <div className="week" aria-label="Temps de jeu cette semaine">
          {week.map((s, i) => (
            <div key={i}>
              <i style={{ height: `${(s / weekMax) * 100}%` }} title={minutes(s)} />
              <small>{DAYS[i]}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="section-title">
        <h2>Progrès par thème</h2>
      </div>
      <div className="card">
        {strengths.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            Pas encore de partie jouée.
          </p>
        ) : (
          <div className="bars">
            {[...strengths].reverse().map((s) => (
              <div key={s.theme} className="bar-row" style={{ '--c': THEMES[s.theme].color } as CSSProperties}>
                <span>{THEMES[s.theme].label}</span>
                <span className="track">
                  <i style={{ width: `${Math.round(s.rate * 100)}%` }} />
                </span>
                <span className="v">{Math.round(s.rate * 100)} %</span>
              </div>
            ))}
          </div>
        )}
        {strengths.length > 0 && strengths[0].answered >= 3 && (
          <div className="notice">
            <Icon name="info" />
            <span>
              Point à travailler : <b>{THEMES[strengths[0].theme].label}</b>. Les questions ratées reviennent automatiquement quelques jours plus tard.
            </span>
          </div>
        )}
      </div>

      <div className="section-title">
        <h2>Règles</h2>
      </div>
      <div className="list">
        <div className="list-row">
          <span className="lbl">
            <strong>Limite quotidienne</strong>
            <small>{c.parent.dailyLimitMin ? 'Le jeu se met en pause une fois la limite atteinte' : 'Aucune limite'}</small>
          </span>
          <div className="stepper">
            <button onClick={() => setCtl('dailyLimitMin', Math.max(0, c.parent.dailyLimitMin - 15))} aria-label="Moins de temps">
              −
            </button>
            <b>{c.parent.dailyLimitMin ? `${c.parent.dailyLimitMin} min` : 'Off'}</b>
            <button onClick={() => setCtl('dailyLimitMin', Math.min(240, c.parent.dailyLimitMin + 15))} aria-label="Plus de temps">
              +
            </button>
          </div>
        </div>
        <div className="list-row">
          <span className="lbl">
            <strong>Pas de jeu de 21 h à 7 h</strong>
            <small>Aucune notification non plus sur cette plage</small>
          </span>
          <Switch checked={c.parent.curfew} onChange={(v) => setCtl('curfew', v)} label="Couvre-feu" />
        </div>
        <div className="list-row">
          <span className="lbl">
            <strong>Duels entre amis</strong>
            <small>Par code uniquement, sans messagerie</small>
          </span>
          <Switch checked={c.parent.duels} onChange={(v) => setCtl('duels', v)} label="Duels" />
        </div>
        <div className="list-row">
          <span className="lbl">
            <strong>Classements</strong>
            <small>Pseudo, avatar et département seulement</small>
          </span>
          <Switch checked={c.parent.leaderboards} onChange={(v) => setCtl('leaderboards', v)} label="Classements" />
        </div>
      </div>

      <div className="section-title">
        <h2>Publicité</h2>
      </div>
      <div className="card">
        <p style={{ margin: 0, fontSize: '.92rem' }} className="muted">
          Publicités contextuelles, jamais ciblées sur votre enfant. Pas d'alcool, de jeux d'argent, de crédit ni de politique. Au plus 10 minutes de publicité par heure de jeu, jamais pendant une
          question. Tout clic passe par une vérification adulte.
        </p>
      </div>

      <div className="section-title">
        <h2>Données</h2>
      </div>
      <div className="list">
        <button className="list-row" onClick={download}>
          <Icon name="download" />
          <span className="lbl">
            <strong>Exporter les données</strong>
            <small>Fichier JSON avec la progression de ce profil</small>
          </span>
        </button>
        <button className="list-row" onClick={() => setConfirmDelete(true)}>
          <Icon name="trash" />
          <span className="lbl">
            <strong style={{ color: 'var(--bad)' }}>Supprimer ce profil</strong>
            <small>Efface définitivement la progression</small>
          </span>
        </button>
      </div>
      <div className="notice">
        <Icon name="shield" />
        <span>Données conservées : pseudo, avatar, année de naissance, classe, département, résultats. Jamais de nom, photo, voix, position GPS ni contacts.</span>
      </div>

      {confirmDelete && (
        <Overlay label="Supprimer le profil" onBackdrop={() => setConfirmDelete(false)}>
          <div className="modal">
            <h3>Supprimer {c.pseudo} ?</h3>
            <p>Toute la progression, les badges et les cartes de ce profil seront effacés de cet appareil.</p>
            <div className="row-gap">
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)} autoFocus>
                Annuler
              </button>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--bad)', color: '#fff', boxShadow: 'none' }}
                onClick={() => {
                  setState((s) => {
                    s.profiles = s.profiles.filter((x) => x.id !== c.id);
                    if (s.activeId === c.id) s.activeId = null;
                  });
                  setConfirmDelete(false);
                  toast('Profil supprimé');
                  const rest = profiles.filter((x) => x.id !== c.id);
                  if (rest.length) setChildId(rest[0].id);
                  else go({ name: 'welcome' });
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </main>
  );
}
