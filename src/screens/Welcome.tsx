import { useState } from 'react';
import { useApp } from '../app/context';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { DEFAULT_AVATAR, DEPARTMENTS, GRADES, SECRET_IMAGES, UNIVERSES, pseudoProblem, randomPseudo, type AvatarConfig, type GradeId } from '../data/catalog';
import type { DeptId, UniverseId } from '../data/types';
import { getState, newProfile, setState, useAppState } from '../store/state';

const MAX_PROFILES = 5;

export function Logo() {
  return (
    <div className="brand">
      <svg className="logo" viewBox="0 0 512 512" aria-hidden="true">
        <rect width="512" height="512" rx="112" fill="#14161d" />
        <rect x="96" y="96" width="110" height="320" rx="28" fill="#2ee88f" />
        <rect x="226" y="96" width="190" height="150" rx="28" fill="#ffc42e" />
        <rect x="226" y="266" width="190" height="150" rx="28" fill="#ff4d5e" />
      </svg>
      <b>
        Quiz<span>Bénin</span>
      </b>
    </div>
  );
}

function activate(id: string) {
  setState((s) => void (s.activeId = id));
}

export function Welcome() {
  const { go } = useApp();
  const { profiles } = useAppState();

  const open = (id: string) => {
    const p = profiles.find((x) => x.id === id)!;
    if (p.pin || p.secretImg) go({ name: 'unlock', profileId: id });
    else {
      activate(id);
      go({ name: 'home' });
    }
  };

  return (
    <div className="screen full enter">
      <Logo />
      <h1 className="splash-title">
        La culture,
        <br />
        en mode <em>jeu.</em>
      </h1>
      <p className="muted" style={{ maxWidth: 340, margin: 0 }}>
        Histoire du Danhomè, géo, sciences, maths… Des quiz faits au Bénin, pour les élèves du CI à la 3e.
      </p>

      {profiles.length > 0 ? (
        <>
          <div className="section-title">
            <h2>Qui joue ?</h2>
          </div>
          <div className="profiles" style={{ marginTop: 0 }}>
            {profiles.map((p) => (
              <button key={p.id} className="profile-tile" onClick={() => open(p.id)}>
                <Avatar cfg={p.avatar} size={76} />
                <span>{p.pseudo}</span>
                {(p.pin || p.secretImg) && <small className="muted" style={{ fontSize: '.7rem', marginTop: -6 }}>🔒</small>}
              </button>
            ))}
            {profiles.length < MAX_PROFILES && (
              <button className="profile-tile" onClick={() => go({ name: 'onboard' })}>
                <span className="add">
                  <Icon name="user" />
                </span>
                <span className="muted">Ajouter</span>
              </button>
            )}
          </div>
        </>
      ) : (
        <div style={{ marginTop: 40, display: 'grid', gap: 12 }}>
          <button className="btn btn-primary btn-block" onClick={() => go({ name: 'onboard' })}>
            <Icon name="play" /> Jouer maintenant
          </button>
          <div className="notice">
            <Icon name="info" />
            <span>
              Mode invité : ta progression reste sur cet appareil. Un parent pourra ensuite créer un compte (code reçu par SMS) pour la sauvegarder et suivre tes progrès.
            </span>
          </div>
        </div>
      )}

      <div className="notice" style={{ marginTop: 28 }}>
        <Icon name="shield" />
        <span>Pas de nom réel, pas de photo, pas de discussion entre joueurs. Les publicités sont choisies pour ton âge.</span>
      </div>
    </div>
  );
}

// ───────── Création de profil ─────────

