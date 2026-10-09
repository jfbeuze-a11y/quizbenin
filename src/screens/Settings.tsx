import { useApp } from '../app/context';
import { Icon } from '../components/Icon';
import { Switch } from '../components/ui';
import { setState, updateProfile, useActiveProfile, type Settings as S } from '../store/state';

export function Settings() {
  const { go, gate } = useApp();
  const p = useActiveProfile()!;
  const set = <K extends keyof S>(k: K, v: S[K]) => updateProfile(p.id, (x) => void (x.settings[k] = v));

  const toggles: [keyof S, string, string][] = [
    ['sound', 'Sons', 'Percussions et effets de réponse'],
    ['vibration', 'Vibrations', 'Petite vibration à chaque réponse'],
    ['autoRead', 'Lecture audio automatique', 'Les questions sont lues à voix haute'],
    ['eco', 'Économie de données', 'Coupe les vidéos et les animations lourdes'],
    ['dyslexia', 'Police lisible', 'Police adaptée à la dyslexie'],
  ];

  return (
    <main className="screen full enter">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="icon-btn" onClick={() => go({ name: 'home' })} aria-label="Retour">
          <Icon name="back" />
        </button>
        <h1 style={{ fontSize: '1.4rem' }}>Paramètres</h1>
      </div>

      <div className="section-title">
        <h2>Jeu</h2>
      </div>
      <div className="list">
        {toggles.map(([k, label, hint]) => (
          <div key={k} className="list-row">
            <span className="lbl">
              <strong>{label}</strong>
              <small>{hint}</small>
            </span>
            <Switch checked={p.settings[k] as boolean} onChange={(v) => set(k, v as never)} label={label} />
          </div>
        ))}
        <div className="list-row">
          <span className="lbl">
            <strong>Thème</strong>
            <small>Le mode sombre économise la batterie</small>
          </span>
          <div className="segmented" style={{ margin: 0, flex: 'none' }}>
            {(
              [
                ['auto', 'Auto'],
                ['dark', 'Sombre'],
                ['light', 'Clair'],
              ] as const
            ).map(([v, l]) => (
              <button key={v} aria-pressed={p.settings.theme === v} onClick={() => set('theme', v)} style={{ minHeight: 34, padding: '0 10px' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="section-title">
        <h2>Hors connexion</h2>
      </div>
      <div className="list">
        <div className="list-row">
          <Icon name="wifi" />
          <span className="lbl">
            <strong>Paquets de questions</strong>
            <small>Toutes les questions de ton univers sont déjà sur l'appareil. Téléchargement des nouveaux paquets : Wi-Fi uniquement.</small>
          </span>
        </div>
        <div className="list-row">
          <Icon name="book" />
          <span className="lbl">
            <strong>Langue</strong>
            <small>Français · fon et yoruba bientôt</small>
          </span>
        </div>
      </div>

      <div className="section-title">
        <h2>Famille</h2>
      </div>
      <div className="list">
        <button className="list-row" onClick={() => gate("L'espace parent est réservé aux adultes.", () => go({ name: 'parent' }))}>
          <Icon name="shield" />
          <span className="lbl">
            <strong>Espace parent</strong>
            <small>Temps de jeu, progrès, limites, données</small>
          </span>
          <Icon name="chevron" />
        </button>
        <button className="list-row" onClick={() => setState((s) => void (s.activeId = null))}>
          <Icon name="logout" />
          <span className="lbl">
            <strong>Changer de profil</strong>
            <small>Téléphone partagé ? Chacun son profil (5 au maximum)</small>
          </span>
          <Icon name="chevron" />
        </button>
      </div>

      <p className="muted" style={{ textAlign: 'center', fontSize: '.78rem', marginTop: 28 }}>
        QuizBénin · prototype 0.1 · aucune donnée envoyée
      </p>
    </main>
  );
}
