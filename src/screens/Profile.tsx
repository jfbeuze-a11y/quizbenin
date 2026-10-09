import { useState, type CSSProperties } from 'react';
import { useApp } from '../app/context';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { AVATAR_ITEMS, BADGES, CARDS, DEPARTMENTS, GRADES, UNIVERSES, type AvatarSlot } from '../data/catalog';
import { levelOf, universeOf, updateProfile, useActiveProfile } from '../store/state';
import { TopBar } from './TopBar';

const SLOTS: { id: AvatarSlot; label: string }[] = [
  { id: 'outfit', label: 'Tenue' },
  { id: 'hair', label: 'Coiffure' },
  { id: 'acc', label: 'Accessoire' },
  { id: 'bg', label: 'Fond' },
  { id: 'skin', label: 'Peau' },
];

export function ProfileScreen() {
  const { toast, celebrate } = useApp();
  const p = useActiveProfile()!;
  const [tab, setTab] = useState<'avatar' | 'badges' | 'cards'>('avatar');
  const [slot, setSlot] = useState<AvatarSlot>('outfit');
  const u = universeOf(p);
  const lv = levelOf(p.xp);
  const dept = DEPARTMENTS.find((d) => d.id === p.dept);
  const grade = GRADES.find((g) => g.id === p.grade);

  const pick = (id: string, price: number) => {
    const owned = price === 0 || p.owned.includes(id);
    if (!owned && p.coins < price) {
      toast(`Il te manque ${price - p.coins} pièces`);
      return;
    }
    updateProfile(p.id, (x) => {
      if (!owned) {
        x.coins -= price;
        x.owned.push(id);
      }
      x.avatar[slot] = id;
    });
    if (!owned) {
      celebrate();
      toast('Nouvel objet débloqué !');
    }
  };

  return (
    <>
      <TopBar />
      <main className="screen enter">
        <section className="profile-head">
          <Avatar cfg={p.avatar} size={128} ring />
          <h1>{p.pseudo}</h1>
          <span className="muted" style={{ fontWeight: 700, fontSize: '.88rem' }}>
            {UNIVERSES[u].name} · {grade?.label} · {dept?.name}
          </span>
        </section>

        <div className="stat-row">
          <div className="gain">
            <b>{lv.level}</b>
            <small>niveau</small>
          </div>
          <div className="gain">
            <b>{p.stats.correct}</b>
            <small>bonnes rép.</small>
          </div>
          <div className="gain">
            <b>{p.streak.count}</b>
            <small>jours 🔥</small>
          </div>
        </div>

        <div className="segmented" role="tablist">
          {(
            [
              ['avatar', 'Avatar'],
              ['badges', `Badges ${p.badges.length}/${BADGES.length}`],
              ['cards', `Cartes ${p.cards.length}/${Object.keys(CARDS).length}`],
            ] as const
          ).map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} aria-pressed={tab === id} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'avatar' && (
          <>
            <div className="segmented" style={{ marginTop: 0 }}>
              {SLOTS.map((s) => (
                <button key={s.id} aria-pressed={slot === s.id} onClick={() => setSlot(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
            <div className="shop">
              {AVATAR_ITEMS.filter((i) => i.slot === slot).map((i) => {
                const owned = i.price === 0 || p.owned.includes(i.id);
                const worn = p.avatar[slot] === i.id;
                return (
                  <button key={i.id} className={`item ${!owned && p.coins < i.price ? 'locked' : ''}`} aria-pressed={worn} onClick={() => pick(i.id, i.price)}>
                    <Avatar cfg={{ ...p.avatar, [slot]: i.id }} size={72} />
                    <span>{i.name}</span>
                    {worn ? (
                      <span className="muted" style={{ fontSize: '.72rem' }}>
                        Porté
                      </span>
                    ) : owned ? (
                      <span className="muted" style={{ fontSize: '.72rem' }}>
                        À toi
                      </span>
                    ) : (
                      <span className="price">
                        <Icon name="coin" /> {i.price}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="muted" style={{ fontSize: '.8rem', textAlign: 'center', marginTop: 14 }}>
              Les pièces se gagnent uniquement en jouant. Rien ne s'achète avec de l'argent réel.
            </p>
          </>
        )}

        {tab === 'badges' && (
          <div className="badges">
            {BADGES.map((b) => {
              const on = p.badges.includes(b.id);
              return (
                <div key={b.id} className={`badge-tile ${on ? '' : 'off'}`}>
                  <span className="medal">{b.icon}</span>
                  <div>
                    <strong>{b.name}</strong>
                    <small>{b.desc}</small>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'cards' && (
          <div className="cards">
            {Object.entries(CARDS).map(([id, c]) => {
              const on = p.cards.includes(id);
              return (
                <div key={id} className={`collect ${on ? '' : 'off'}`} style={{ '--tone': c.tone } as CSSProperties}>
                  <span className="em">{c.emoji}</span>
                  <strong>{on ? c.name : '???'}</strong>
                  <small>{on ? c.text : 'Réponds juste à la bonne question pour la débloquer.'}</small>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
