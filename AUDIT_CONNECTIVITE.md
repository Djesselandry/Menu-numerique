# 🔧 Guide de Dépannage - Connectivité Réseau Local

Vous avez un problème de connexion? Ce guide vous aide à diagnostiquer et résoudre.

## 🚨 Problèmes courants

### 1️⃣ "Je ne peux pas accéder au serveur depuis mon téléphone"

#### Diagnostic:
```bash
# Sur le téléphone, ouvrez un navigateur et essayez:
# http://IP_SERVEUR:5000

# Si ça ne fonctionne pas, continuez le diagnostic
```

#### Solutions par ordre:

**A) Vérifier que le serveur est vraiment lancé**
```bash
# Sur l'ordinateur serveur, le serveur doit afficher:
# 📍 Adresse IP locale: 192.168.x.x
# 🌐 URL locale: http://192.168.x.x:5000
```

**B) Vérifier le réseau WiFi**
```bash
# Les deux appareils doivent être sur le MÊME réseau

# Sur l'ordinateur (Windows):
ipconfig

# Regardez "IPv4 Address" sous votre adapter WiFi
# Ex: 192.168.1.5
```

```bash
# Sur le téléphone:
Paramètres > WiFi
# Doit montrer le même réseau que l'ordinateur
# Ex: "RestaurantWiFi" ou votre réseau
```

**C) Testing de la connexion**

Sur le téléphone:
1. Ouvrez le navigateur
2. Tapez: `http://IP_SERVEUR:5000/qr_setup`
   (Remplacez IP_SERVEUR par Ex: 192.168.1.5)

Si ça fonctionne → **Allez à la section "Codes QR"**
Si ça ne fonctionne pas → **Continuez le diagnostic**

**D) Le Par-feu Windows bloque la connexion**

Windows Defender Firewall peut bloquer les connexions:

```bash
# Option 1: Temporaire (pour tester)
# Appuyez sur WIN+R et tapez:
wf.msc

# Cherchez "Node.js" ou "npm"
# Cochez les deux options (Private + Public)

# Option 2: Créer une règle spécifique
# Commande PowerShell (en admin):
New-NetFirewallRule -DisplayName "Node.js" `
  -Direction Inbound -Action Allow `
  -Program "C:\Program Files\nodejs\node.exe"
```

**E) Le port 5000 est déjà utilisé**

```bash
# Vérifier quel processus utilise le port 5000
netstat -ano | findstr :5000

# Si quelque chose utilise le port, terminez-le ou changez le port
# Éditer .env et changer PORT=5001 (par exemple)
```

---

### 2️⃣ "Le code QR ne fonctionne pas / affiche une erreur"

#### Diagnostic:

Les codes QR pourraient être générés avec une mauvaise IP.

```bash
# Vérifier votre adresse IP
# Sur l'ordinateur (Windows):
ipconfig

# Regardez "IPv4 Address" sous votre WiFi adapter
# Format: 192.168.x.x
```

#### Solution:

**A) Régénérez les codes QR avec la bonne IP**

```bash
# Arrêtez le serveur (Ctrl+C)

# Ouvrez un nouveau terminal et régénérez:
cd "c:\Users\Landry\Menu numerique\backend"
node scripts/generateQRCodes.js 10 --ip=192.168.1.5

# Remplacez 192.168.1.5 par VOTRE adresse IP
```

**B) Testez le QR code généré**

```
# Vérifie que le fichier qr_codes.json existe:
backend/scripts/qr_codes.json

# Ouvrez et regardez une URL client:
"client_url": "http://192.168.1.5:5000/client/?qr=TABLE_1"
```

Testez cette URL directement dans le navigateur du téléphone.

---

### 3️⃣ "Le WiFi du restaurant n'existe pas / ne fonctionne pas"

Si vous n'avez pas déjà un routeur WiFi, vous devez en configurer un.

#### Solution A: Point d'accès Windows (Hosted Network)

```powershell
# En PowerShell comme Administrateur:

# Créer le point d'accès
netsh wlan set hostednetwork mode=allow `
  ssid=RestaurantMenu `
  key=Mot123Pass

# Démarrer
netsh wlan start hostednetwork

# Vérifier le statut
netsh wlan show hostednetwork

# Arrêter (après)
netsh wlan stop hostednetwork
```

#### Solution B: Partage de connexion (Tethering)

Certains téléphones peuvent servir de point d'accès:
1. Paramètres > Partage de connexion
2. Activez le Hotspot
3. Connectez l'ordinateur serveur au Hotspot
4. Les autres téléphones se connectent au même Hotspot

#### Solution C: Routeur WiFi physique

Le plus fiable:
1. Connectez l'ordinateur serveur en Ethernet au routeur
2. Connectez les téléphones/tablettes en WiFi au routeur
3. Tous les appareils communiquent sur le même réseau local

---

### 4️⃣ "Erreur: CORS, Cross-Origin, etc."

