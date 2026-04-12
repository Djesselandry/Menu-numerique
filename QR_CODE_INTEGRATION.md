# Intégration du Système de Code QR

## Vue d'ensemble

Le système de code QR remplace le numéro de table manuel. Au lieu d'entrer manuellement le numéro de table, le client scanne un code QR sur sa table pour accéder directement à l'interface de commande.

## Processus de flux

```
1. Code QR généré → Affiche l'URL client avec ?qr=TABLE_X
                  ↓
2. Client scanne le code QR
                  ↓
3. Interface web s'ouvre automatiquement avec le code QR
                  ↓
4. Client voit le menu et passe une commande
                  ↓
5. Clique sur "Commander"
                  ↓
6. Le système envoie automatiquement le code QR
                  ↓
7. Admin reçoit la commande avec le numéro de table
```

## Endpoints API

### Générer un code QR pour une table
```http
POST /api/tables/:tableNumber/generate-qr
```

**Exemple:**
```bash
curl -X POST http://localhost:5000/api/tables/1/generate-qr
```

**Réponse:**
```json
{
  "success": true,
  "table": {
    "id": 1,
    "table_number": 1,
    "qr_code": "TABLE_1"
  },
  "qrUrl": "http://localhost:5000/client/?qr=TABLE_1"
}
```

### Récupérer toutes les tables avec leurs codes QR
```http
GET /api/tables
```

**Réponse:**
```json
[
  {
    "id": 1,
    "table_number": 1,
    "qr_code": "TABLE_1"
  },
  {
    "id": 2,
    "table_number": 2,
    "qr_code": "TABLE_2"
  }
]
```

### Récupérer une table par numéro
```http
GET /api/tables/:tableNumber
```

### Récupérer une table par code QR
```http
GET /api/tables/qr/:qrCode
```

## URL Client avec Code QR

Format: `http://votre-domaine/client/?qr=TABLE_X`

Exemples:
- `http://localhost:5000/client/?qr=TABLE_1`
- `http://restaurant.com/client/?qr=TABLE_5`

## Modifications apportées

### Frontend (frontend/client/app.js)

1. **Ajout de variables globales:**
   - `currentQRCode`: Stocke le code QR du client
   - `initializeFromQR()`: Extrait le code QR de l'URL au chargement

2. **Fonction `handleOrder()`:**
   - Si `currentQRCode` est défini, soumet directement la commande
   - Sinon, affiche le modal du numéro de table (comportement par défaut)

3. **Fonction `submitOrder()`:**
   - Accepte soit un `qrCode`, soit un `tableNumber`
   - Envoie les données appropriées au serveur

### Backend (backend/src/models/orderModel.js)

La fonction `createOrder()` a été modifiée pour:
- Accepter un paramètre `qrCode` en plus du `tableNumber`
- Si `qrCode` est fourni, le chercher dans la base de données
- Récupérer automatiquement le numéro de table depuis le code QR

### Nouveaux fichiers créés

1. **backend/src/models/tableModel.js** - Modèle pour gérer les tables et codes QR
2. **backend/src/controller/tableController.js** - Contrôleur pour les opérations sur les tables
3. **backend/src/routes/tableRoutes.js** - Routes API pour les tables

## Configuration de la base de données

La table `tables` doit avoir une colonne `qr_code` (déjà présente dans votre schéma):

```sql
CREATE TABLE IF NOT EXISTS tables (
  id SERIAL PRIMARY KEY,
  table_number INT NOT NULL UNIQUE,
  qr_code TEXT
);
```

## Génération des codes QR (à faire)

Pour générer des vrai codes QR à imprimer:
1. Appelez `/api/tables/:tableNumber/generate-qr` pour chaque table
2. Récupérez l'`qrUrl` retournée
3. Utilisez un service de génération de code QR (ex: `qrserver.com`) pour générer le code QR visuel
4. Imprimez et placez les codes QR sur les tables

**Exemple avec qrserver.com:**
```
https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=http://localhost:5000/client/?qr=TABLE_1
```

## Flux de commande avec code QR

**Request POST /api/orders:**
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

**Alternative (sans code QR, mode manuel):**
```json
{
  "tableNumber": 1,
  "items": [...]
}
```

## Compatibilité rétroactive

Le système **conserve la compatibilité** avec le système manuel:
- Les clients sans code QR peuvent toujours entrer manuellement leur numéro de table
- Les clients avec code QR vont passer directement, sans modal
- L'admin reçoit les commandes avec le numéro de table (que ce soit via QR ou manuel)

## Notes importantes

1. Le code QR n'a pas besoin d'être ultra-complexe - c'est juste un lien URL
2. Les codes QR peuvent être générés simplement via l'API au format `TABLE_X`
3. Si un client scanne le même code QR deux fois, il obtiendra la même table
4. Le système crée automatiquement les tables s'il y a un nouveau code QR non reconnu
