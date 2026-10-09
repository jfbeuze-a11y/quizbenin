# QuizBénin · prototype jouable

Prototype de l'application de quiz décrite dans le cahier des charges « Application quiz culture générale Bénin (6-15 ans) ». Il sert de maquette interactive (lot 1) pour les tests auprès des enfants, des parents et des enseignants. Ce n'est pas encore l'application de production.

## Lancer

```bash
npm install
npm run dev
```

Ouvrir http://localhost:5173. Pour une version installable et jouable hors ligne : `npm run build`, puis servir le dossier `dist/`.

## Ce qui fonctionne

- **Trois univers** déduits de la classe : Petits explorateurs (CI-CE1, thème clair, 2-3 choix, pas de chrono, lecture audio automatique), Aventuriers (CE2-CM2, 30 s), Champions (6e-3e, sombre et néon, 20 s, anecdotes).
- **Profils sans donnée identifiante** : pseudo généré (saisie libre filtrée à partir de 13 ans), avatar vectoriel, année de naissance, département. 5 profils par appareil, code à 4 chiffres ou image secrète.
- **Modes** : défi du jour (même série pour tous), quiz rapide, carte Aventure des 12 départements (7/10 pour débloquer le suivant), révision CEP/BEPC par thème, duel asynchrone par code.
- **Moteur d'adaptation** (`src/engine/adaptive.ts`) : score Elo par thème, cible de 70 % de réussite, pas de répétition sous 30 jours, questions ratées réintroduites à 1, 3, 7 et 14 jours.
- **Gamification sans mécanique de hasard** : XP et niveaux, flamme avec jour de grâce hebdomadaire, 8 badges, 11 cartes de collection, boutique d'avatars en wax payée uniquement en pièces gagnées, jokers 50/50, +15 s et passer.
- **Publicité encadrée** (`src/engine/ads.ts`) : spot vidéo de 7 s à chaque lancement, après le logo (non passable, impossible à fermer avant la fin), flyer toutes les 2 séries (fermeture après 5 s, 6 par jour), vidéo interstitielle à l'ouverture d'un monde (3 par jour), vidéo récompensée facultative (5 par jour), bannières hors écran de jeu, mention « Publicité » visible, aucune pub pour les Petits avant leur 4e partie du jour, plafond de 10 min par heure de jeu. Tout clic passe par une porte parentale.
- **Espace parent** derrière une porte parentale : temps de jeu par jour, réussite par thème, limite quotidienne, couvre-feu 21 h-7 h, activation des duels et classements, export JSON, suppression du profil.
- **Accessibilité** : bonne et mauvaise réponse signalées par icône et couleur, réponses au clavier (A-D ou 1-4, Entrée), police lisible en option, mouvement réduit respecté, mode économie de données.
- **Hors ligne** : service worker en production, progression stockée localement.

## Simulé ou absent

| Élément | État dans le prototype |
|---|---|
| Compte parent avec code OTP | Non branché : tout reste sur l'appareil |
| Banque de questions | 114 questions de démonstration au lieu de 6 000, à faire valider par le comité pédagogique |
| Voix des questions | Synthèse vocale du navigateur ; la production exige une voix humaine enregistrée |
| Classement | Joueurs fictifs stables sur la semaine ; le calcul serveur et l'anti-triche restent à faire |
| Duel | Même série garantie par le code, mais pas de comparaison automatique des scores |
| Publicités | Annonceurs fictifs, vidéos simulées par un compte à rebours |
| Back-office, régie annonceurs, espace enseignant, mode classe | Hors prototype |
| Illustrations | Émojis en attendant les visuels de la direction artistique |

## Structure

```
src/
  data/       questions, univers, départements, badges, cartes, avatars, annonces
  engine/     adaptation, récompenses, règles publicitaires, sons
  store/      état local (localStorage) et profils
  screens/    un fichier par écran
  components/ avatar SVG, icônes, porte parentale, publicités, confettis
```

Pour ajouter des questions : `src/data/questions.ts`. Chaque question porte les métadonnées de la section 3.2 (univers, thème, difficulté 1-5, portée, département, examen, carte débloquée).
