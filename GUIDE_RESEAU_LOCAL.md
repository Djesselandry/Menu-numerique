# Configuration Réseau Local - Guide Complet

## 📋 Vue d'ensemble

Votre système de commande fonctionne maintenant en **réseau local sans Internet**. Voici comment le configurer et l'utiliser.

## 🚀 Démarrage du Serveur

### Étape 1: Démarrer le serveur Express

```bash
cd "c:\Users\Landry\Menu numerique"
npm start
```

Le serveur affichera quelque chose comme:
```
======================================================================
🚀 Serveur Restaurant lancé!
======================================================================
📍 Adresse IP locale: 192.168.x.x
🌐 URL locale: http://192.168.x.x:5000
📱 Port: 5000
🔗 Admin: http://192.168.x.x:5000/admin
📋 Client: http://192.168.x.x:5000/client
======================================================================

💡 Utilisez cette adresse IP pour configurer votre réseau local:
   http://192.168.x.x:5000
```

### Étape 2: Noter votre adresse IP locale

L'adresse IP affichée (ex: 192.168.1.5) est celle que vous utiliserez pour configurer vos codes QR.

## 🎯 Générer les Codes QR

Une fois le serveur lancé, dans un **autre terminal**:

```bash
cd "c:\Users\Landry\Menu numerique\backend"
node scripts/generateQRCodes.js 10
```

Cela créera:
- `qr_codes.json` - Les données des codes QR en JSON
- `qr_codes.html` - Une page à imprimer avec les codes QR

**Paramètres:**
```bash
# Générer pour 10 tables
node scripts/generateQRCodes.js 10

# Générer avec une adresse IP spécifique
node scripts/generateQRCodes.js 10 --ip=192.168.1.5

# Générer pour 20 tables
node scripts/generateQRCodes.js 20
```

## 📱 Comment fonctionne le système local

### Sur le restaurant (serveur):
1. **Ordinateur avec serveur Node.js**
   - Exécute le backend
   - Exécute la base de données PostgreSQL
   - Sert l'interface admin et client

