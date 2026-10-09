import type { AvatarConfig } from '../data/catalog';

const SKIN: Record<string, { base: string; shade: string }> = {
  skin1: { base: '#5a3622', shade: '#45281a' },
  skin2: { base: '#7a4a2c', shade: '#613a22' },
  skin3: { base: '#a8693e', shade: '#8c5532' },
  skin4: { base: '#c98d5a', shade: '#ad7546' },
};

const BG: Record<string, string> = {
  bgjaune: '#ffc42e',
  bgvert: '#2ee88f',
  bgrouge: '#ff4d5e',
  bgnuit: '#1b1f3b',
  bgkente: '#ffb020',
};

/** Avatar vectoriel léger : aucune photo, aucun visage réel (section 8.2). */
export function Avatar({ cfg, size = 64, ring }: { cfg: AvatarConfig; size?: number; ring?: boolean }) {
  const skin = SKIN[cfg.skin] ?? SKIN.skin2;
  const id = `a${cfg.outfit}${cfg.bg}${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ borderRadius: size * 0.34, flex: 'none', boxShadow: ring ? '0 0 0 3px var(--bg), 0 0 0 5px var(--accent)' : undefined }}
    >
      <defs>
        <pattern id={`${id}s`} width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="#ff8a1f" />
          <circle cx="7" cy="7" r="5" fill="#ffc42e" />
          <circle cx="7" cy="7" r="2.2" fill="#c9184a" />
        </pattern>
        <pattern id={`${id}l`} width="16" height="10" patternUnits="userSpaceOnUse">
          <rect width="16" height="10" fill="#1d4ed8" />
          <path d="M0 5 Q4 0 8 5 T16 5" stroke="#4cc9f0" strokeWidth="2.4" fill="none" />
        </pattern>
        <pattern id={`${id}k`} width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="#ffb020" />
          <rect width="10" height="10" fill="#14120c" />
          <rect x="10" y="10" width="10" height="10" fill="#1fbf75" />
          <rect x="3" y="3" width="4" height="4" fill="#ff4d5e" />
        </pattern>
        <clipPath id={`${id}c`}>
          <rect width="100" height="100" rx="34" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect width="100" height="100" fill={cfg.bg === 'bgkente' ? `url(#${id}k)` : BG[cfg.bg] ?? BG.bgjaune} />
        {cfg.bg === 'bgnuit' && (
          <>
            <circle cx="20" cy="22" r="1.6" fill="#fff" opacity=".7" />
            <circle cx="80" cy="16" r="1.2" fill="#fff" opacity=".6" />
            <circle cx="86" cy="40" r="1.8" fill="#4cc9f0" opacity=".8" />
          </>
        )}

        {/* Cheveux arrière */}
        {cfg.hair === 'afro' && <circle cx="50" cy="42" r="27" fill="#1a110b" />}
        {cfg.hair === 'locks' && (
          <g fill="#1a110b">
            <rect x="24" y="30" width="7" height="40" rx="3.5" />
            <rect x="69" y="30" width="7" height="40" rx="3.5" />
            <rect x="31" y="32" width="6" height="34" rx="3" />
            <rect x="63" y="32" width="6" height="34" rx="3" />
          </g>
        )}
        {cfg.hair === 'tresses' && (
          <g fill="#1a110b">
            <rect x="27" y="34" width="6" height="36" rx="3" />
            <rect x="67" y="34" width="6" height="36" rx="3" />
          </g>
        )}

        {/* Corps / tenue */}
        <path
          d="M18 100c0-18 14-30 32-30s32 12 32 30z"
          fill={
            cfg.outfit === 'waxsoleil'
              ? `url(#${id}s)`
              : cfg.outfit === 'waxlagune'
                ? `url(#${id}l)`
                : cfg.outfit === 'maillot'
                  ? '#1fbf75'
                  : cfg.outfit === 'bazin'
                    ? '#f4f1ea'
                    : '#14120c'
          }
        />
        {cfg.outfit === 'maillot' && (
          <>
            <rect x="18" y="86" width="64" height="5" fill="#ffc42e" />
            <rect x="18" y="91" width="64" height="5" fill="#ff4d5e" />
          </>
        )}
        {cfg.outfit === 'bazin' && <path d="M42 72 50 84 58 72" stroke="#c9a227" strokeWidth="3" fill="none" />}
        {cfg.outfit === 'tee' && <path d="M40 72q10 8 20 0" stroke="#ffc42e" strokeWidth="3" fill="none" />}

        {/* Cou + tête */}
        <rect x="43" y="58" width="14" height="14" rx="5" fill={skin.shade} />
        <ellipse cx="50" cy="45" rx="19" ry="21" fill={skin.base} />
        <ellipse cx="31.5" cy="47" rx="3.5" ry="5" fill={skin.shade} />
        <ellipse cx="68.5" cy="47" rx="3.5" ry="5" fill={skin.shade} />

        {/* Visage */}
        <ellipse cx="43" cy="46" rx="2.4" ry="3" fill="#120b07" />
        <ellipse cx="57" cy="46" rx="2.4" ry="3" fill="#120b07" />
        <circle cx="43.8" cy="45" r=".8" fill="#fff" />
        <circle cx="57.8" cy="45" r=".8" fill="#fff" />
        <path d="M44 55q6 5 12 0" stroke="#120b07" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <circle cx="38" cy="53" r="3" fill="#ff4d5e" opacity=".18" />
        <circle cx="62" cy="53" r="3" fill="#ff4d5e" opacity=".18" />

        {/* Cheveux avant */}
        {cfg.hair === 'ras' && <path d="M31 40c1-12 9-18 19-18s18 6 19 18c-5-6-12-8-19-8s-14 2-19 8z" fill="#1a110b" />}
        {cfg.hair === 'afro' && <path d="M30 42c0-14 9-22 20-22s20 8 20 22c-4-7-11-10-20-10s-16 3-20 10z" fill="#1a110b" />}
        {(cfg.hair === 'tresses' || cfg.hair === 'locks') && (
          <path d="M30 44c0-14 9-22 20-22s20 8 20 22c-3-6-6-8-8-9l-2 4-3-5-4 5-3-5-4 5-3-5-2 4c-3 1-7 4-11 9z" fill="#1a110b" />
        )}
        {cfg.hair === 'foulard' && (
          <g>
            <path d="M27 42c0-16 10-24 23-24s23 8 23 24c-6-6-14-9-23-9s-17 3-23 9z" fill={`url(#${id}s)`} />
            <circle cx="66" cy="22" r="8" fill={`url(#${id}s)`} />
            <circle cx="56" cy="17" r="7" fill={`url(#${id}s)`} />
          </g>
        )}

        {/* Accessoires */}
        {cfg.acc === 'lunettes' && (
          <g stroke="#14120c" strokeWidth="2.6" fill="rgba(76,201,240,.35)">
            <rect x="35" y="41" width="13" height="10" rx="4" />
            <rect x="52" y="41" width="13" height="10" rx="4" />
            <path d="M48 45h4" fill="none" />
          </g>
        )}
        {cfg.acc === 'casque' && (
          <g>
            <path d="M28 46c0-16 10-25 22-25s22 9 22 25" stroke="#ff4d5e" strokeWidth="5" fill="none" />
            <rect x="23" y="40" width="10" height="16" rx="4" fill="#ff4d5e" />
            <rect x="67" y="40" width="10" height="16" rx="4" fill="#ff4d5e" />
          </g>
        )}
        {cfg.acc === 'casquette' && (
          <g>
            <path d="M30 36c0-10 9-16 20-16s20 6 20 16z" fill="#1fbf75" />
            <path d="M50 36h28c0 3-4 5-10 5H50z" fill="#16975c" />
            <circle cx="50" cy="20" r="2" fill="#ffc42e" />
          </g>
        )}
        {cfg.acc === 'couronne' && (
          <g>
            <path d="M33 26l5-12 7 9 5-12 5 12 7-9 5 12z" fill="#ffc42e" stroke="#c98b00" strokeWidth="1.5" />
            <circle cx="50" cy="20" r="2.2" fill="#ff4d5e" />
          </g>
        )}
      </g>
    </svg>
  );
}
