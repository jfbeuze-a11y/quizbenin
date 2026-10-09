import { ADS, type AdCreative } from '../data/catalog';
import { today, universeOf, type Profile } from '../store/state';

// Règles de diffusion (cahier des charges, section 5.1). Valeurs par défaut non
// augmentables sans décision écrite de la maîtrise d'ouvrage.
export const AD_RULES = {
  flyerEverySeries: 2,
  flyersPerDay: 6,
  interstitialsPerDay: 3,
  rewardedPerDay: 5,
  flyerCloseAfterS: 5,
  videoSkipAfterS: 5,
  interstitialMaxS: 15,
  rewardedMaxS: 30,
  maxAdShare: 10 / 60,
  petitsFreeGames: 3,
  /** Spot vidéo à l'ouverture, une fois par lancement, après l'écran de démarrage */
  launchSpotS: 7,
};

/** Compteurs du jour, sans modifier le profil (remis à zéro par rollDay lors des écritures). */
function counters(p: Profile): Profile['ads'] {
  return p.ads.day === today() ? p.ads : { day: today(), flyers: 0, interstitials: 0, rewarded: 0, seriesSinceFlyer: p.ads.seriesSinceFlyer, gamesToday: 0, adSeconds: 0 };
}

function underShareCap(p: Profile, extraS: number) {
  const ads = counters(p);
  const played = p.stats.secondsByDay[today()] ?? 0;
  // On tolère la première publicité, puis on reste sous 10 min d'exposition par heure de jeu.
  return ads.adSeconds === 0 || (ads.adSeconds + extraS) / Math.max(played, 60) <= AD_RULES.maxAdShare;
}

function petitsProtected(p: Profile) {
  return universeOf(p) === 'petits' && counters(p).gamesToday <= AD_RULES.petitsFreeGames;
}

export function shouldShowFlyer(p: Profile): boolean {
  const ads = counters(p);
  return (
    !petitsProtected(p) &&
    ads.seriesSinceFlyer >= AD_RULES.flyerEverySeries &&
    ads.flyers < AD_RULES.flyersPerDay &&
    underShareCap(p, AD_RULES.flyerCloseAfterS)
  );
}

export function shouldShowInterstitial(p: Profile): boolean {
  return !petitsProtected(p) && counters(p).interstitials < AD_RULES.interstitialsPerDay && underShareCap(p, AD_RULES.interstitialMaxS);
}

export function canWatchRewarded(p: Profile): boolean {
  return counters(p).rewarded < AD_RULES.rewardedPerDay;
}

let cursor = Math.floor(Math.random() * ADS.length);
export function nextCreative(): AdCreative {
  cursor = (cursor + 1) % ADS.length;
  return ADS[cursor];
}
