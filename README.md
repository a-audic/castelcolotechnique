# Plateforme technique Castel Solère

Application de gestion d'équipe technique pour la colonie de vacances.

## 🚀 Déploiement sur IONOS

### Prérequis
- Compte IONOS avec hébergement web
- Accès FTP ou gestionnaire de fichiers
- Domaine configuré

### Instructions de déploiement

1. **Construction de l'application**
   ```bash
   npm run build:prod
   ```

2. **Upload des fichiers**
   - Uploadez tout le contenu du dossier `dist/` vers le répertoire racine de votre domaine sur IONOS
   - Assurez-vous que le fichier `.htaccess` est bien présent

3. **Configuration**
   - L'application utilise le localStorage pour la persistance des données
   - Aucune base de données externe n'est requise
   - Les données sont stockées localement dans le navigateur

## 🔐 Comptes par défaut

### Responsable
- **Identifiant** : Alexis Audic
- **Mot de passe** : Hg9j46540906!842069!
- **Accès** : Complet (tous les modules)

### Agent technique
- **Identifiant** : tech_test
- **Mot de passe** : password123
- **Accès** : Incidents (modification état), Messages

### Agent d'entretien
- **Identifiant** : entretien_test
- **Mot de passe** : password123
- **Accès** : Incidents (signalement), Messages

## 📊 Fonctionnalités

- ✅ **Gestion des incidents** (signalement, suivi, résolution)
- ✅ **Messagerie commune** (communication équipe)
- ✅ **Planning et bâtiments** (organisation des espaces)
- ✅ **Calendrier intégré** (événements, tâches, congés)
- ✅ **Gestion des agents** (équipe, horaires, congés)
- ✅ **Gestion des tâches** (attribution, suivi, échéances)
- ✅ **Paramètres avancés** (configuration, export/import)

## 🛡️ Sécurité

- ✅ **Authentification** avec sessions temporisées (8h)
- ✅ **Autorisations** strictes par rôle
- ✅ **Protection XSS** et headers de sécurité
- ✅ **Validation** des données côté client

## 💾 Persistance des données

- **LocalStorage** : Toutes les données sont stockées localement
- **Export/Import** : Sauvegarde et restauration complète
- **Pas de BDD externe** : Aucune configuration serveur requise
- **Données par navigateur** : Chaque utilisateur/navigateur a ses données

## 🔧 Maintenance

- **Sauvegarde** : Utilisez la fonction Export dans les Paramètres
- **Restauration** : Utilisez la fonction Import pour restaurer
- **Mise à jour** : Remplacez les fichiers et importez les données

## 📱 Compatibilité

- ✅ **Navigateurs modernes** (Chrome, Firefox, Safari, Edge)
- ✅ **Responsive** (mobile, tablette, desktop)
- ✅ **PWA Ready** (peut être installé comme app)

## 🆘 Support

En cas de problème :
1. Vérifiez que JavaScript est activé
2. Videz le cache du navigateur
3. Exportez vos données avant toute manipulation
4. Contactez le support technique si nécessaire