# Nous 🫶 : Concept Complet

## Vue d'ensemble

**Nous 🫶** est une application web privée conçue comme un espace personnel partagé pour un couple. Elle regroupe souvenirs, petites attentions quotidiennes et moments importants dans un seul endroit chaleureux et vivant.

L'application n'est pas un réseau social. Elle est pensée pour être ouverte régulièrement, même quelques secondes, grâce à une interface simple, agréable et remplie de petites surprises.

---

## Principes Directeurs

### Simplicité

Chaque fonctionnalité doit être facile à comprendre. En ouvrant l'application, l'utilisateur doit immédiatement savoir quoi faire. Aucune fonctionnalité ne doit demander plusieurs écrans ou une configuration compliquée.

### Rapidité

L'application doit être très légère et fonctionner parfaitement sur :
- Android
- iPhone
- Vieux ordinateurs
- Connexions Internet moyennes

Les temps de chargement doivent être minimaux.

### Évolutive

Le projet est pensé pour grandir au fil du temps. Il n'est pas nécessaire de développer toutes les fonctionnalités dès le début. Chaque module doit pouvoir être ajouté indépendamment.

### Personnelle

Toutes les informations concernent uniquement le couple. L'application n'est pas générique. Les textes, photos, souvenirs et messages sont entièrement personnalisés.

---

## Fonctionnalités

### Accueil (Dashboard)

**Description :** L'écran principal et point d'entrée de l'application.

