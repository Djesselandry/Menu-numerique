# 🚀 Configuration Réseau - Menu Numérique

## ⚡ Démarrage Rapide

Votre serveur affiche la mauvaise IP réseau? **3 solutions rapides:**

---

## **Solution 1: Script Automatique (Recommandé)**

Choisissez selon votre système d'exploitation:

### Windows PowerShell
```powershell
.\START_SMART.ps1
```
- ✅ Détecte automatiquement toutes les IPs
- ✅ Affiche les choix
- ✅ Configure et démarre le serveur

### Windows Command Prompt
```cmd
START_SMART.bat
```
- ✅ Interface simple
- ✅ Affiche les configurations réseau
- ✅ Facile à modifier

### Linux ou Mac
```bash
chmod +x START_SMART.sh
./START_SMART.sh
```
- ✅ Détecte automatiquement l'IP
- ✅ Démarre le serveur

---

## **Solution 2: Configuration Manuelle**

### Étape 1: Identifier votre IP
```bash
node detectIP.js
```
Cela affiche TOUTES vos interfaces réseau. Cherchez:
- ✅ **WiFi** ou **Ethernet** (votre vraie IP)
- ❌ **VirtualBox**, **Docker**, **Loopback** (interfaces virtuelles)

### Étape 2: Démarrer avec cette IP

**PowerShell:**
```powershell
$env:SERVER_IP="192.168.1.100"
npm start
```

**Command Prompt (Windows):**
```cmd
SET SERVER_IP=192.168.1.100
npm start
```

**Linux/Mac:**
```bash
export SERVER_IP=192.168.1.100
npm start
```

---

## **Solution 3: Fichier de Configuration Permanente**

### Créez ou modifiez `.env`:
```
PORT=5000
NODE_ENV=development
SERVER_IP=192.168.1.100
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=menu_numerique
DB_PORT=5432
```

Puis simplement:
```bash
npm start
```

---

## ✅ Vérifier que ça fonctionne

Accédez à: `http://192.168.1.100:5000/qr_setup`

L'IP affichée en haut **doit correspondre** à celle que vous avez configurée.

---

## 🔧 Dépannage

### L'IP est toujours mauvaise?
1. Arrêtez le serveur (Ctrl+C)
2. Exécutez `node detectIP.js`
3. Vérifiez que vous utilisez la vraie IP (pas VirtualBox)
4. Redémarrez avec la bonne IP

### Le serveur ne démarre pas?
```bash
# Vérifiez le port 5000
# Windows: netstat -ano | findstr :5000
# Linux/Mac: lsof -i :5000

# Si occupé, changez le port dans `.env`:
# PORT=5001
```

### QR codes ne fonctionnent pas?
1. Scannez le QR avec votre téléphone
2. Le téléphone doit être sur **le même réseau WiFi**
3. L'IP du QR doit matcher celle du serveur

---

## 📱 Utilisation sur Téléphone

1. Connectez-vous au WiFi du serveur
2. Accédez à: `http://192.168.1.100:5000`
3. Choisissez:
   - **Admin** pour gérer les menus
   - **Client** pour commander via QR

---

## 🔄 Problème: IP change à chaque redémarrage?

C'est **normal** si vous n'avez pas configuré `SERVER_IP`. Une fois configuré, il reste stable.

---

## 📋 Récapitulatif des Fichiers

| Fichier | Utilité | Utilisation |
|---------|---------|------------|
| `detectIP.js` | Voir toutes les interfaces | `node detectIP.js` |
| `.env` | Configuration permanente | Créez/modifiez avec votre IP |
| `START_SMART.ps1` | Démarrage automatique (PowerShell) | `.\START_SMART.ps1` |
| `START_SMART.bat` | Démarrage automatique (CMD) | `START_SMART.bat` |
| `START_SMART.sh` | Démarrage automatique (Linux/Mac) | `./START_SMART.sh` |
| `FIX_IP_ADDRESS.md` | Guide détaillé | Reference complète |

---

## 🎯 Votre Configuration

**En résumé, vous devez:**
1. Trouver votre vraie IP WiFi/Ethernet
2. Configurer le serveur avec cette IP
3. Vérifier que qr_setup affiche la bonne IP
4. C'est tout! 🎉

**Questions?** Consultez `FIX_IP_ADDRESS.md` pour plus de détails.
