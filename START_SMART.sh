#!/bin/bash

# Script de démarrage intelligent pour Menu Numérique (Linux/Mac)

clear
echo ""
echo "======================================================================"
echo "  Serveur Menu Numerique"
echo "======================================================================"
echo ""

# Afficher l'adresse IP
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    hostname -I
elif [[ "$OSTYPE" == "darwin"* ]]; then
    ifconfig | grep "inet " | grep -v 127.0.0.1
fi

echo ""
echo "⚠️  Si l'IP affichée n'est pas la bonne:"
echo ""
echo "1. Exécutez:   node detectIP.js"
echo "2. Copiez l'adresse IP correcte"
echo "3. Modifiez la variable ci-dessous:"
echo "   export SERVER_IP=192.168.1.5"
echo ""
read -p "Appuyez sur ENTREE pour continuer..."

# Vous pouvez spécifier une IP manuelle ici:
# export SERVER_IP=192.168.1.5

echo ""
read -p "Appuyez sur ENTREE pour démarrer le serveur..."
echo ""
echo "Démarrage en cours..."
echo ""

npm start
