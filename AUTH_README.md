# 🔐 Guide d'Authentification - Dashboard Admin

## Résumé des changements

L'authentification du dashboard admin a été intégrée au backend. Voici ce qui a été implémenté:

### Fichiers créés/modifiés:

1. **Database**: 
   - [database/schema.sql](database/schema.sql) - Ajout de la table `users`

2. **Backend - Modèle**:
   - [backend/src/models/userModel.js](backend/src/models/userModel.js) - Modèle utilisateur pour les opérations DB

3. **Backend - Contrôleur**:
   - [backend/src/controller/authController.js](backend/src/controller/authController.js) - Logique d'authentification (login, register, logout, verify)

4. **Backend - Routes**:
   - [backend/src/routes/authRoutes.js](backend/src/routes/authRoutes.js) - Endpoints d'authentification

5. **Backend - Serveur**:
   - [backend/src/server.js](backend/src/server.js) - Intégration des routes d'auth

6. **Frontend**:
   - [frontend/admin/login/app.js](frontend/admin/login/app.js) - Logique de login connectée au backend API

---

## 🚀 Installation et Configuration

### 1. Créer les tables dans la base de données

Assurez-vous que votre base de données PostgreSQL est à jour :

```bash
# Exécuter le script SQL complet (inclut la table users)
psql -U votre_utilisateur -d votre_db -f database/schema.sql
```

### 2. Créer l'utilisateur admin initial

```bash
# Depuis la racine du projet
npm run seed:admin
```

Cela créera un utilisateur `admin` avec le mot de passe `admin`.

**⚠️ IMPORTANT**: Changez ces identifiants en production!

---

## 📋 Routes d'authentification

### POST `/api/auth/login`
Connecte un utilisateur et retourne un token

**Requête:**
```json
{
  "username": "admin",
  "password": "admin"
}
```

**Réponse (succès):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@restaurant.local",
    "role": "admin"
  },
  "token": "abc123def456...",
  "expiresAt": "2026-02-21T12:00:00.000Z"
}
```

**Réponse (erreur):**
```json
{
  "error": "Nom d'utilisateur ou mot de passe incorrect"
}
```

### POST `/api/auth/register`
Crée un nouvel utilisateur (admin)

**Requête:**
```json
{
  "username": "newadmin",
  "password": "securepassword",
  "email": "newadmin@restaurant.local",
  "role": "admin"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": 2,
    "username": "newadmin",
    "email": "newadmin@restaurant.local",
    "role": "admin",
    "created_at": "2026-02-20T12:00:00.000Z"
  }
}
```

### GET `/api/auth/verify`
Vérifie la validité du token

**Header:**
```
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "success": true,
  "message": "Token valide"
}
```

### POST `/api/auth/logout`
Déconnecte l'utilisateur

**Header:**
```
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "success": true,
  "message": "Déconnecté avec succès"
}
```

---

## 💾 Stockage du token

Le frontend sauvegarde automatiquement:
- **Token**: `localStorage['adminToken']`
- **Utilisateur**: `localStorage['adminUser']` (JSON)

Ces données sont utilisées pour maintenir la session et accéder aux informations utilisateur.

---

## 🔐 Sécurité - Points importants

### Hachage des mots de passe
Les mots de passe sont actuellement hachés avec **SHA256** (implémentation simple).

⚠️ **Pour la production**, utilisez `bcryptjs`:

```bash
npm install bcryptjs
```

Puis remplacez dans [backend/src/controller/authController.js](backend/src/controller/authController.js):

```javascript
const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
```

### Token JWT (recommandé)
Actuellement un token simple. Pour la production, utilisez `jsonwebtoken`:

```bash
npm install jsonwebtoken
```

---

## 🧪 Test de l'authentification

### Avec cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Logout
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer <token>"
```

### Sur le frontend
1. Allez à `http://localhost:5000/admin/login`
2. Entrez `admin` / `admin`
3. Vous devriez être connecté au tableau de bord

---

## 📝 Schéma de la table users

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'staff')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎯 Prochaines étapes (optionnel)

1. **Middleware d'authentification**: Protéger les routes qui nécessitent une authentification
2. **Refresh tokens**: Implémenter un système de refresh pour les tokens expirant
3. **Rôles et permissions**: Implémenter un contrôle d'accès basé sur les rôles (RBAC)
4. **Base de données**: Sauvegarder les tokens actifs pour une meilleure gestion
5. **Frontend**: Ajouter une page de gestion des utilisateurs admin

---

## 📚 Commandes utiles

```bash
# Démarrer le serveur
npm start
# ou (avec auto-reload)
npm run dev

# Seeder les données du menu
npm run seed

# Créer l'utilisateur admin initial
npm run seed:admin
```

---

✅ **L'authentification est maintenant prête à l'emploi !**
