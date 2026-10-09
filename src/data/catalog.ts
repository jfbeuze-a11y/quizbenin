import type { DeptId, ThemeId, UniverseId } from './types';

export interface UniverseInfo {
  id: UniverseId;
  name: string;
  ages: string;
  /** Temps de réponse en secondes (null = libre) */
  timer: number | null;
  maxChoices: number;
  mascot: string;
  mascotName: string;
}

export const UNIVERSES: Record<UniverseId, UniverseInfo> = {
  petits: { id: 'petits', name: 'Petits explorateurs', ages: '6–8 ans', timer: null, maxChoices: 3, mascot: '🦎', mascotName: 'Kami le caméléon' },
  aventuriers: { id: 'aventuriers', name: 'Aventuriers', ages: '9–11 ans', timer: 30, maxChoices: 4, mascot: '🧭', mascotName: 'Tobi & Ayo' },
  champions: { id: 'champions', name: 'Champions', ages: '12–15 ans', timer: 20, maxChoices: 4, mascot: '⚡', mascotName: 'Ton avatar' },
};

export const GRADES = [
  { id: 'CI', label: 'CI', universe: 'petits' },
  { id: 'CP', label: 'CP', universe: 'petits' },
  { id: 'CE1', label: 'CE1', universe: 'petits' },
  { id: 'CE2', label: 'CE2', universe: 'aventuriers' },
  { id: 'CM1', label: 'CM1', universe: 'aventuriers' },
  { id: 'CM2', label: 'CM2', universe: 'aventuriers' },
  { id: '6e', label: '6e', universe: 'champions' },
  { id: '5e', label: '5e', universe: 'champions' },
  { id: '4e', label: '4e', universe: 'champions' },
  { id: '3e', label: '3e', universe: 'champions' },
] as const satisfies readonly { id: string; label: string; universe: UniverseId }[];

export type GradeId = (typeof GRADES)[number]['id'];

export const THEMES: Record<ThemeId, { label: string; icon: string; color: string }> = {
  histoire: { label: 'Histoire', icon: '🏛️', color: '#ff8a3d' },
  geographie: { label: 'Géographie', icon: '🗺️', color: '#2ec4b6' },
  patrimoine: { label: 'Patrimoine', icon: '🎭', color: '#ff4d6d' },
  sciences: { label: 'Sciences & nature', icon: '🔬', color: '#3ddc84' },
  francais: { label: 'Français', icon: '✍️', color: '#7b8cff' },
  maths: { label: 'Maths', icon: '➗', color: '#ffc42e' },
  civique: { label: 'Civique', icon: '🏳️', color: '#4cc9f0' },
  sport: { label: 'Sport', icon: '⚽', color: '#c77dff' },
  personnalites: { label: 'Personnalités', icon: '⭐', color: '#f9a8d4' },
};

/** Ordre de la carte Aventure : du littoral vers le nord. */
export const DEPARTMENTS: { id: DeptId; name: string; capital: string; emoji: string; fact: string }[] = [
  { id: 'littoral', name: 'Littoral', capital: 'Cotonou', emoji: '🏙️', fact: 'Le marché Dantokpa et la plus grande ville du pays.' },
  { id: 'atlantique', name: 'Atlantique', capital: 'Allada', emoji: '🌊', fact: 'Ouidah, la Route des esclaves et la cité lacustre de Ganvié.' },
  { id: 'oueme', name: 'Ouémé', capital: 'Porto-Novo', emoji: '🏛️', fact: 'La capitale officielle et le plus long fleuve du pays.' },
  { id: 'plateau', name: 'Plateau', capital: 'Pobè', emoji: '🎭', fact: 'Le royaume de Kétou et les masques Guèlèdè.' },
  { id: 'mono', name: 'Mono', capital: 'Lokossa', emoji: '🛶', fact: 'Le fleuve Mono, frontière avec le Togo.' },
  { id: 'couffo', name: 'Couffo', capital: 'Aplahoué', emoji: '🌴', fact: 'Collines, palmeraies et marchés animés.' },
  { id: 'zou', name: 'Zou', capital: 'Abomey', emoji: '👑', fact: 'Les palais royaux du Danhomè, classés par l\'UNESCO.' },
  { id: 'collines', name: 'Collines', capital: 'Dassa-Zoumè', emoji: '⛰️', fact: 'La ville aux 41 collines.' },
  { id: 'donga', name: 'Donga', capital: 'Djougou', emoji: '🗻', fact: 'Le mont Sokbaro, point culminant du Bénin.' },
  { id: 'borgou', name: 'Borgou', capital: 'Parakou', emoji: '🌾', fact: 'Le pays du coton et la grande ville du nord.' },
  { id: 'atacora', name: 'Atacora', capital: 'Natitingou', emoji: '🦁', fact: 'Les tata somba et le parc de la Pendjari.' },
  { id: 'alibori', name: 'Alibori', capital: 'Kandi', emoji: '🐘', fact: 'Le fleuve Niger et le parc W.' },
];

