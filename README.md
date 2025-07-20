# CastelColoTechnique

Application React + TypeScript pour la gestion de l'équipe technique d'une colonie de vacances. Toutes les données (agents, tâches, incidents…) sont maintenant stockées et mises à jour via Supabase.

## Configuration

1. Copier le fichier `.env.local` fourni à la racine du projet.
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```

## Build

Pour générer la version de production :
```bash
npm run build
```

## Authentification

La connexion se fait par email et mot de passe via Supabase. Seules les personnes enregistrées dans la base Supabase peuvent se connecter.

## Persistance des données

Un service `DataService` centralise toutes les opérations de lecture et d'écriture vers les tables Supabase. Chaque fonctionnalité de l'application utilise ce service pour manipuler les agents, les tâches, les incidents, le planning ou les messages. Les modifications sont donc sauvegardées de façon permanente dans Supabase.
