# 🍽️ Menu Numérique - Restaurant Digital Menu System

Système de gestion de menu numérique pour restaurants avec commande via code QR.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 14+
- PostgreSQL 12+
- npm

### Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env

# Démarrer le serveur
npm start
```

Le serveur démarre sur `http://192.168.0.120:5000`

## 📱 Accès aux Interfaces

- **Admin**: http://192.168.0.120:5000/admin/
  - Gérer le menu (ajouter, éditer, supprimer plats)
  - Upload d'images
  - Gérer les commandes

- **Client**: http://192.168.0.120:5000/client/
  - Consulter le menu
  - Ajouter au panier
  - Passer des commandes

## 🏗️ Architecture

```
backend/
  ├── src/
  │   ├── server.js          # Application principale
  │   ├── config/            # Configuration DB
  │   ├── controller/        # Contrôleurs API
  │   ├── models/            # Modèles de données
  │   ├── routes/            # Routes API
  │   ├── middlewares/       # Upload, auth
  │   └── uploads/           # Images des plats
  └── scripts/
      └── generateQRCodes.js # Génération codes QR

frontend/
  ├── admin/                 # Interface admin
  └── client/                # Interface client

database/
  └── schema.sql            # Schéma PostgreSQL
```

## 🔗 API Endpoints

### Menu
- `GET /api/menu` - Récupérer tous les plats
- `POST /api/menu` - Créer un plat (admin)
- `PUT /api/menu/:id` - Modifier un plat (admin)
- `DELETE /api/menu/:id` - Supprimer un plat (admin)

### Commandes
- `GET /api/orders` - Récupérer les commandes
- `POST /api/orders` - Créer une commande (client)
- `GET /api/orders/:id` - Détails d'une commande

### Tables
- `GET /api/tables` - Récupérer les tables

### Authentication
- `POST /api/auth/login` - Login admin

## ⚙️ Configuration

Éditer `.env` pour configurer:
- Port serveur
- Connexion PostgreSQL
- Variables d'environnement

## 📝 Features

- ✅ Menu digital avec images
- ✅ Code QR par table
- ✅ Système de commande
- ✅ Admin dashboard
- ✅ Support multilingue
- ✅ Real-time updates (Socket.io)

## 🔐 Authentification

**Admin Default:**
- Username: admin
- Password: admin (À CHANGER EN PRODUCTION)

## 📦 Technologies

- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Real-time**: Socket.io
- **File Upload**: Multer
- **QR Codes**: QR Server API
- **Auth**: JWT

## 📄 License

MIT

## 👥 Support

Pour toute question ou problème, consultez la documentation ou contactez l'administrateur.
