# 🚀 Guide Rapide - Utiliser les Codes QR Dynamiques

## Situation du Restaurant

Vous avez **10 tables** et vous voulez que chaque client puisse:
1. Scanner un code QR unique à sa table
2. Accéder au menu sans Internet
3. Passer sa commande

## Mise en Place Initiale (5 min)

### Étape 1: Démarrer le serveur
```bash
cd "c:\Users\Landry\Menu numerique"
npm start
```

Vous verrez:
```
✅ Server running     
✅ Database connected
✅ ListeningLocal IP : 192.168.1.5
✅ Access at: http://192.168.1.5:5000
```

### Étape 2: Accéder à la page des codes QR
Ouvrez dans votre navigateur:
```
http://192.168.1.5:5000/qr_setup
```

Vous verrez:
- ✅ L'IP de votre serveur (192.168.1.5)
- ✅ L'URL complète (http://192.168.1.5:5000)
- ✅ Une grille de 10 codes QR (Table 1-10)

### Étape 3: Imprimer les codes QR
```bash
# Option 1: Via navigateur
1. Allez à http://192.168.1.5:5000/qr_setup
2. Cliquez sur "Imprimer" (Ctrl+P)
3. Imprimez la page

# Option 2: Télécharger les images individuelles
# Clic droit sur un QR → Enregistrer l'image
```

### Étape 4: Numéroter les tables
Placez un code QR par table avec le numéro
```
Table 1 → CODE QR TABLE_1
Table 2 → CODE QR TABLE_2
...
Table 10 → CODE QR TABLE_10
```

## Utilisation en Service

### Du côté **Client**

1. **Client arrive à la table et voit le code QR**
```
┌─────────────────┐
│   [QR CODE]     │
│   Scannez moi   │
│   Table 3       │
└─────────────────┘
```

2. **Client scanne avec son téléphone**
   - Utilise l'app caméra native (iPhone) ou Google Lens (Android)
   - Accède à: `http://192.168.1.5:5000/client/?qr=TABLE_3`

3. **Interface du menu s'ouvre**
   - Aucun Internet requis
   - Toutes les images chargées localement
   - Peut parcourir le menu complètement

4. **Client passe sa commande**
   - Sélectionne les articles
   - Clique sur "Passer la commande"
   - Confirmation affichée

### Du côté **Admin**

1. **Ouvrir le panel admin**
```
http://192.168.1.5:5000/admin
```

2. **Voir les commandes en temps réel**
   - Table 3 → Menu item 1, Menu item 2
   - Table 5 → Menu item 3
   - ...

3. **Gérer les commandes**
   - Marquer comme "En préparation"
   - Marquer comme "Prête"
   - Notifications à la table

## Que faire si...

### L'IP change (le router redémarre)

**Ancien IP:** 192.168.1.5
**Nouvelle IP:** 192.168.1.10

❌ **Avant (Mauvais):** Les codes QR imprimés ne fonctionnent plus

✅ **Maintenant (Correct):** 
1. Allez à http://192.168.1.10:5000/qr_setup
2. Les codes QR affichent AUTOMATIQUEMENT la nouvelle IP
3. Les clients peuvent regénérer les codes

### Un client ne peut pas accéder au menu

**Checklist:**
1. ✅ Client connecte au WiFi du restaurant?
2. ✅ IP du serveur correcte? (Vérifiez qr_setup)
3. ✅ Serveur toujours en ligne? (Vérifiez la console)
4. ✅ Pare-feu bloque le port 5000?

**Si problème persiste:**
```
Accédez directement (sans QR):
http://[IP_DU_SERVEUR]:5000/client/?qr=TABLE_2
```

### Ajouter plus de tables

Les codes QR sont générés pour 10 tables par défaut.

**Pour 15 tables:**
1. Ouvrez `qr_setup.html`
2. Modifiez: `for (let i = 1; i <= 15; i++)`
3. Enregistrez et rechargez la page

**Pour 5 tables** (réduire):
1. Modifiez: `for (let i = 1; i <= 5; i++)`
2. Enregistrez et rechargez

### Serveur s'arrête accidentellement

```bash
# 1. Redémarrez
npm start

# 2. Vérifiez la page setup
http://192.168.1.5:5000/qr_setup

# 3. Les codes QR reviennent immédiatement
```

