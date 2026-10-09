import { useState } from 'react';
import { useApp } from '../app/context';
import { Icon } from '../components/Icon';
import { UNIVERSES } from '../data/catalog';
import type { UniverseId } from '../data/types';
import { universeOf, useActiveProfile } from '../store/state';

const PREFIX: Record<UniverseId, string> = { petits: 'P', aventuriers: 'A', champions: 'C' };

/** Code de duel : univers + graine. Les deux joueurs reçoivent la même série (F-14, asynchrone). */
export function duelCode(seed: string, u: UniverseId) {
  return `${PREFIX[u]}-${seed}`;
}

function parse(code: string): { u: UniverseId; seed: string } | null {
  const m = code.trim().toUpperCase().match(/^([PAC])-?([A-Z0-9]{5})$/);
  if (!m) return null;
  const u = (Object.keys(PREFIX) as UniverseId[]).find((k) => PREFIX[k] === m[1])!;
  return { u, seed: m[2] };
}

export function Duel() {
  const { go } = useApp();
  const p = useActiveProfile()!;
  const u = universeOf(p);
  const [code, setCode] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const create = () => {
    const seed = Array.from({ length: 5 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
    go({ name: 'quiz', mode: 'duel', title: 'Duel', seed, n: 10 });
  };

  const join = () => {
    const d = parse(code);
    if (!d) return setErr('Code invalide. Exemple : C-7KQ2M');
    if (d.u !== u) return setErr(`Ce duel est réservé à l'univers ${UNIVERSES[d.u].name}.`);
    go({ name: 'quiz', mode: 'duel', title: 'Duel', seed: d.seed, n: 10 });
  };

  return (
    <main className="screen full enter">
      <button className="icon-btn" onClick={() => go({ name: 'home' })} aria-label="Retour">
        <Icon name="back" />
      </button>
      <h1 style={{ fontSize: '1.8rem', marginTop: 18 }}>Duel</h1>
      <p className="muted">Toi et ton ami jouez la même série de 10 questions, chacun à votre rythme. Le meilleur score gagne.</p>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="kicker">Lancer un défi</div>
        <p className="muted" style={{ margin: '6px 0 14px' }}>
          Joue d'abord : tu recevras un code à partager.
        </p>
        <button className="btn btn-primary btn-block" onClick={create}>
          <Icon name="swords" /> Créer un duel
        </button>
      </div>

      <form
        className="card"
        style={{ marginTop: 12 }}
        onSubmit={(e) => {
          e.preventDefault();
          join();
        }}
      >
        <div className="kicker">Relever un défi</div>
        <p className="muted" style={{ margin: '6px 0 14px' }}>
          Entre le code que ton ami t'a donné.
        </p>
        <input
          className="field center"
          placeholder="C-XXXXX"
          value={code}
          maxLength={7}
          autoCapitalize="characters"
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setErr(null);
          }}
          aria-label="Code du duel"
        />
        {err && <div className="error">{err}</div>}
        <button className="btn btn-ghost btn-block" style={{ marginTop: 12 }} disabled={code.length < 6}>
          Jouer ce duel
        </button>
      </form>

      <div className="notice">
        <Icon name="shield" />
        <span>Aucun message entre joueurs : seuls le code et les scores sont partagés.</span>
      </div>
    </main>
  );
}
