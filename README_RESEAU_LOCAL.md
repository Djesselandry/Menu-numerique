# 🍽️ Restaurant Menu Numérique - Système de Commande QR

## Vue d'ensemble

Un système complet de commande pour restaurant exécuté sur un **réseau local sans Internet** avec codes QR pour les tables.

### ✨ Caractéristiques principales

- **📱 Code QR par table** - Les clients scannent un code QR pour accéder au menu
- **🌐 Réseau local uniquement** - Fonctionne sans connexion Internet
- **⚡ Temps réel** - Commandes reçues instantanément via WebSockets
- **👨‍💼 Admin intuitif** - Interface pour gérer les commandes
- **📊 Base de données** - PostgreSQL pour la persistance

## 🚀 Démarrage Rapide

### Étape 1: Lancer le serveur

**Option A - Script Windows (Recommandé):**
```bash
Double-cliquez sur START.bat
Sélectionnez "1. Démarrer le serveur"
```

**Option B - PowerShell:**
```powershell
.\START.ps1 -Command start
```

**Option C - Ligne de commande:**
```bash
cd "c:\Users\Landry\Menu numerique"
npm start
```

Le serveur affichera:
```
📍 Adresse IP locale: 192.168.x.x
🌐 URL locale: http://192.168.x.x:5000
```

### Étape 2: Générer les codes QR

Dans un **nouveau terminal**:

```powershell
.\START.ps1 -Command qr -Tables 10
```

Ou:
```bash
node backend/scripts/generateQRCodes.js 10
```

### Étape 3: Imprimer et placer les codes QR

1. Une page `qr_codes.html` est générée
2. Ouvrez et imprimez-la
3. Découpez et colle les QR codes sur les tables

### Étape 4: Tester

**Client** (sur téléphone connecté au WiFi):
```
http://IP_LOCALE:5000/client/?qr=TABLE_1
```

**Admin** (sur ordinateur):
```
http://IP_LOCALE:5000/admin
```

## 📱 Comment le client utilise

1. **Arrive à sa table** - Trouve un code QR
2. **Scanne le code** - Avec la caméra du téléphone
3. **Choisit ses plats** - Interface du menu s'affiche
4. **Clique "Commander"** - Commande envoyée instantanément
5. **Attend** - Reçoit une notification quand c'est prêt

## 🏗️ Architecture

### Composants

```
Téléphones des clients
         ↓ WiFi local
   Serveur Node.js
   ├─ Routes Express
   ├─ WebSockets (Socket.io)
   └─ PostgreSQL Database
         ↑ WiFi local
   Écran Admin / Ordinateur
```

### Technologies

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Temps réel**: Socket.io
- **Base de données**: PostgreSQL
- **Codes QR**: QR Server API

## 📂 Structure du projet

```
Menu numerique/
├── backend/
│   ├── src/
│   │   ├── server.js              # Serveur principal
│   │   ├── config/
│   │   │   └── db.js             # Connection PostgreSQL
│   │   ├── routes/
│   │   │   ├── orderRoutes.js
│   │   │   ├── menuRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   └── tableRoutes.js     # Nouveau: Routes QR
│   │   ├── controller/
│   │   │   ├── orderController.js
│   │   │   ├── menuController.js
│   │   │   └── tableController.js # Nouveau: Gestion tables
│   │   └── models/
│   │       ├── orderModel.js      # Modifié: Support QR
│   │       └── tableModel.js      # Nouveau: Modèle tables
│   └── scripts/
│       └── generateQRCodes.js     # Nouveau: Génération QR
├── frontend/
│   ├── client/
│   │   ├── index.html
│   │   ├── app.js                 # Modifié: Détection QR
│   │   └── qr_setup.html          # Nouveau: Page de config
│   └── admin/
│       ├── index.html
│       └── app.js
├── database/
│   └── schema.sql                 # Schéma PostgreSQL
├── START.bat                      # Nouveau: Launcher Windows
├── START.ps1                      # Nouveau: Launcher PowerShell
├── GUIDE_RESEAU_LOCAL.md         # Nouveau: Guide réseau
└── package.json
```

## 🔌 API Endpoints

### Commandes
```
POST   /api/orders              # Créer une commande (avec qrCode ou tableNumber)
GET    /api/orders              # Récupérer les commandes actives
GET    /api/orders/:id          # Détails d'une commande
PUT    /api/orders/:id/status   # Changer le statut
GET    /api/orders/table/:tableNumber  # Commandes d'une table
```

### Tables (Nouveau)
```
POST   /api/tables/:id/generate-qr   # Générer un QR code pour une table
GET    /api/tables                    # Toutes les tables
GET    /api/tables/:tableNumber       # Détails d'une table
GET    /api/tables/qr/:qrCode        # Table par code QR
GET    /api/config                    # Configuration du serveur
```