### Sur les tables (clients):
1. **Téléphone/Tablette du client**
   - **DOIT être connectée au même réseau WiFi**
   - Scanne le code QR
   - Accède à `http://IP_SERVEUR:5000/client/?qr=TABLE_X`
   - Voir le menu et commander (pas besoin d'Internet)

### Sur l'écran du restaurant (admin):
1. **Ordinateur ou grand écran**
   - Accédez à `http://IP_LOCALE:5000/admin`
   - Recevez les commandes en temps réel
   - Peuvent être mis à jour sur le même réseau

## 🔧 Configuration du Réseau WiFi

### Si vous utilisez un point d'accès WiFi:

**Option 1: Point d'accès intégré (Windows 10/11)**
```powershell
# Créer un point d'accès
netsh wlan set hostednetwork mode=allow ssid=RestaurantMenu key=123456789

# Démarrer le point d'accès
netsh wlan start hostednetwork

# Vérifier le statut
netsh wlan show hostednetwork

# Arrêter le point d'accès
netsh wlan stop hostednetwork
```

**Option 2: Routeur WiFi**
- Connectez l'ordinateur en Ethernet au routeur
- Connectez les téléphones/tablettes au WiFi du routeur
- Tous les appareils peuvent communiquer

## 🖥️ Pages d'accès

### Configuration/Setup (pour vérifier la connectivité):
```
http://IP_LOCALE:5000/qr_setup
```

Cette page montre:
- L'adresse IP du serveur
- L'état du serveur
- Un code QR de test
- Un aperçu du code client

### Menu Client:
```
http://IP_LOCALE:5000/client
http://IP_LOCALE:5000/client/?qr=TABLE_1 (avec code QR)
```

### Admin:
```
http://IP_LOCALE:5000/admin
```

## 📊 Flux complet d'une commande

```
1. Client arrive à la table
       ↓
2. Scanne le code QR avec le téléphone
       ↓
3. Son téléphone se connecte au WiFi local du restaurant
       ↓
4. L'interface du menu s'affiche 
   (depuis le serveur local, PAS d'Internet requis)
       ↓
5. Le client sélectionne ses plats et clique "Commander"
       ↓
6. Une requête est envoyée au serveur local
       ↓
7. L'admin reçoit la nouvelle commande avec:
   - Numéro de table (depuis le code QR)
   - Liste des articles
   - Total
       ↓
8. L'admin prépare et marque la commande comme servie
```

## 💡 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier les ports utilisés
netstat -ano | findstr :5000

# Vérifier la base de données
# Assurez-vous que PostgreSQL est en cours d'exécution
```

### Le téléphone ne peut pas accéder au serveur
1. **Vérifier la connexion réseau**
   ```bash
   # Sur le téléphone, tester l'IP du serveur
   ping 192.168.x.x  # Remplacer par votre IP
   ```

2. **Vérifier le pare-feu Windows**
   - Permettre Node.js à travers le pare-feu
   - Ou désactiver le pare-feu temporairement pour tester

3. **Vérifier le routeur**
   - Tous les appareils doivent être sur le même réseau
   - Pas de réseau invité séparé

### Les codes QR ne se chargent pas
1. Assurez-vous que le serveur est en cours d'exécution
2. Régénérez les codes QR avec l'adresse IP correcte
3. Testez l'URL dans un navigateur d'abord

## 🔐 Sécurité en réseau local

### Recommandations:
1. **Réseau fermé**: Utilisez un réseau WiFi avec mot de passe
2. **Pare-feu**: Activez le pare-feu Windows
3. **Sauvegardes**: Sauvegardez régulièrement votre base de données
4. **Accès admin**: Sécurisez l'accès à `/admin` avec un mot de passe

## 📈 Performance

### Sur le même réseau local:
- **Latence**: < 50ms (généralement)
- **Bande passante**: Minimale (quelques KB par requête)
- **Nombre de clients simultanés**: Limité par les capacités du serveur Node.js

### Limitations:
- Un seul serveur = point unique de défaillance
- Pas d'accès depuis l'extérieur du réseau
- Pas de secours si l'Internet tombe (par conception, c'est OK pour vous)

## 🎨 Fichiers créés/modifiés

### Nouveaux fichiers:
- `frontend/client/qr_setup.html` - Page de configuration
- `backend/scripts/generateQRCodes.js` - Script de génération
- `backend/src/models/tableModel.js` - Modèle de tables
- `backend/src/controller/tableController.js` - Contrôleur de tables
- `backend/src/routes/tableRoutes.js` - Routes des tables

### Fichiers modifiés:
- `backend/src/server.js` - Écoute sur 0.0.0.0, affiche l'IP
- `backend/src/controller/orderController.js` - Accepte les codes QR
- `backend/src/models/orderModel.js` - Traite les codes QR
- `frontend/client/app.js` - Détecte et utilise les codes QR

## 🚪 Points d'accès principaux

| Route | Fonction | Accès |
|-------|----------|-------|
| `http://IP:5000/` | Page client par défaut | Téléphones |
| `http://IP:5000/qr_setup` | Configuration réseau | Vérification |
| `http://IP:5000/client/?qr=TABLE_X` | Menu avec table | Téléphones-QR |
| `http://IP:5000/admin` | Interface admin | Ordinateur |
| `http://IP:5000/api/config` | Configuration serveur | API |
| `http://IP:5000/api/tables` | Liste des tables | API |
| `http://IP:5000/api/orders` | Gestion des commandes | API |

## ✅ Checklist de Configuration

- [ ] Serveur Node.js démarré
- [ ] Base de données PostgreSQL en cours d'exécution
- [ ] Adresse IP locale notée (ex: 192.168.1.5)
- [ ] Codes QR générés
- [ ] Réseau WiFi configuré
- [ ] Téléphones connectés au WiFi
- [ ] Brûler-test d'accès: `http://IP:5000/qr_setup`
- [ ] Page admin accessible: `http://IP:5000/admin`
- [ ] Code QR scannés et fonctionnels
- [ ] Première commande testée
