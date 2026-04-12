# 🍽️ Menu Numérique - Système de Commande en Réseau Local

## 📋 Vue d'ensemble

**Menu Numérique** est un système de commande de restaurant 100% fonctionnel en réseau local, sans Internet requis.

### Caractéristiques Principales ✨

- ✅ **Codes QR Dynamiques** - Valides quels que soient les changements réseau
- ✅ **Zéro Internet** - Fonctionne complètement en local
- ✅ **Temps Réel** - WebSocket pour notifications instantanées
- ✅ **Multi-Plateforme** - Fonctionne sur tous les appareils
- ✅ **Aucune Installation Client** - Juste scanner et utiliser

## 🚀 Démarrage Rapide

### 1. Installation
```bash
cd "c:\Users\Landry\Menu numerique"
npm install
```

### 2. Démarrage du Serveur
```bash
npm start
```

Vous verrez:
```
✅ Server running on port 5000
✅ Database connected
✅ Local IP: 192.168.1.5  ← Notez cette IP!
✅ Access at: http://192.168.1.5:5000
```

### 3. Accéder aux Codes QR
Ouvrez dans votre navigateur:
```
http://192.168.1.5:5000/qr_setup
```

### 4. Test Rapide
Ouvrez sur votre téléphone connecté au même WiFi:
```
http://192.168.1.5:5000/client/?qr=TABLE_1
```

## 📱 Utilisation

### Pour les Clients
1. Scannez le code QR sur votre table
2. Parcourez le menu
3. Sélectionnez vos articles
4. Confirmez votre commande
5. Attendez la notification quand c'est prêt

### Pour l'Admin
1. Accédez à `http://[IP]:5000/admin`
2. Voyez les commandes en temps réel
3. Gérez l'état des commandes
4. Les clients sont notifiés instantanément

## 🔧 Configuration

### Variables d'Environnement
```
PORT=5000                    # Port du serveur (défaut: 5000)
NODE_ENV=development        # development ou production
DB_HOST=localhost          # Hôte PostgreSQL
DB_PORT=5432              # Port PostgreSQL
DB_NAME=menu_numeric       # Nom de la base
DB_USER=postgres           # Utilisateur DB
DB_PASSWORD=              # Password (optionnel en dev)
```

### Modifier le Nombre de Tables
Dans `frontend/client/qr_setup.html`:
```javascript
for (let i = 1; i <= 10; i++) {  // ← Changez 10 au nombre de tables
```

## 📂 Structure du Projet

```
Menu numerique/
├── backend/
│   ├── src/
│   │   ├── server.js                    # Serveur Express principal
│   │   ├── config/db.js                 # Configuration PostgreSQL
│   │   ├── controller/
│   │   │   ├── authController.js
│   │   │   ├── menuController.js
│   │   │   ├── orderController.js
│   │   │   └── tableController.js        # 🔥 Gestion QR
│   │   ├── models/
│   │   │   ├── menuModel.js
│   │   │   ├── orderModel.js
│   │   │   ├── userModel.js
│   │   │   └── tableModel.js            # 🔥 Nouveau
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── menuRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── tableRoutes.js           # 🔥 Nouveau
│   │   └── [...autres fichiers...]
│   └── uploads/
├── frontend/
│   ├── client/
│   │   ├── app.js                       # Menu client
│   │   ├── index.html
│   │   ├── qr_setup.html                # 🔥 Codes QR (NOUVEAU)
│   │   └── styles.css
│   └── admin/
│       ├── app.js                       # Panel admin
│       ├── index.html
│       └── styles.css
├── database/
│   └── schema.sql                       # Structure PostgreSQL
├── documentation/
│   ├── README.md
│   ├── DYNAMIC_IP_SOLUTION.md           # 🔥 Solution IP dynamique
│   ├── GUIDE_CODES_QR_DYNAMIQUES.md    # 🔥 Guide pratique
│   └── [autres docs...]
└── testDynamicQR.js                     # 🔥 Script de test
```

## 🎯 Fonctionnalités Principales

### 1. Système QR Dynamique 🔥 NOUVEAU
- **Problème résolu**: Les codes QR restaient figés quand l'IP changeait
- **Solution**: Les codes QR sont générés dynamiquement basés sur l'IP actuelle
- **Résultat**: Les codes QR restent valides même si le réseau change

**Voir:** [DYNAMIC_IP_SOLUTION.md](DYNAMIC_IP_SOLUTION.md)

### 2. Interface Client
- Menu complet avec images
- Recherche et filtrage
- Gestion du panier
- Passage de commande avec détails

### 3. Panel Admin
- Tableau de bord en temps réel
- Notifications Socket.io
- Gestion des commandes
- Historique des commandes