export function Onboarding() {
  const { go, toast } = useApp();
  const [step, setStep] = useState(0);
  const [grade, setGrade] = useState<GradeId | null>(null);
  const universe: UniverseId | null = grade ? GRADES.find((g) => g.id === grade)!.universe : null;
  const year = new Date().getFullYear();
  const defaultAge = universe === 'petits' ? 7 : universe === 'aventuriers' ? 10 : 13;
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const by = birthYear ?? year - defaultAge;
  const age = year - by;
  const [dept, setDept] = useState<DeptId | null>(null);
  const [pseudo, setPseudo] = useState(randomPseudo);
  const [freePseudo, setFreePseudo] = useState(false);
  const [avatar, setAvatar] = useState<AvatarConfig>({ ...DEFAULT_AVATAR });
  const [pin, setPin] = useState('');
  const [secret, setSecret] = useState<string | null>(null);

  const pseudoErr = freePseudo ? pseudoProblem(pseudo) : null;
  const steps = 5;

  const finish = (withLock: boolean) => {
    if (getState().profiles.length >= MAX_PROFILES) {
      toast('5 profils au maximum sur un appareil.');
      return;
    }
    const p = newProfile({
      pseudo: pseudo.trim(),
      birthYear: by,
      grade: grade!,
      dept: dept!,
      avatar,
      pin: withLock && universe !== 'petits' && pin.length === 4 ? pin : undefined,
      secretImg: withLock && universe === 'petits' && secret ? secret : undefined,
    });
    setState((s) => {
      s.profiles.push(p);
      s.activeId = p.id;
    });
    go({ name: 'home' });
  };

  const back = () => (step === 0 ? go({ name: 'welcome' }) : setStep(step - 1));

  return (
    <div className="screen full">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="icon-btn" onClick={back} aria-label="Retour">
          <Icon name="back" />
        </button>
        <div className="steps" style={{ flex: 1, margin: 0 }} aria-label={`Étape ${step + 1} sur ${steps}`}>
          {Array.from({ length: steps }, (_, i) => (
            <i key={i} className={i <= step ? 'on' : ''} />
          ))}
        </div>
      </div>

      <div key={step} className="enter" style={{ marginTop: 26 }}>
        {step === 0 && (
          <>
            <h2 style={{ fontSize: '1.6rem' }}>Tu es en quelle classe ?</h2>
            <p className="muted">Les questions s'adaptent à ton niveau, puis à tes résultats.</p>
            {(['petits', 'aventuriers', 'champions'] as const).map((u) => (
              <div key={u} className="grade-group">
                <h4>
                  {UNIVERSES[u].mascot} {UNIVERSES[u].name} · {UNIVERSES[u].ages}
                </h4>
                <div className="grade-grid" style={{ gridTemplateColumns: u === 'champions' ? 'repeat(4,1fr)' : undefined }}>
                  {GRADES.filter((g) => g.universe === u).map((g) => (
                    <button key={g.id} className="choice-tile" aria-pressed={grade === g.id} onClick={() => setGrade(g.id)}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button className="btn btn-primary btn-block" style={{ marginTop: 26 }} disabled={!grade} onClick={() => setStep(1)}>
              Continuer
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={{ fontSize: '1.6rem' }}>Ton année de naissance</h2>
            <p className="muted">On ne demande ni ton nom, ni ta date exacte.</p>
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="stepper">
                <button onClick={() => setBirthYear(by - 1)} aria-label="Année précédente">
                  −
                </button>
                <b style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>{by}</b>
                <button onClick={() => setBirthYear(Math.min(year - 5, by + 1))} aria-label="Année suivante">
                  +
                </button>
              </div>
              <span className="muted" style={{ fontWeight: 700 }}>
                {age} ans
              </span>
            </div>

            <h2 style={{ fontSize: '1.2rem', marginTop: 28 }}>Ton département</h2>
            <p className="muted">Pour des questions sur ta région et le classement départemental.</p>
            <div className="dept-grid">
              {DEPARTMENTS.map((d) => (
                <button key={d.id} className="choice-tile" aria-pressed={dept === d.id} onClick={() => setDept(d.id)}>
                  {d.emoji} {d.name}
                </button>
              ))}
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 22 }} disabled={!dept} onClick={() => setStep(2)}>
              Continuer
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontSize: '1.6rem' }}>Ton pseudo</h2>
            <p className="muted">C'est le seul nom que les autres joueurs verront.</p>
            {freePseudo ? (
              <>
                <input className="field" value={pseudo} maxLength={18} onChange={(e) => setPseudo(e.target.value)} aria-label="Pseudo" autoFocus />
                {pseudoErr && <div className="error">{pseudoErr}</div>}
                <p className="muted" style={{ fontSize: '.82rem' }}>
                  Pas de vrai nom, pas de numéro. Les pseudos sont vérifiés par un modérateur.
                </p>
              </>
            ) : (
              <div className="pseudo-box">
                <b>{pseudo}</b>
                <button className="icon-btn" onClick={() => setPseudo(randomPseudo())} aria-label="Autre pseudo">
                  <Icon name="refresh" />
                </button>
              </div>
            )}
            {age >= 13 && (
              <button
                className="btn btn-quiet"
                style={{ marginTop: 6 }}
                onClick={() => {
                  setFreePseudo(!freePseudo);
                  setPseudo(freePseudo ? randomPseudo() : '');
                }}
              >
                {freePseudo ? 'Revenir aux pseudos proposés' : 'Écrire mon propre pseudo'}
              </button>
            )}
            <button className="btn btn-primary btn-block" style={{ marginTop: 22 }} disabled={!!pseudoErr} onClick={() => setStep(3)}>
              Continuer
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={{ fontSize: '1.6rem' }}>Ton avatar</h2>
            <p className="muted">Tu gagneras des tenues en wax et des accessoires en jouant.</p>
            <div style={{ display: 'grid', placeItems: 'center', margin: '18px 0 22px' }}>
              <Avatar cfg={avatar} size={140} />
            </div>
            <AvatarPicker label="Peau" options={['skin1', 'skin2', 'skin3', 'skin4']} value={avatar.skin} onPick={(v) => setAvatar({ ...avatar, skin: v })} avatar={avatar} slot="skin" />
            <AvatarPicker label="Coiffure" options={['ras', 'afro']} value={avatar.hair} onPick={(v) => setAvatar({ ...avatar, hair: v })} avatar={avatar} slot="hair" />
            <AvatarPicker label="Fond" options={['bgjaune', 'bgvert', 'bgrouge']} value={avatar.bg} onPick={(v) => setAvatar({ ...avatar, bg: v })} avatar={avatar} slot="bg" />
            <button className="btn btn-primary btn-block" style={{ marginTop: 22 }} onClick={() => setStep(4)}>
              Continuer
            </button>
          </>
        )}

        {step === 4 && universe === 'petits' && (
          <>
            <h2 style={{ fontSize: '1.6rem' }}>Ton image secrète</h2>
            <p className="muted">Pour que personne d'autre ne joue avec ton profil.</p>
            <div className="secret-grid">
              {SECRET_IMAGES.map((s) => (
                <button key={s} className="choice-tile" aria-pressed={secret === s} onClick={() => setSecret(s)} aria-label={`Image ${s}`}>
                  {s}
                </button>
              ))}
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 22 }} disabled={!secret} onClick={() => finish(true)}>
              C'est parti !
            </button>
            <button className="btn btn-quiet btn-block" onClick={() => finish(false)}>
              Plus tard
            </button>
          </>
        )}

        {step === 4 && universe !== 'petits' && (
          <>
            <h2 style={{ fontSize: '1.6rem' }}>Ton code secret</h2>
            <p className="muted">4 chiffres pour protéger ton profil sur un téléphone partagé.</p>
            <PinPad value={pin} onChange={setPin} />
            <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} disabled={pin.length !== 4} onClick={() => finish(true)}>
              C'est parti !
            </button>
            <button className="btn btn-quiet btn-block" onClick={() => finish(false)}>
              Plus tard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function AvatarPicker({ label, options, value, onPick, avatar, slot }: { label: string; options: string[]; value: string; onPick: (v: string) => void; avatar: AvatarConfig; slot: keyof AvatarConfig }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="kicker" style={{ marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {options.map((o) => (
          <button key={o} className="item" style={{ padding: 6 }} aria-pressed={value === o} aria-label={`${label} ${o}`} onClick={() => onPick(o)}>
            <Avatar cfg={{ ...avatar, [slot]: o }} size={52} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function PinPad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const press = (k: string) => {
    if (k === '⌫') onChange(value.slice(0, -1));
    else if (value.length < 4) onChange(value + k);
  };
  return (
    <>
      <div className="pin-dots" aria-label={`${value.length} chiffres saisis`}>
        {[0, 1, 2, 3].map((i) => (
          <i key={i} className={i < value.length ? 'on' : ''} />
        ))}
      </div>
      <div className="keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) =>
          k ? (
            <button key={i} onClick={() => press(k)} aria-label={k === '⌫' ? 'Effacer' : k}>
              {k}
            </button>
          ) : (
            <span key={i} />
          )
        )}
      </div>
    </>
  );
}

// ───────── Déverrouillage d'un profil ─────────

export function Unlock({ profileId }: { profileId: string }) {
  const { go, gate } = useApp();
  const { profiles } = useAppState();
  const p = profiles.find((x) => x.id === profileId);
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);
  if (!p) return null;

  const ok = () => {
    activate(p.id);
    go({ name: 'home' });
  };

  const tryPin = (v: string) => {
    setPin(v);
    setErr(false);
    if (v.length === 4) {
      if (v === p.pin) ok();
      else {
        setErr(true);
        setTimeout(() => setPin(''), 400);
      }
    }
  };

  return (
    <div className="screen full enter">
      <button className="icon-btn" onClick={() => go({ name: 'welcome' })} aria-label="Retour">
        <Icon name="back" />
      </button>
      <div className="profile-head" style={{ marginTop: 10 }}>
        <Avatar cfg={p.avatar} size={96} ring />
        <h1>{p.pseudo}</h1>
        <p className="muted" style={{ margin: 0 }}>
          {p.secretImg ? 'Touche ton image secrète' : 'Entre ton code secret'}
        </p>
      </div>
      {p.secretImg ? (
        <div className="secret-grid" style={{ marginTop: 24 }}>
          {SECRET_IMAGES.map((s) => (
            <button
              key={s}
              className="choice-tile"
              onClick={() => (s === p.secretImg ? ok() : setErr(true))}
              aria-label={`Image ${s}`}
            >
              {s}
            </button>
          ))}
        </div>
      ) : (
        <PinPad value={pin} onChange={tryPin} />
      )}
      {err && (
        <div className="error" style={{ textAlign: 'center' }}>
          Essaie encore.
        </div>
      )}
      <button className="btn btn-quiet btn-block" style={{ marginTop: 16 }} onClick={() => gate('Code oublié ? Un parent peut ouvrir ce profil.', ok)}>
        Code oublié
      </button>
    </div>
  );
}
