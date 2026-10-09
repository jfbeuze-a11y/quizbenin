import { useMemo, useState } from 'react';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { AVATAR_ITEMS, DEPARTMENTS, type AvatarConfig } from '../data/catalog';
import type { DeptId } from '../data/types';
import { rng } from '../engine/adaptive';
import { universeOf, useActiveProfile, weekKey } from '../store/state';
import { TopBar } from './TopBar';

interface Row {
  id: string;
  pseudo: string;
  dept: DeptId;
  pts: number;
  avatar: AvatarConfig;
  me?: boolean;
}

const A = ['Guépard', 'Faucon', 'Calao', 'Lamantin', 'Buffle', 'Panthère', 'Requin', 'Pélican', 'Lion', 'Hippo'];
const T = ['Éclair', 'Malin', 'Solaire', 'Agile', 'Futé', 'Brillant', 'Vaillant', 'Cool', 'Rusé', 'Zen'];

const pickFrom = <T,>(r: () => number, arr: T[]) => arr[Math.floor(r() * arr.length)];

/** Joueurs fictifs, stables sur la semaine, en attendant le classement serveur (F-15). */
function bots(universe: string): Row[] {
  const r = rng(`${weekKey()}|${universe}`);
  const by = (slot: string) => AVATAR_ITEMS.filter((i) => i.slot === slot).map((i) => i.id);
  return Array.from({ length: 18 }, (_, i) => ({
    id: `bot${i}`,
    pseudo: `${pickFrom(r, A)} ${pickFrom(r, T)} ${10 + Math.floor(r() * 90)}`,
    dept: pickFrom(r, DEPARTMENTS).id,
    pts: Math.round(40 + r() * 900),
    avatar: { skin: pickFrom(r, by('skin')), hair: pickFrom(r, by('hair')), outfit: pickFrom(r, by('outfit')), acc: pickFrom(r, by('acc')), bg: pickFrom(r, by('bg')) },
  }));
}

export function Ranking() {
  const p = useActiveProfile()!;
  const u = universeOf(p);
  const [scope, setScope] = useState<'all' | 'dept'>('all');

  const rows = useMemo(() => {
    const monday = new Date(`${weekKey()}T00:00`).getTime();
    const mine = Object.values(p.seen).filter((e) => e.ok && e.t >= monday).length * 10;
    const list: Row[] = [...bots(u), { id: p.id, pseudo: p.pseudo, dept: p.dept, pts: mine, avatar: p.avatar, me: true }];
    return list.filter((r) => scope === 'all' || r.dept === p.dept).sort((a, b) => b.pts - a.pts);
  }, [p, u, scope]);

  const top = rows.slice(0, 3);
  const deptName = (id: DeptId) => DEPARTMENTS.find((d) => d.id === id)?.name;

  return (
    <>
      <TopBar />
      <main className="screen enter">
        <div style={{ margin: '8px 2px 0' }}>
          <div className="kicker">Tournoi de la semaine</div>
          <h1 style={{ fontSize: '1.5rem', marginTop: 6 }}>Classement</h1>
          <p className="muted" style={{ margin: '6px 0 0', fontSize: '.9rem' }}>
            Remise à zéro chaque lundi. Seuls le pseudo, l'avatar et le département sont affichés.
          </p>
        </div>

        <div className="segmented">
          <button aria-pressed={scope === 'all'} onClick={() => setScope('all')}>
            Tout le Bénin
          </button>
          <button aria-pressed={scope === 'dept'} onClick={() => setScope('dept')}>
            {deptName(p.dept)}
          </button>
        </div>

        {top.length === 3 && (
          <div className="podium">
            {[top[1], top[0], top[2]].map((r, i) => (
              <div key={r.id} className={`spot p${[2, 1, 3][i]}`}>
                <Avatar cfg={r.avatar} size={i === 1 ? 64 : 52} ring={r.me} />
                <span>{r.pseudo}</span>
                <div className="block">{[2, 1, 3][i]}</div>
              </div>
            ))}
          </div>
        )}

        <div className="rank-list">
          {rows.map((r, i) => (
            <div key={r.id} className={`rank ${r.me ? 'me' : ''}`}>
              <span className="pos">{i + 1}</span>
              <Avatar cfg={r.avatar} size={38} />
              <span className="name">
                <strong>{r.me ? `${r.pseudo} (toi)` : r.pseudo}</strong>
                <small>{deptName(r.dept)}</small>
              </span>
              <span className="pts">{r.pts}</span>
            </div>
          ))}
        </div>

        <div className="notice">
          <Icon name="info" />
          <span>Prototype : les autres joueurs sont fictifs. Le classement réel sera calculé et vérifié par le serveur (anti-triche).</span>
        </div>
      </main>
    </>
  );
}