### Menu
```
GET    /api/menu                      # Récupérer le menu
```

### Auth
```
POST   /api/auth/login                # Connexion admin
POST   /api/auth/register             # Enregistrement
```

## 🔄 Flux de commande avec QR

### Request du client:
```json
{
  "qrCode": "TABLE_1",
  "items": [
    {
      "id": 1,
      "name": "Burger",
      "price": 5000,
      "quantity": 2
    }
  ]
}
```

### Serveur retrouve la table:
```sql
SELECT id, table_number FROM tables WHERE qr_code = 'TABLE_1'
```

### Admin reçoit:
```json
{
  "id": 123,
  "table_id": 1,
  "table_number": 1,
  "items": [...],
  "status": "PENDING",
  "total": 10000
}
```

## ⚙️ Pages d'accès

| URL | Fonction | Public |
|-----|----------|--------|
| `/` | Page d'accueil client | Oui |
| `/client` | Interface client | Oui |
| `/client/?qr=TABLE_X` | Menu avec QR | Oui |
| `/qr_setup` | Configuration/test | Oui |
| `/admin` | Interface admin | Oui* |
| `/api/*` | API REST | Oui** |

*Admin avec authentification recommandée
**Publique sur réseau local

## 🛠️ Configuration

### `.env` (à la racine du backend)

```bash
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=YourPassword
DB_NAME=restaurant1_db
NODE_ENV=development
```

### Configuration automatique

Le serveur détecte automatiquement:
- ✅ Adresse IP locale (ipv4)
- ✅ Port disponible
- ✅ Zone pour servir les fichiers statiques

## 📊 Base de données

### Schéma principal

```sql
-- Tables
CREATE TABLE tables (
  id SERIAL PRIMARY KEY,
  table_number INT UNIQUE,
  qr_code TEXT              -- Nouveau
);

-- Commandes
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  table_id INT REFERENCES tables(id),
  status VARCHAR(20),
  total NUMERIC,
  created_at TIMESTAMP
);

-- Articles de commande
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  menu_id INT,
  quantity INT,
  unit_price NUMERIC
);
```

## 🔐 Sécurité

### Réseau local
- ✅ Pas d'accès depuis l'extérieur
- ✅ Pas besoin de certificat HTTPS
- ⚠️ Activez un mot de passe WiFi fort

### Données
- ✅ Sauvegardes PostgreSQL régulières
- ⚠️ Pas de chiffrement (réseau local sécurisé)
- ✅ CORS activé pour le réseau local

## 🐛 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier les ports
netstat -ano | findstr :5000

# Vérifier PostgreSQL
psql -h localhost -U postgres
```

### Impossible de scanner le QR
1. **WiFi**: Vérifiez que le téléphone est sur le même réseau
2. **IP**: Régénérez les QR codes avec l'IP correcte
3. **Firewall**: Ouvrez le port 5000 dans le Par-feu Windows

### La base de données n'est pas connectée
```bash
# Créer la base de données
psql -U postgres
CREATE DATABASE restaurant1_db;

# Exécuter le schéma
psql -U postgres -d restaurant1_db -f database/schema.sql
```

## 📈 Performance

### Sur réseau local
- Latence: < 50ms
- Bande passante: Minimale (< 100KB/commande)
- Clients simultanés: 50+ (dépend du serveur)

### Limites
- Un seul serveur = point unique de défaillance
- Pas de réplication de base de données
- Pas de load balancing

## 📚 Documentation

Consultez les fichiers pour plus de détails:
- `GUIDE_RESEAU_LOCAL.md` - Configuration réseau détaillée
- `QR_CODE_INTEGRATION.md` - Intégration simplifiée des QR
- `AUTH_README.md` - Authentification admin

## 🔄 Mise à jour et maintenance

### Sauvegarde quotidienne
```bash
# Sauvegarder la base de données
pg_dump -U postgres restaurant1_db > backup.sql

# Restaurer
psql -U postgres restaurant1_db < backup.sql
```

### Processus de mise à jour
1. Arrêtez le serveur `Ctrl+C`
2. Mettez à jour le code
3. Exécutez `npm install`
4. Redémarrez avec `npm start`

## 📞 Support

Pour des problèmes:
1. Consultez le guide réseau
2. Vérifiez les logs du serveur
3. Testez la page `/qr_setup`

## 📄 Licence

ISC

## 📝 Changelog

### v2.0 (Nouilles - Commande avec QR)
- ✅ Système de codes QR
- ✅ Détection automatique du réseau local
- ✅ Routes pour la gestion des tables
- ✅ Scripts de génération QR
- ✅ Page de configuration
- ✅ Support serveur sur 0.0.0.0

### v1.0 (Initiale)
- Système de commande basique
- Interface client et admin
- Authentification admin
