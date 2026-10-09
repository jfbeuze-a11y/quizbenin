export type UniverseId = 'petits' | 'aventuriers' | 'champions';

export type ThemeId =
  | 'histoire'
  | 'geographie'
  | 'patrimoine'
  | 'sciences'
  | 'francais'
  | 'maths'
  | 'civique'
  | 'sport'
  | 'personnalites';

export type Scope = 'national' | 'regional' | 'universel';

export type DeptId =
  | 'littoral'
  | 'atlantique'
  | 'oueme'
  | 'plateau'
  | 'mono'
  | 'couffo'
  | 'zou'
  | 'collines'
  | 'donga'
  | 'borgou'
  | 'atacora'
  | 'alibori';

export interface Question {
  id: string;
  /** Univers concernés */
  u: UniverseId[];
  theme: ThemeId;
  /** Difficulté de 1 à 5 */
  diff: 1 | 2 | 3 | 4 | 5;
  scope: Scope;
  /** Pays visé quand scope = national */
  country?: 'BJ';
  text: string;
  /** Illustration (émoji en attendant les visuels définitifs) */
  img?: string;
  choices: string[];
  answer: number;
  explain: string;
  anecdote?: string;
  dept?: DeptId;
  exam?: 'CEP' | 'BEPC';
  /** Carte de collection débloquée par une bonne réponse */
  card?: string;
}
