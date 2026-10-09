import { useEffect, useRef, useState } from 'react';
import { useApp } from '../app/context';
import { Icon } from '../components/Icon';
import { Overlay } from '../components/ui';
import { DEPARTMENTS } from '../data/catalog';
import { isWorldOpen } from '../engine/rewards';
import type { DeptId } from '../data/types';
import { useActiveProfile } from '../store/state';
import { TopBar } from './TopBar';

// Le nord en haut, le littoral en bas : on remonte le pays en jouant.
const ORDER = [...DEPARTMENTS].reverse();
const XS = [50, 74, 62, 30, 22, 46, 74, 66, 34, 24, 48, 70];
const ROW = 112;

export function Adventure() {
  const { go, toast } = useApp();
  const p = useActiveProfile()!;
  const [open, setOpen] = useState<DeptId | null>(null);
  const current = DEPARTMENTS.find((d) => isWorldOpen(p, d.id) && !(p.worlds[d.id] ?? 0))?.id;
  const curRef = useRef<HTMLDivElement>(null);
  const done = DEPARTMENTS.filter((d) => (p.worlds[d.id] ?? 0) > 0).length;

  useEffect(() => {
    curRef.current?.scrollIntoView({ block: 'center' });
  }, []);

  const pts = ORDER.map((_, i) => [XS[i], i * ROW + ROW / 2] as const);
  const d = pts.map(([x, y], i) => {
    if (i === 0) return `M${x} ${y}`;
    const [px, py] = pts[i - 1];
    const my = (py + y) / 2;
    return `C${px} ${my} ${x} ${my} ${x} ${y}`;
  });
  const sel = open ? DEPARTMENTS.find((x) => x.id === open)! : null;

  return (
    <>
      <TopBar />
      <main className="screen enter">
        <div style={{ margin: '8px 2px 6px' }}>
          <div className="kicker">Carte Aventure</div>
          <h1 style={{ fontSize: '1.5rem', marginTop: 6 }}>
            Traverse le Bénin <span className="muted" style={{ fontSize: '1rem' }}>{done}/12</span>
          </h1>
          <p className="muted" style={{ margin: '6px 0 0', fontSize: '.92rem' }}>
            Chaque département est un monde. 7 bonnes réponses sur 10 ouvrent le suivant.
          </p>
        </div>

        <div className="map" style={{ height: ORDER.length * ROW + 40 }}>
          <svg className="path" viewBox={`0 0 100 ${ORDER.length * ROW}`} preserveAspectRatio="none" aria-hidden="true">
            <path d={d.join(' ')} stroke="var(--line-strong)" strokeWidth="2.4" strokeDasharray="2 5" fill="none" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
          </svg>
          {ORDER.map((dep, i) => {
            const isOpen = isWorldOpen(p, dep.id);
            const stars = p.worlds[dep.id] ?? 0;
            const cls = dep.id === current ? 'current open' : isOpen ? 'open' : 'locked';
            return (
              <div key={dep.id} className="node-row" ref={dep.id === current ? curRef : undefined}>
                <button
                  className={`node ${cls}`}
                  style={{ left: `${XS[i]}%` }}
                  onClick={() => {
                    if (isOpen) setOpen(dep.id);
                    else toast(`Termine ${DEPARTMENTS[DEPARTMENTS.findIndex((x) => x.id === dep.id) - 1].name} pour débloquer ${dep.name}`);
                  }}
                  aria-label={`${dep.name}${isOpen ? `, ${stars} étoiles` : ', verrouillé'}`}
                >
                  <span className="disc">
                    {dep.emoji}
                    {!isOpen && (
                      <span className="lock">
                        <Icon name="lock" />
                      </span>
                    )}
                  </span>
                  <b>{dep.name}</b>
                  {isOpen && (
                    <span className="mini-stars">
                      {[1, 2, 3].map((s) => (
                        <Icon key={s} name="star" className={s <= stars ? 'on' : ''} />
                      ))}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {sel && (
        <Overlay label={sel.name} onBackdrop={() => setOpen(null)}>
          <div className="modal" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.4rem' }}>{sel.emoji}</div>
            <div className="kicker" style={{ marginTop: 6 }}>
              Chef-lieu : {sel.capital}
            </div>
            <h3 style={{ fontSize: '1.5rem', margin: '6px 0 8px' }}>{sel.name}</h3>
            <p>{sel.fact}</p>
            <button className="btn btn-primary btn-block" onClick={() => go({ name: 'quiz', mode: 'adventure', title: `Aventure · ${sel.name}`, dept: sel.id })}>
              <Icon name="play" /> Jouer 10 questions
            </button>
            <button className="btn btn-quiet btn-block" onClick={() => setOpen(null)}>
              Plus tard
            </button>
          </div>
        </Overlay>
      )}
    </>
  );
}
