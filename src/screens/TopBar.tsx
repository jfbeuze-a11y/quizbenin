import { useApp } from '../app/context';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { levelOf, useActiveProfile } from '../store/state';

export function TopBar() {
  const { go } = useApp();
  const p = useActiveProfile();
  if (!p) return null;
  const lv = levelOf(p.xp);
  return (
    <header className="topbar">
      <button className="who" onClick={() => go({ name: 'profile' })} aria-label="Mon profil">
        <Avatar cfg={p.avatar} size={44} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <strong>{p.pseudo}</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <small>Niv. {lv.level}</small>
            <div className="xpbar" style={{ flex: 1, maxWidth: 90 }} aria-label={`${lv.into} sur ${lv.need} XP`}>
              <i style={{ width: `${(lv.into / lv.need) * 100}%` }} />
            </div>
          </div>
        </div>
      </button>
      <span className="pill flame" title="Jours consécutifs">
        <Icon name="flame" />
        {p.streak.count}
      </span>
      <span className="pill coin" title="Pièces">
        <Icon name="coin" />
        {p.coins}
      </span>
      <button className="icon-btn" onClick={() => go({ name: 'settings' })} aria-label="Paramètres">
        <Icon name="settings" />
      </button>
    </header>
  );
}
