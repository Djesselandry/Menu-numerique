# ⚡ Quick Start - Commandes à copier/coller

## 📋 Avant de commencer

Assurez-vous que:
- ✅ Node.js est installé (`node --version`)
- ✅ PostgreSQL est lancé (Services Windows)
- ✅ Vous avez un routeur WiFi ou point d'accès

---

## 🚀 Démarrage en 3 minutes

### 1️⃣ Lancez le serveur

Ouvrez PowerShell/CMD et exécutez:

```bash
cd "c:\Users\Landry\Menu numerique"
npm install
npm start
```

**Résultat attendu:**
```
📍 Adresse IP locale: 192.168.x.x
🌐 URL locale: http://192.168.x.x:5000
```

**⚠️ IMPORTANT:** Notez votre adresse IP (ex: 192.168.1.5)

---

### 2️⃣ Générez les codes QR

Ouvrez **UN AUTRE** terminal et exécutez:

```bash
cd "c:\Users\Landry\Menu numerique\backend"
node scripts/generateQRCodes.js 10
```

**Remplacez 192.168.1.5 par VOTRE adresse IP!**

```bash
# Exemple avec IP spécifique:
node scripts/generateQRCodes.js 10 --ip=192.168.1.5
```

**Résultat:** Fichiers créés
- `qr_codes.json` (données)
- `qr_codes.html` (à imprimer)

---

### 3️⃣ Testez immédiatement

**Sur n'importe quel navigateur** (même l'ordinateur serveur):

```
http://192.168.1.5:5000/qr_setup
```

(Remplacez 192.168.1.5 par votre IP)

**Vous devriez voir:**
- ✅ État du serveur: EN LIGNE
- ✅ Code QR de test (Table 1)
- ✅ URL pour accéder au client

---

## 📱 Tester avec un téléphone

### Sur le téléphone (MÊME WiFi):

**Option A - Scanner un QR code:**
```
Imprimez qr_codes.html
Scannez le code QR
```

**Option B - Accès direct:**
```
Ouvrez le navigateur
Tapez: http://192.168.1.5:5000/client/?qr=TABLE_1
```

Le menu doit s'afficher. ✅

---

### Tester une commande:

1. Sur le téléphone: Sélectionnez 2-3 plats
2. Cliquez "Commander"
3. Sur l'admin (`http://192.168.1.5:5000/admin`), la commande apparaît

**Succès!** 🎉

---

## 🎯 URLs principales

Remplacez `192.168.1.5` par VOTRE adresse IP:

```
Client:       http://192.168.1.5:5000/client
Client + QR:  http://192.168.1.5:5000/client/?qr=TABLE_1
Admin:        http://192.168.1.5:5000/admin
Config:       http://192.168.1.5:5000/qr_setup
API Config:   http://192.168.1.5:5000/api/config
```

---

## 🔧 Commandes utiles

### Arrêter le serveur
```bash
Ctrl+C (dans le terminal du serveur)
```

### Redémarrer le serveur
```bash
npm start
```

### Vérifier l'IP locale
```bash
ipconfig
# Chercher "IPv4 Address" sous votre WiFi adapter
```

### Régénérer les QR codes
```bash
cd backend
node scripts/generateQRCodes.js 5 --ip=192.168.1.5
```

### Vérifier la base de données
```bash
psql -U postgres -d restaurant1_db -c "SELECT * FROM tables;"
```

### Réinitialiser la base de données
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS restaurant1_db;"
psql -U postgres -c "CREATE DATABASE restaurant1_db;"
psql -U postgres -d restaurant1_db -f database\schema.sql
```

---

## 🐛 Dépannage rapide

### "Erreur: Cannot find module"
```bash
npm install
npm start
```

### "Erreur: port 5000 already in use"
```bash
netstat -ano | findstr :5000
# Terminez le processus ou changez le port dans .env
```

### "Impossible d'accéder depuis le téléphone"
```bash
1. Vérifiez que le téléphone et l'ordinateur sont sur le MÊME WiFi
2. Vérifiez l'adresse IP: ipconfig
3. Testez : http://IP:5000/qr_setup
4. Si toujours KO: voir AUDIT_CONNECTIVITE.md
```

### "La base de données n'existe pas"
```bash
# Créer + initialiser:
psql -U postgres -c "CREATE DATABASE restaurant1_db;"
psql -U postgres -d restaurant1_db -f database\schema.sql
```

---

## 💾 Sauvegarder vos données

```bash
# Sauvegarder la BD:
pg_dump -U postgres restaurant1_db > backup.sql

# Restaurer:
psql -U postgres restaurant1_db < backup.sql
```

---

## 📦 Scripts Windows GUI

Vous avez aussi des scripts interactifs:

```bash
# Option 1 - Batch (simple):
START.bat
# Menu avec options numérotées

# Option 2 - PowerShell (avancé):
.\START.ps1 -Command start
.\START.ps1 -Command qr -Tables 10
```

---

## 📊 Checklist avant la production

- [ ] Serveur fonctionne (`npm start`)
- [ ] IP locale affichée et notée
- [ ] PostgreSQL connecté
- [ ] Codes QR générés (`generateQRCodes.js`)
- [ ] Téléphone accès le serveur
- [ ] Première commande testée
- [ ] Admin reçoit la commande
- [ ] Base de données sauvegardée

---

## 🎯 Pour le resto

### Installation:
```bash
# 1. Sur l'ordinateur serveur:
cd "c:\Users\Landry\Menu numerique"
npm install
npm start

# 2. Générer QR codes:
cd backend
node scripts/generateQRCodes.js 10 --ip=VOTRE_IP_LOCALE

# 3. Imprimer qr_codes.html et plastifier
# 4. Coller sur les tables
# 5. Donner l'accès WiFi aux clients
```

### Utilisation quotidienne:
```bash
# Chaque jour:
npm start

# Les clients scannent les QR codes
# L'admin accès http://IP:5000/admin
# Les commandes arrivent en temps réel
```

---

## 📞 En cas d'urgence

Consultez:
1. **`GUIDE_RESEAU_LOCAL.md`** - Guide complet
2. **`AUDIT_CONNECTIVITE.md`** - Dépannage détaillé
3. **`README_RESEAU_LOCAL.md`** - Documentation générale

---

## ✨ Résumé en une ligne

```bash
npm start && cd backend && node scripts/generateQRCodes.js 10 --ip=YOUR_IP
```

C'est tout! 🚀
