import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AdCreative } from '../data/catalog';
import { AD_RULES } from '../engine/ads';
import { Icon } from './Icon';

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button className="switch" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} />;
}

export function Toast({ text }: { text: string }) {
  return (
    <div className="toast" role="status">
      {text}
    </div>
  );
}

export function Overlay({ children, onBackdrop, label }: { children: ReactNode; onBackdrop?: () => void; label: string }) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.target === e.currentTarget && onBackdrop?.()}>
      {children}
    </div>
  );
}

/** Confettis aux couleurs du drapeau, dessinés sur un canvas. */
export function Confetti({ fire }: { fire: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!fire || !ref.current) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.querySelector('[data-eco="true"]')) return;
    const c = ref.current;
    const ctx = c.getContext('2d')!;
    const dpr = Math.min(devicePixelRatio, 2);
    c.width = c.offsetWidth * dpr;
    c.height = c.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const colors = ['#2ee88f', '#ffc42e', '#ff4d5e', '#4cc9f0', '#ffffff'];
    const W = c.offsetWidth;
    const H = c.offsetHeight;
    const parts = Array.from({ length: 90 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 60,
      y: H * 0.42,
      vx: (Math.random() - 0.5) * 11,
      vy: -Math.random() * 12 - 4,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 4,
      col: colors[Math.floor(Math.random() * colors.length)],
    }));
    let raf = 0;
    const t0 = performance.now();
    const loop = (t: number) => {
      const k = (t - t0) / 1400;
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.vy += 0.35;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - k);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.col;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (k < 1) raf = requestAnimationFrame(loop);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [fire]);
  return <canvas ref={ref} className="confetti" style={{ width: '100%', height: '100%' }} aria-hidden="true" />;
}

/** Porte parentale : une multiplication à saisir, hors de portée des plus jeunes (section 5.2). */
export function ParentalGate({ onPass, onCancel, reason }: { onPass: () => void; onCancel: () => void; reason: string }) {
  const [a, b] = useMemo(() => [6 + Math.floor(Math.random() * 4), 6 + Math.floor(Math.random() * 4)], []);
  const [v, setV] = useState('');
  const [err, setErr] = useState(false);
  const submit = () => {
    if (Number(v) === a * b) onPass();
    else {
      setErr(true);
      setV('');
    }
  };
  return (
    <Overlay label="Porte parentale" onBackdrop={onCancel}>
      <form
        className="modal"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="kicker" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Icon name="shield" className="" /> Espace adulte
        </div>
        <h3 style={{ marginTop: 10 }}>Demande à un adulte</h3>
        <p>{reason}</p>
        <label htmlFor="gate" style={{ fontWeight: 800, display: 'block', marginBottom: 8 }}>
          Combien font {a} × {b} ?
        </label>
        <input id="gate" className="field center" inputMode="numeric" autoComplete="off" autoFocus value={v} onChange={(e) => setV(e.target.value.replace(/\D/g, ''))} />
        {err && <div className="error">Ce n'est pas la bonne réponse.</div>}
        <div className="row-gap">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={!v}>
            Valider
          </button>
        </div>
      </form>
    </Overlay>
  );
}

export function AdBanner({ ad, onClick }: { ad: AdCreative; onClick: () => void }) {
  return (
    <button className="ad-banner" style={{ background: ad.bg }} onClick={onClick} aria-label={`Publicité : ${ad.advertiser}, ${ad.headline}`}>
      <span className="ad-label">Publicité</span>
      <span className="em" aria-hidden="true">
        {ad.emoji}
      </span>
      <span>
        <strong>{ad.headline}</strong>
        <small>{ad.advertiser}</small>
      </span>
    </button>
  );
}

export type AdKind = 'flyer' | 'video' | 'rewarded' | 'launch';

/** Flyer plein écran, vidéo interstitielle, vidéo récompensée ou spot d'ouverture (simulées). */
export function AdOverlay({ kind, ad, onClose, onClick }: { kind: AdKind; ad: AdCreative; onClose: (completed: boolean, seconds: number) => void; onClick: () => void }) {
  const length = kind === 'flyer' ? 0 : kind === 'video' ? AD_RULES.interstitialMaxS : kind === 'launch' ? AD_RULES.launchSpotS : 20;
  // Le spot d'ouverture se regarde en entier (7 s, sous la limite de 15 s des règles Google Play Familles).
  const unlockAt = kind === 'rewarded' || kind === 'launch' ? length : kind === 'video' ? AD_RULES.videoSkipAfterS : AD_RULES.flyerCloseAfterS;
  const [t, setT] = useState(0);
  const t0 = useRef(performance.now());
  const closed = useRef(false);
  const close = (completed: boolean, seconds: number) => {
    if (closed.current) return;
    closed.current = true;
    onClose(completed, seconds);
  };

  useEffect(() => {
    const id = setInterval(() => setT((performance.now() - t0.current) / 1000), 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (kind !== 'flyer' && t >= length) close(true, length);
  });

  const canClose = t >= unlockAt || kind === 'rewarded';
  const remaining = Math.max(0, Math.ceil(unlockAt - t));

  return (
    <Overlay label="Publicité">
      <div className="flyer" style={{ background: ad.bg }}>
        <span className="ad-label">Publicité</span>
        <button
          className="close"
          disabled={!canClose}
          onClick={() => close(kind === 'flyer' || (kind === 'video' && t >= unlockAt), Math.round(t))}
          aria-label={canClose ? (kind === 'rewarded' ? 'Arrêter sans récompense' : 'Fermer la publicité') : `Fermeture possible dans ${remaining} secondes`}
        >
          {canClose ? kind === 'rewarded' && t < length ? <span style={{ fontSize: '.78rem' }}>Arrêter</span> : <Icon name="close" /> : remaining}
        </button>
        <span className="em" aria-hidden="true">
          {ad.emoji}
        </span>
        <div className="adv">{ad.advertiser}</div>
        <h3>{ad.headline}</h3>
        <p>{ad.sub}</p>
        <button className="btn cta" onClick={onClick}>
          En savoir plus
        </button>
        {kind !== 'flyer' && (
          <div className="video-progress" aria-hidden="true">
            <i style={{ width: `${Math.min(100, (t / length) * 100)}%` }} />
          </div>
        )}
      </div>
    </Overlay>
  );
}