### 4. Système de Stockage
- PostgreSQL pour la persistance
- Tables: users, menus, orders, tables
- Migrations SQL automatiques

## 🌐 Architecture Réseau

```
┌─────────────────────────────────────────┐
│         WiFi Local (pas Internet)       │
├─────────────────────────────────────────┤
│                                         │
│  📱 Clients (Tables 1-10)   🖥️ Admin   │
│  ├─ Table 1                  │          │
│  ├─ Table 2         ← connexion →      │
│  ├─ Table 3           Express           │
│  └─ ...                Server            │
│                        :5000             │
│                         │                │
│                      PostgreSQL          │
│                      (base données)      │
│                                         │
└─────────────────────────────────────────┘

✅ Zéro Internet requis
✅ Tous les appareils sur le même réseau WiFi
✅ Port 5000 ouvert (remplacer si nécessaire)
```

## 📖 Documentation Disponible

| Document | Description |
|----------|-------------|
| [GUIDE_CODES_QR_DYNAMIQUES.md](GUIDE_CODES_QR_DYNAMIQUES.md) | 🔥 Guide pratique pour utiliser les QR |
| [DYNAMIC_IP_SOLUTION.md](DYNAMIC_IP_SOLUTION.md) | Architecture et solution IP dynamique |
| [QR_CODE_INTEGRATION.md](QR_CODE_INTEGRATION.md) | Détails techniques intégration QR |
| [GUIDE_RESEAU_LOCAL.md](GUIDE_RESEAU_LOCAL.md) | Configuration réseau local |
| [AUTH_README.md](AUTH_README.md) | Système d'authentification |

## 🧪 Tests et Diagnostics

### Tester le Système Dynamique QR
```bash
node testDynamicQR.js
```

Cela vérifie:
- ✅ Détection IP locale
- ✅ Connectivité serveur
- ✅ Endpoint /api/config
- ✅ Page qr_setup.html
- ✅ API dynamique /api/tables/dynamic-qr/1
- ✅ Interface client

### Test Manuel
```bash
# 1. Vérifier API config
curl http://192.168.1.5:5000/api/config

# 2. Vérifier QR dynamique
curl http://192.168.1.5:5000/api/tables/dynamic-qr/1

# 3. Accéder à la page QR
http://192.168.1.5:5000/qr_setup
```

## 🚨 Dépannage

### Le serveur ne démarre pas
```bash
# 1. Vérifiez que Node.js est installé
node --version

# 2. Vérifiez que les packages sont installés
npm install

# 3. Vérifiez que PostgreSQL est en route
# (ou utilisez SQLite au lieu en changeant db.js)
```

### Les clients ne peuvent pas accéder
**Checklist:**
1. ✅ Port 5000 est-il libre? (lsof -i :5000)
2. ✅ Clients sur le même WiFi?
3. ✅ L'IP dans le navigateur est-elle correcte?
4. ✅ Le pare-feu bloque-t-il le port?

### L'IP change mais les codes QR ne marchent plus
**Solution:** Les codes QR sont désormais dynamiques!
1. Accédez à `http://[NOUVELLE_IP]:5000/qr_setup`
2. Les codes QR affichent la nouvelle IP automatiquement
3. Aucun code n'est figé

## 📝 Notes de Version

### v1.2.0 - Codes QR Dynamiques (ACTUEL) 🔥
- ✅ Codes QR générés dynamiquement basés sur l'IP actuelle
- ✅ Pas de fichier qr_codes.json figé
- ✅ API /api/tables/dynamic-qr/:tableNumber
- ✅ Page qr_setup.html avec grille interactive
- ✅ Adaptation automatique aux changements de réseau

### v1.1.0 - Configuration Locale
- ✅ Système QR intégré
- ✅ Écoute sur 0.0.0.0 pour tous les interfaces
- ✅ Détection IP automatique
- ✅ Documentation complète en français

### v1.0.0 - Initial
- ✅ Système de commande de base
- ✅ Menu et admin en local
- ✅ WebSocket temps réel

## 🤝 Support et Questions

Pour des questions spécifiques:
- **IPs dynamiques**: Voir [DYNAMIC_IP_SOLUTION.md](DYNAMIC_IP_SOLUTION.md)
- **Guide pratique**: Voir [GUIDE_CODES_QR_DYNAMIQUES.md](GUIDE_CODES_QR_DYNAMIQUES.md)
- **Réseau local**: Voir [GUIDE_RESEAU_LOCAL.md](GUIDE_RESEAU_LOCAL.md)

## 📜 Licence

Propriété personnelle - Utilisation interne restaurant

---

**🎉 Système prêt pour production!**

Pour démarrer: `npm start` puis accédez à `http://192.168.x.x:5000/qr_setup`