## Architecture Réseau

```
                    [WiFi Router]
                          |
        __________________+__________________
        |                                    |
    📱 Téléphones Clients            🖥️ Serveur Restaurant
     (Table 1-10)                    (192.168.1.5:5000)
        |                                    |
        └─── Scannent QR ──→ accès menu  ←──+
        └─── Passent commande ──────→  Admin
        ←─── Notifications temps réel ─←
```

## Checklist Avant le Service

- [ ] Serveur démarré et en ligne
- [ ] IP correcte affichée dans qr_setup
- [ ] Codes QR imprimés et placés sur les tables
- [ ] Accès WiFi disponible et fonctionnelle
- [ ] Panel admin accessible
- [ ] Test avec un client: scanner → passer commande

## Fichiers Importants

```
c:\Users\Landry\Menu numerique\
├── backend/src/
│   ├── server.js                    # Serveur Express
│   ├── controller/tableController.js # Gestion des QR
│   └── routes/tableRoutes.js        # API des QR
├── frontend/client/
│   ├── qr_setup.html               # Page codes QR 🔥 NOUVEAU
│   ├── app.js                      # Interface client
│   └── index.html
├── frontend/admin/
│   ├── app.js                      # Interface admin
│   └── index.html
└── DYNAMIC_IP_SOLUTION.md          # Documentation complète
```

## Exemples Réels

### Exemple 1: Restaurant Paris 15e

```
IP du serveur: 192.168.1.15
URL codes QR: http://192.168.1.15:5000/qr_setup
20 tables? Modifiez qr_setup.html → for (i <= 20)
Router redémarre à midi? 
  → Nouvelle IP: 192.168.1.20
  → Accédez à: http://192.168.1.20:5000/qr_setup
  → Codes QR affichent automatiquement nouvelle IP ✅
```

### Exemple 2: Foodtruck ou catering mobile

```
Lieu A: 192.168.1.100 (mercredi soir)
Lieu B: 192.168.50.10 (les autres soirs)

Solution dynamique:
1. Démarrez le serveur n'importe où
2. Récupérez l'IP locale
3. Accédez à http://[NEW_IP]:5000/qr_setup
4. Les codes QR s'adaprent AUTOMATIQUEMENT ✅
5. Aucune réaction de fichier figé
6. Aucune régénération manuelle
```

### Exemple 3: Réseau instable

```
WiFi réinitialise 2x par jour
IP change: 192.168.1.5 → 192.168.1.120 → 192.168.1.5

Système dynamique:
- Clients scannent QR → détectent IP actuelle
- Admin accède à panel → détecte IP actuelle
- Aucun code QR ne casse
- Zéro maintenance 🎉
```

## Support & Dépannage

### Logs du serveur
```
Console du serveur vous montre:
✅ Nouvelle connexion client
✅ Commande reçue  
❌ Erreur de connexion
```

### Vérifier l'API
```bash
# Depuis votre ordinateur:
curl http://192.168.1.5:5000/api/config

# Réponse attendue:
{
  "api_url": "http://192.168.1.5:5000",
  "local_ip": "192.168.1.5",
  "port": 5000
}
```

### Tester un QR dynamique
```bash
curl http://192.168.1.5:5000/api/tables/dynamic-qr/5

# Montre l'URL exacte du code QR pour Table 5
```

## Questions Fréquentes

**Q: Les codes QR imprimés expirent-ils?**
R: Non! Ils pointent vers l'IP actuelle, jamais figés.

**Q: Puis-je utiliser un hostname à la place de l'IP?**
R: Oui, mais nécessite mDNS (avancé). Pour la plupart des restaurants, l'IP suffit.

**Q: Combien de clients maximum?**
R: ~50 sur le même WiFi. Pour plus, utilisez un router pro.

**Q: Et si le WiFi se coupe?**
R: Les clients connectés perdent l'accès. Le WiFi se rétablit = tout redevient normal.

**Q: Besoin d'Internet pour le serveur?**
R: Non! Fonc100% en mode hors-ligne local.

---

**🎉 Système opérationnel! Bon service!**

Pour des questions avancées, voir: `DYNAMIC_IP_SOLUTION.md`