export const CARDS: Record<string, { name: string; emoji: string; text: string; tone: string }> = {
  lion: { name: 'Lion de la Pendjari', emoji: '🦁', text: "L'un des derniers lions d'Afrique de l'Ouest vit dans le parc de la Pendjari.", tone: '#ffb020' },
  elephant: { name: 'Éléphant du W', emoji: '🐘', text: 'Le complexe W-Arly-Pendjari abrite la plus grande population d\'éléphants d\'Afrique de l\'Ouest.', tone: '#9aa5b1' },
  cameleon: { name: 'Caméléon', emoji: '🦎', text: 'Il change de couleur et bouge ses yeux indépendamment l\'un de l\'autre.', tone: '#3ddc84' },
  ghezo: { name: 'Roi Ghézo', emoji: '🐃', text: 'Roi de 1818 à 1858. Son emblème : le buffle. Son symbole : la jarre percée.', tone: '#ff8a3d' },
  behanzin: { name: 'Roi Béhanzin', emoji: '🦈', text: 'Il résista aux troupes françaises de 1890 à 1894. Son emblème : le requin.', tone: '#4cc9f0' },
  agodjie: { name: 'Les Agodjié', emoji: '🛡️', text: "L'unité militaire féminine d'élite du royaume de Danhomè.", tone: '#ff4d6d' },
  palais: { name: "Palais d'Abomey", emoji: '🏯', text: 'Inscrits au patrimoine mondial de l\'UNESCO en 1985.', tone: '#c77dff' },
  porte: { name: 'Porte du non-retour', emoji: '🚪', text: 'Monument de mémoire sur la plage de Ouidah.', tone: '#7b8cff' },
  ganvie: { name: 'Ganvié', emoji: '🛶', text: 'Une ville entière sur pilotis, au milieu du lac Nokoué.', tone: '#2ec4b6' },
  gelede: { name: 'Masque Guèlèdè', emoji: '🎭', text: 'Patrimoine immatériel de l\'humanité, il honore les mères.', tone: '#f9a8d4' },
  kidjo: { name: 'Angélique Kidjo', emoji: '🎤', text: 'Chanteuse née à Ouidah, plusieurs fois récompensée aux Grammy Awards.', tone: '#ffc42e' },
};

// ───────── Avatar ─────────

export type AvatarSlot = 'skin' | 'hair' | 'outfit' | 'acc' | 'bg';

export interface AvatarItem {
  id: string;
  slot: AvatarSlot;
  name: string;
  price: number;
}

export const AVATAR_ITEMS: AvatarItem[] = [
  { id: 'skin1', slot: 'skin', name: 'Ébène', price: 0 },
  { id: 'skin2', slot: 'skin', name: 'Cacao', price: 0 },
  { id: 'skin3', slot: 'skin', name: 'Caramel', price: 0 },
  { id: 'skin4', slot: 'skin', name: 'Miel', price: 0 },

  { id: 'ras', slot: 'hair', name: 'Coupe rase', price: 0 },
  { id: 'afro', slot: 'hair', name: 'Afro', price: 0 },
  { id: 'tresses', slot: 'hair', name: 'Tresses', price: 60 },
  { id: 'foulard', slot: 'hair', name: 'Foulard wax', price: 90 },
  { id: 'locks', slot: 'hair', name: 'Locks', price: 120 },

  { id: 'tee', slot: 'outfit', name: 'Tee-shirt', price: 0 },
  { id: 'waxsoleil', slot: 'outfit', name: 'Wax Soleil', price: 80 },
  { id: 'waxlagune', slot: 'outfit', name: 'Wax Lagune', price: 80 },
  { id: 'maillot', slot: 'outfit', name: 'Maillot Guépards', price: 140 },
  { id: 'bazin', slot: 'outfit', name: 'Bazin brodé', price: 200 },

  { id: 'none', slot: 'acc', name: 'Rien', price: 0 },
  { id: 'lunettes', slot: 'acc', name: 'Lunettes', price: 50 },
  { id: 'casque', slot: 'acc', name: 'Casque audio', price: 110 },
  { id: 'casquette', slot: 'acc', name: 'Casquette', price: 90 },
  { id: 'couronne', slot: 'acc', name: "Couronne d'Abomey", price: 400 },

  { id: 'bgjaune', slot: 'bg', name: 'Soleil', price: 0 },
  { id: 'bgvert', slot: 'bg', name: 'Forêt', price: 0 },
  { id: 'bgrouge', slot: 'bg', name: 'Piment', price: 0 },
  { id: 'bgnuit', slot: 'bg', name: 'Nuit néon', price: 70 },
  { id: 'bgkente', slot: 'bg', name: 'Motif kente', price: 150 },
];