CORS ne devrait pas être un problème sur réseau local, MAIS:

Si vous avez:
```
Access to XMLHttpRequest blocked by CORS policy
```

#### Solution:

Les CORS sont déjà permis pour le réseau local:
```javascript
// Dans server.js, c'est déjà configuré:
res.header('Access-Control-Allow-Origin', '*');
```

Cela signifie qu'une autre erreur est la cause. Vérifiez:

**A) La base de données n'est pas connectée**
```bash
# Vérifier PostgreSQL est en cours d'exécution
psql -h localhost -U postgres -c "SELECT version();"

# Si ça échoue, lancez PostgreSQL
# (Services Windows > PostgreSQL)
```

**B) Le serveur a crashé**
```bash
# Regardez les logs du serveur (terminal où npm start est lancé)
# Cherchez les erreurs en rouge
```

---

### 5️⃣ "La base de données n'existe pas / est vide"

#### Solution:

```bash
# Créer la base de données
psql -U postgres -c "CREATE DATABASE restaurant1_db;"

# Ajouter le schéma
psql -U postgres -d restaurant1_db -f "database\schema.sql"

# Ajouter des données de test (optionnel)
psql -U postgres -d restaurant1_db -f "backend\src\seedDB.js"
```

---

## 🔍 Diagnostic complet

Si aucune solution ne fonctionne, exécutez ceci:

```bash
# Script de diagnostic (créez un fichier diagnostic.bat):

@echo off
echo === DIAGNOSTIC RESTAURANT ===
echo.

echo [1] Vérifier Node.js:
node --version

echo [2] Vérifier npm:
npm --version

echo [3] Vérifier PostgreSQL:
psql --version

echo [4] Vérifier l'IP locale:
ipconfig | findstr "IPv4"

echo [5] Vérifier le port 5000:
netstat -ano | findstr :5000

echo [6] Tester la base de données:
psql -U postgres -c "SELECT version();"

echo [7] Vérifier les dépendances npm:
cd backend
npm list --depth=0
cd ..

echo === FIN DIAGNOSTIC ===
```

Enregistrez cet output et consultez le guide ou signalez les erreurs.

---

## 📋 Checklist de dépannage

Avant de conclure qu'il y a un problème:

- [ ] Le serveur est lancé et affiche l'IP locale
- [ ] Le téléphone est connecté au même WiFi
- [ ] L'adresse IP du serveur est correct (pas localhost)
- [ ] Le port 5000 est ouvert/pas en conflit
- [ ] PostgreSQL est lancé
- [ ] Les codes QR sont générés avec la bonne IP
- [ ] Le navigateur Web du téléphone fonctionne
- [ ] Windows Defender Firewall n'est pas un obstacle

---

## 🎯 Solution complète pas à pas

Si tout échoue, refaites partout:

### Étape 1: Arrêtez tout
```bash
# Fermer tous les terminals du serveur
# Ctrl+C sur tous les npm start
```

### Étape 2: Vérifiez les prérequis
```bash
node --version    # > 14.x
npm --version     # > 6.x
psql --version    # > 12.x
```

### Étape 3: Préparez la BD
```bash
# Créez la base de données fraîche
psql -U postgres -c "DROP DATABASE IF EXISTS restaurant1_db;"
psql -U postgres -c "CREATE DATABASE restaurant1_db;"
psql -U postgres -d restaurant1_db -f database\schema.sql
```

### Étape 4: Installez les dépendances
```bash
cd "c:\Users\Landry\Menu numerique"
npm install
```

### Étape 5: Lancez le serveur
```bash
npm start
# Notez l'adresse IP affichée
```

### Étape 6: Générez les QR codes
```bash
# Dans un NOUVEAU terminal:
cd backend
node scripts/generateQRCodes.js 10 --ip=192.168.1.5
# Remplacez par votre IP
```

### Étape 7: Testez
```
Sur le téléphone (MÊME WiFi):
http://192.168.1.5:5000/qr_setup
```

Si cela fonctionne, tout va bien!

---

## 📞 Logs importants

Collectez ces informations si ça ne fonctionne pas:

1. **Terminal du serveur** (tout ce qui s'affiche)
2. **Console du navigateur** (F12 > Console)
3. **Résultat de `ipconfig`**
4. **Résultat de `netstat -ano | findstr :5000`**
5. **Fichier `.env` backend** (utilisateurs + mots de passe sans les vraies valeurs)

---

## 🎯 Points clés à retenir

✅ **Tous les appareils doivent être sur le MÊME réseau WiFi**
✅ **L'adresse IP doit être une adresse interne** (192.168.x.x, 10.x.x.x)
✅ **Les codes QR doivent être générés avec la BONNE adresse IP**
✅ **PostgreSQL DOIT être lancé**
✅ **Le port 5000 doit être ouvert** (par-feu)
✅ **Pas d'Internet requis** après le démarrage initial du serveur