**Contenu :**
- Une photo aléatoire
- Message du jour
- Nombre de jours ensemble (compteur)
- Date du prochain événement important (possibilité d'en ajouter facilement)
- Accès rapide aux différents modules

**Spécifications :**
- Interface très épurée
- Design minimaliste
- Chargement rapide
- Responsive mobile-first

---

### Message du Jour

**Description :** Chaque jour, un message différent apparaît sur la page d'accueil.

**Types de messages :**
- Compliments
- Souvenirs
- Citations
- Blagues
- Encouragements
- Déclarations

**Fonctionnement :**
- Messages écrits à l'avance
- Possibilité d'en ajouter au fil du temps
- Sélection aléatoire quotidienne
- Un seul message par jour (basé sur la date actuelle)
- Les messages réapparaissent après avoir parcouru tous les messages disponibles

**Interface :**
- Affichage centré sur l'accueil
- Petit bouton pour voir l'historique
- Animations discrètes à l'affichage

---

### Notre Jardin

**Description :** Une représentation symbolique de la relation qui évolue progressivement avec l'utilisation de l'application.

**Éléments :**
- Fleurs
- Papillons
- Arbres
- Saisons
- Petites décorations

**Déblocages :**
Certaines plantes et éléments se débloquent lors d'événements spécifiques :
- Anniversaires (du couple, individuels)
- Vacances
- Saint-Valentin
- Noël
- Premiers jours d'une saison
- Jalons (100 jours ensemble, 1 an, etc.)

**Spécifications :**
- Aucun objectif de performance ou de productivité
- Sert uniquement à donner une impression d'évolution
- Animations très discrètes
- L'utilisateur n'a rien à faire pour que le jardin progresse (jardin qui s'enrichit naturellement en fonction du temps passé sur l'app)

---

### Souvenirs

**Description :** Une galerie et chronologie de souvenirs du couple.

**Éléments d'un souvenir :**
- Une ou plusieurs photos
- Date
- Titre
- Description
- Lieu (optionnel)
- Musique (optionnel)

**Modes de consultation :**
- **Galerie :** Vue sous forme de grille de photos
- **Chronologie :** Frise temporelle avec événements
- **Carte :** Affichage géographique des souvenirs (voir la section Carte)

**Fonctionnalités :**
- Ajouter/modifier/supprimer un souvenir
- Recherche par date, titre, ou lieu
- Tri (plus récent d'abord, plus ancien d'abord, par lieu)
- Filtres simples

---

### Carte

**Description :** Une carte regroupant tous les endroits où le couple est allé.

**Contenu d'un point sur la carte :**
- Photos du lieu
- Anecdotes
- Date(s) de visite
- Liens vers les souvenirs associés

**Évolution :**
- Au fil des années, la carte devient un journal de voyage complet
- Possibilité de voir les lieux revisités et la fréquence

**Fonctionnalités :**
- Ajouter un lieu
- Zoom et exploration intuitive
- Vue d'ensemble (tous les lieux) vs détail (un lieu spécifique)

---

### On mange quoi ?

**Description :** Une petite aide lorsque le couple hésite sur le choix d'un repas.

**Fonctionnalités :**
- Liste des restaurants favoris
- Recettes sauvegardées
- Tri par catégorie (cuisine asiatique, italien, mexicain, etc.)
- Tirage aléatoire pour décider
- Sauvegarde des favoris

**Objectif :** Éliminer les longues discussions du type "Je ne sais pas, choisis."

---

### Humeur

**Description :** Suivi simple du quotidien à travers les humeurs.

**Système :**
- Sélection quotidienne d'une humeur
- Emojis : 😊 😌 😴 😭 😡 ❤️
- Optionnel (pas d'obligation)

**Affichage :**
- Historique visible en format calendrier
- Statistiques très simples (tendances sur 7j, 30j)
- Aucune gamification ou compétition

---

### Compteur

**Description :** Section informative sur les dates importants.

**Affichage :**
- Nombre de jours ensemble (calculé automatiquement)
- Temps jusqu'au prochain anniversaire
- Liste des événements importants et leurs dates

**Spécifications :**
- Mise à jour automatique
- Interface informative, pas interactive

---

## Design et Ambiance Visuelle

### Style Global

- **Minimaliste** : Pas d'éléments superflus, présence d'étoiles
- **Doux** : Formes arrondies, transisitions fluides
- **Chaleureux** : Sentiment de confort et d'intimité
- **Moderne** : Épuré, pas rétro
- **Inspiré du mouvement "cozy"** : Ambiance apaisante et accueillante

### Palette de Couleurs

  exemple :
```
- Blanc cassé : #FAF8F3
- Beige : #E8DCC8
- Rose pastel : #F5D5D8
- Vert sauge : #9CAF88
- Bleu clair : #B4D9E8
- Lavande : #D4C5E2
```

### Animations

- Très discrètes (jamais envahissantes)
- Fluides et naturelles
- Durée : 200-400ms généralement
- L'application doit procurer une sensation de calme

### Typographie

- Polices modernes et lisibles
- Bonne hiérarchie visuelle
- Contraste suffisant pour l'accessibilité

---

## Architecture Technique

### Plateforme

**Progressive Web App (PWA)**
- Installable directement depuis un navigateur mobile
- Fonctionnement hors ligne pour les données locales
- Synchronisation quand la connexion est disponible

### Stack Recommandé

- **Frontend :** React/Vue/Svelte (léger)
- **Styling :** Tailwind CSS ou CSS-in-JS minimal
- **Stockage :** IndexedDB (données locales) + Backend optionnel
- **Animations :** CSS animations ou bibliothèque légère (Framer Motion minimal)

### Compatibilité

- **Priorité absolue :** Mobile (iOS et Android)
- **Alternative :** Desktop (navigateur)
- Tests réguliers sur des appareils variés

### Performances

**Objectifs :**
- Chargement initial < 2s sur 3G
- Interactivité immédiate
- Pas de layout shift

**À éviter :**
- Bibliothèques inutiles
- Animations lourdes
- Vidéos automatiques
- Effets 3D

### Confidentialité et Sécurité

- Toutes les données sont privées
- Aucune publicité
- Aucun suivi analytique ou publicitaire
- Aucun partage avec d'autres utilisateurs
- Les données peuvent être stockées localement ou dans une base backend sécurisée

### Architecture des Modules

Chaque fonctionnalité est un module indépendant :

```
/modules
  ├── home/          (Accueil)
  ├── garden/        (Jardin)
  ├── messages/      (Message du jour)
  ├── memories/      (Souvenirs)
  ├── map/           (Carte)
  ├── food/          (On mange quoi ?)
  ├── mood/          (Humeur)
  └── counter/       (Compteur)
```

Cette architecture permet d'ajouter facilement de nouvelles fonctionnalités sans modifier le reste de l'application.

---

## Plan de Développement (Phases)

### Phase 1 (MVP)
1. Accueil
2. Message du jour
3. Compteur
4. Humeur
5. Navigation de base

### Phase 2
6. Souvenirs (galerie + ajout photos)

### Phase 3
7. Notre Jardin (version simple)
8. Carte (carte de base)

### Phase 4 (Améliorations)
- Améliorations du jardin
- Features avancées de la carte
- Optimisations

---

## Évolutions Futures Possibles

À long terme, il serait possible d'ajouter :

- **Widget** : Widget pour l'écran d'accueil du téléphone
- **Albums collaboratifs** : Versions "privées" de certains albums
- **Frise chronologique interactive** : Vue différente des souvenirs
- **Playlists de souvenirs** : Musiques associées aux moments
- **Calendrier partagé** : Événements importants synchronisés
- **Liste d'envies ou de projets** : Choses à faire ensemble
- **Défis** : Petits défis ludiques à relever ensemble
- **Générateur de souvenirs** : "Il y a un an, nous étions ici…"
- **Thèmes saisonniers** : Changement visuel selon la saison
- **Mode anniversaire** : Animations spéciales pour les grandes dates
- **Notifications** : Rappels discrets et positifs
- **Backup/Export** : Sauvegardes de données

---

## Vision du Projet

Le but n'est pas de créer une application parfaite ou complexe.

Le but est de construire, petit à petit, un **lieu numérique qui nous ressemble** : une application que l'on garde pendant des années, qui évolue avec notre histoire et qui rassemble tous ces petits moments qui méritent d'être conservés.

Au fil du temps, Nous 🫶 devient autant un carnet de souvenirs qu'une collection de petites attentions quotidiennes : un espace intime où notre histoire continue de grandir.

---

## Fichiers de Référence

Tous les messages du jour, lieux, coupons et événements doivent être facilement configurables en JSON ou dans une base de données pour permettre une maintenance simple.

Exemple de structure JSON pour les messages :

```json
{
  "messages": [
    {
      "id": 1,
      "text": "Chaque jour avec toi est une chance.",
      "type": "compliment"
    },
    {
      "id": 2,
      "text": "Te souviens-tu de ce voyage?",
      "type": "memory"
    }
  ]
}
```

---

## Notes Finales

- L'application doit être **régulièrement utilisée** pour atteindre son potentiel
- Les données doivent être **facilement sauvegardables** par l'utilisateur
- L'interface doit rester **simple** même quand de nouvelles fonctionnalités sont ajoutées
- **Tester sur mobile** doit être la priorité absolue

---

**Dernière mise à jour :** Août 2026