export interface AvatarConfig {
  skin: string;
  hair: string;
  outfit: string;
  acc: string;
  bg: string;
}

export const DEFAULT_AVATAR: AvatarConfig = { skin: 'skin2', hair: 'afro', outfit: 'tee', acc: 'none', bg: 'bgjaune' };

// ───────── Pseudonymes (aucune saisie libre avant 13 ans) ─────────

const ANIMALS = ['Guépard', 'Caméléon', 'Lion', 'Faucon', 'Hippo', 'Buffle', 'Requin', 'Panthère', 'Pélican', 'Lamantin', 'Calao', 'Éléphant'];
const TRAITS = ['Rapide', 'Malin', 'Brillant', 'Curieux', 'Tranquille', 'Solaire', 'Agile', 'Rusé', 'Vaillant', 'Futé', 'Cool', 'Lumineux'];

export function randomPseudo(): string {
  const a = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const t = TRAITS[Math.floor(Math.random() * TRAITS.length)];
  return `${a} ${t} ${Math.floor(10 + Math.random() * 90)}`;
}

// Liste minimale de démonstration ; la production s'appuie sur une liste modérée côté serveur.
const BANNED = ['con', 'merde', 'pute', 'putain', 'salope', 'bite', 'nique', 'encul', 'fdp', 'pd', 'sexe', 'porn', 'nazi'];

export function pseudoProblem(p: string): string | null {
  const v = p.trim();
  if (v.length < 3) return 'Au moins 3 caractères.';
  if (v.length > 18) return '18 caractères au maximum.';
  if (!/^[\p{L}0-9 _-]+$/u.test(v)) return 'Lettres, chiffres, espaces, - et _ uniquement.';
  const flat = v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
  if (BANNED.some((w) => flat.includes(w))) return 'Ce pseudo n\'est pas autorisé.';
  if (/\d{6,}/.test(v)) return 'Pas de numéro de téléphone dans un pseudo.';
  return null;
}

export const SECRET_IMAGES = ['🦁', '🥭', '⚽', '🌙', '🐟', '🌈'];

// ───────── Badges ─────────

export interface BadgeDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

export const BADGES: BadgeDef[] = [
  { id: 'first', name: 'Premier pas', icon: '👣', desc: 'Termine ta première série.' },
  { id: 'perfect', name: 'Sans faute', icon: '💯', desc: 'Réussis une série complète sans erreur.' },
  { id: 'abomey', name: "Gardien d'Abomey", icon: '🛡️', desc: "50 bonnes réponses sur l'histoire du Danhomè." },
  { id: 'geo', name: 'Géographe', icon: '🧭', desc: '30 bonnes réponses en géographie.' },
  { id: 'flame7', name: 'Flamme de 7 jours', icon: '🔥', desc: 'Joue 7 jours de suite.' },
  { id: 'explorer', name: 'Explorateur', icon: '🗺️', desc: 'Débloque 4 départements de la carte Aventure.' },
  { id: 'collector', name: 'Collectionneur', icon: '🃏', desc: 'Réunis 8 cartes de collection.' },
  { id: 'daily', name: 'Fidèle du défi', icon: '📅', desc: 'Termine 5 défis du jour.' },
];

// ───────── Publicités de démonstration (régie directe) ─────────
// Annonceurs fictifs, catégories autorisées par la section 5.2.

export interface AdCreative {
  id: string;
  advertiser: string;
  headline: string;
  sub: string;
  emoji: string;
  bg: string;
  category: string;
}

export const ADS: AdCreative[] = [
  { id: 'ad1', advertiser: 'Librairie Les Cahiers du Golfe', headline: 'La rentrée, c\'est ici', sub: 'Cahiers, stylos et manuels du CI à la 3e.', emoji: '📚', bg: 'linear-gradient(135deg,#1fbf75,#0e7a4a)', category: 'Fournitures scolaires' },
  { id: 'ad2', advertiser: 'Jus Tropiques', headline: '100 % fruits du Bénin', sub: 'Ananas, mangue, bissap. Sans sucre ajouté.', emoji: '🍍', bg: 'linear-gradient(135deg,#ffc42e,#ff8a3d)', category: 'Boissons non alcoolisées' },
  { id: 'ad3', advertiser: 'Campagne santé publique', headline: 'Dormir sous moustiquaire', sub: 'Chaque nuit, toute l\'année, pour toute la famille.', emoji: '🛏️', bg: 'linear-gradient(135deg,#4cc9f0,#3a6ff7)', category: "Intérêt général" },
  { id: 'ad4', advertiser: 'Opérateur Famille+', headline: 'Le forfait des familles', sub: 'Offre réservée aux parents. Voir conditions.', emoji: '📶', bg: 'linear-gradient(135deg,#ff4d6d,#c9184a)', category: 'Télécom (parents)' },
];
