# CastelColoTechnique

Application React + TypeScript pour la gestion de l'équipe technique d'une colonie de vacances. Les données sont stockées dans Supabase.

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
