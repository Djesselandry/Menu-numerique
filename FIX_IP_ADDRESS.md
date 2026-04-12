# 🔧 Guide de Configuration - Problème d'Adresse IP

Si l'adresse IP affichée n'est pas la bonne (ex: 192.168.10.1 au lieu de celle de votre WiFi), suivez ce guide.

## 🔍 Étape 1: Trouver la Bonne Adresse IP

Exécutez le script de détection:
```bash
node detectIP.js
```

Cela affichera **toutes les interfaces réseau disponibles** avec leurs adresses IP.

### Exemple de résultat:
```
📡 Interface: WiFi
   🔹 IPv4: 192.168.1.100
      ✓ Cette IP peut être utilisée!

📡 Interface: VirtualBox
   🔹 IPv4: 192.168.10.1
      (interface virtuelle - à ignorer)

📡 Interface: Ethernet  
   🔹 IPv4: 10.0.0.5
      ✓ Cette IP peut être utilisée!
```

**Cherchez l'interface qui correspond à votre connexion réseau:**
- WiFi? → Cherchez "WiFi", "WLAN", "wlan0"
- Ethernet? → Cherchez "Ethernet", "eth0"
- Autre? → Cherchez "en0", "en1", "bond0"

## ✅ Étape 2: Utiliser la Bonne IP

Vous avez 3 options:

### Option 1: Via Variable d'Environnement (Recommandé)

**Windows (PowerShell):**
```powershell
$env:SERVER_IP="192.168.1.100"
npm start
```

**Windows (Command Prompt):**
```cmd
SET SERVER_IP=192.168.1.100
npm start
```

**Linux/Mac:**
```bash
SERVER_IP=192.168.1.100 npm start
```

### Option 2: Via Fichier .env

1. Créez un fichier `.env` à la racine du projet (ou copiez `.env.example` et renommez-le)
2. Ajoutez la ligne:
```
SERVER_IP=192.168.1.100
```
3. Démarrez normalement:
```bash
npm start
```

### Option 3: Script Batch (Windows)

Créez un fichier `START_WITH_IP.bat`:
```batch
@echo off
SET SERVER_IP=192.168.1.100
npm start
```

Puis double-cliquez sur ce fichier pour démarrer.

## 🧪 Étape 3: Vérifier

1. Démarrez le serveur avec la bonne IP
2. Vous devriez voir:
```
📍 Adresse IP locale: 192.168.1.100
```

3. Accédez à:
```
http://192.168.1.100:5000/qr_setup
```

4. L'adresse IP affichée sur la page doit matcher!

## 🔄 Étape 4: Test du Changement Réseau

Si vous changez de réseau (redémarrage router, changement WiFi):

1. **Sans spécifier SERVER_IP:** L'IP auto-détectée changera (peut être mauvaise)
2. **Avec SERVER_IP défini:** L'IP reste celle que vous avez spécifiée

Pour tester avec changement réseau automatique, **ne spécifiez pas SERVER_IP** et laissez l'auto-détection faire le travail.

## ❓ Dépannage

### "Toujours la mauvaise IP"

1. Exécutez `node detectIP.js`
2. Identifiez quelle interface vous utilisez réellement
3. Définissez `SERVER_IP` à cette adresse IP

### "Plusieurs IPs possibles"

Si vous avez plusieurs interfaces (ex: WiFi + Ethernet):
- Testez chaque IP avec votre téléphone
- Utilisez celle qui fonctionne

### "L'IP change souvent"

C'est normal - votre router peut attribuer des IPs différentes.
- Solution: Configurez une IP statique sur votre appareil
- Ou: Utilisez mDNS (localhost.local) - voir `.env.example`

## 📝 Résumé Rapide

```bash
# 1. Trouver la bonne IP
node detectIP.js

# 2. Démarrer avec cette IP (Windows)
SET SERVER_IP=192.168.1.100 && npm start

# 3. Vérifier
http://192.168.1.100:5000/qr_setup
```

---

**La page qr_setup doit afficher la même IP que vous utilisez pour y accéder!** ✅
