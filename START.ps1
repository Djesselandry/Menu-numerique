#!/usr/bin/env powershell
<#
.SYNOPSIS
    Utilitaire de gestion du serveur Restaurant Menu Numérique
.DESCRIPTION
    Script PowerShell pour démarrer, configurer et gérer le système
.USAGE
    .\START.ps1
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("start", "qr", "setup", "admin", "help")]
    [string]$Command,
    
    [Parameter(Mandatory=$false)]
    [int]$Tables = 10
)

# Configuration des couleurs
$Colors = @{
    Green = 'Green'
    Yellow = 'Yellow'
    Red = 'Red'
    Cyan = 'Cyan'
    White = 'White'
}

function Write-Header {
    param([string]$Text)
    Write-Host "`n" -NoNewline
    Write-Host "=" * 70 -ForegroundColor $Colors.Cyan
    Write-Host "  $Text" -ForegroundColor $Colors.Cyan
    Write-Host "=" * 70 -ForegroundColor $Colors.Cyan
    Write-Host
}

function Write-Step {
    param([string]$Text, [int]$Step)
    Write-Host "[$Step] " -ForegroundColor $Colors.Cyan -NoNewline
    Write-Host $Text -ForegroundColor $Colors.White
}

function Write-Success {
    param([string]$Text)
    Write-Host "✓ " -ForegroundColor $Colors.Green -NoNewline
    Write-Host $Text -ForegroundColor $Colors.Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "✗ " -ForegroundColor $Colors.Red -NoNewline
    Write-Host $Text -ForegroundColor $Colors.Red
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠ " -ForegroundColor $Colors.Yellow -NoNewline
    Write-Host $Text -ForegroundColor $Colors.Yellow
}

function Get-LocalIP {
    $IP = (Get-NetIPAddress -AddressFamily IPv4 -Type Unicast | 
           Where-Object { $_.InterfaceAlias -notlike "*Loopback*" } | 
           Select-Object -First 1 -ExpandProperty IPAddress)
    return $IP -replace '\s+', ''
}

function Test-Prerequisites {
    Write-Header "Vérification des prérequis"
    
    # Vérifier Node.js
    Write-Step "Recherche de Node.js..." 1
    $node = Get-Command node -ErrorAction SilentlyContinue
    if ($null -eq $node) {
        Write-Error "Node.js n'est pas installé"
        Write-Host "Téléchargez depuis: https://nodejs.org" -ForegroundColor Yellow
        return $false
    }
    $nodeVersion = node --version
    Write-Success "Node.js $nodeVersion trouvé"
    
    # Vérifier PostgreSQL
    Write-Step "Recherche de PostgreSQL..." 2
    $psql = Get-Command psql -ErrorAction SilentlyContinue
    if ($null -eq $psql) {
        Write-Error "PostgreSQL n'est pas installé"
        Write-Host "Téléchargez depuis: https://www.postgresql.org" -ForegroundColor Yellow
        return $false
    }
    Write-Success "PostgreSQL trouvé"
    
    # Vérifier le répertoire du projet
    Write-Step "Vérification du répertoire du projet..." 3
    if (-not (Test-Path "c:\Users\Landry\Menu numerique")) {
        Write-Error "Le répertoire du projet n'existe pas"
        return $false
    }
    Write-Success "Répertoire du projet trouvé"
    
    return $true
}

function Start-Server {
    Write-Header "Démarrage du serveur"
    
    $projectPath = "c:\Users\Landry\Menu numerique"
    Set-Location $projectPath
    
    # Obtenir l'IP locale
    $localIP = Get-LocalIP
    Write-Step "Votre adresse IP locale:" 1
    Write-Host "   $localIP" -ForegroundColor $Colors.Cyan
    
    Write-Step "Installation des dépendances..." 2
    npm install | Out-Host
    
    Write-Success "Démarrage du serveur..."
    Write-Host "`nAccédez au serveur sur: http://$localIP`:5000" -ForegroundColor $Colors.Green
    Write-Host "Admin: http://$localIP`:5000/admin`n" -ForegroundColor $Colors.Green
    
    npm start | Out-Host
}

function Generate-QRCodes {
    Write-Header "Génération des codes QR"
    
    $projectPath = "c:\Users\Landry\Menu numerique"
    Set-Location $projectPath
    
    $localIP = Get-LocalIP
    
    Write-Step "Adresse IP: $localIP" 1
    Write-Step "Nombre de tables: $Tables" 2
    Write-Step "Génération des codes QR..." 3
    Write-Host
    
    Set-Location "backend"
    $command = "node scripts/generateQRCodes.js $Tables --ip=$localIP"
    Write-Host $command -ForegroundColor $Colors.Cyan
    Write-Host
    
    Invoke-Expression $command
    
    Write-Host
    Write-Success "Codes QR générés avec succès"
    Write-Host "`nFichiers créés:" -ForegroundColor $Colors.Green
    Write-Host "  - qr_codes.json (données)"
    Write-Host "  - qr_codes.html (à imprimer)"
    Write-Host
    
    Set-Location ..
}

function Open-Setup {
    Write-Header "Portail de configuration"
    
    $localIP = Get-LocalIP
    $url = "http://$localIP`:5000/qr_setup"
    
    Write-Host "Ouverture de: $url`n" -ForegroundColor $Colors.Green
    Start-Process $url
    
    Write-Host "Attendez quelques secondes pour que la page s'ouvre..."
}

function Open-Admin {
    Write-Header "Interface Admin"
    
    $localIP = Get-LocalIP
    $url = "http://$localIP`:5000/admin"
    
    Write-Host "Ouverture de: $url`n" -ForegroundColor $Colors.Green
    Start-Process $url
    
    Write-Host "Attendez quelques secondes pour que la page s'ouvre..."
}

function Show-Help {
    Write-Header "Aide - Quick Start"
    
    Write-Host @"
📚 GUIDE DE DÉMARRAGE RAPIDE

1️⃣  PREMIER DÉMARRAGE:
   PowerShell> .\START.ps1 -Command start
   Ou double-cliquez sur START.bat

2️⃣  L'adresse IP locale sera affichée (ex: 192.168.1.5)
   Notez-la!

3️⃣  GÉNÉRER LES CODES QR:
   PowerShell> .\START.ps1 -Command qr -Tables 10
   
   Cela créera un fichier qr_codes.html à imprimer

4️⃣  ACCÉDER DU SERVEUR:
   🔧 Setup: http://IP_LOCALE:5000/qr_setup
   📱 Client: http://IP_LOCALE:5000/client
   👨‍💼 Admin: http://IP_LOCALE:5000/admin

5️⃣  SUR LES TÉLÉPHONES/TABLETTES:
   - Connectez-vous au WiFi du restaurant
   - Scannez un code QR
   - Le menu s'affiche automatiquement
   - Commandez sans Internet!

📖 DOCUMENTATION:
   Consultez GUIDE_RESEAU_LOCAL.md pour plus de détails

"@ -ForegroundColor $Colors.White
}

function Show-Menu {
    Clear-Host
    Write-Header "Restaurant - Menu Numérique"
    
    Write-Host @"
  1. 🚀 Démarrer le serveur
  2. 🎯 Générer les codes QR
  3. ⚙️  Ouvrir le portail de configuration  
  4. 👨‍💼 Ouvrir l'interface admin
  5. 📖 Afficher l'aide
  0. ❌ Quitter

" -ForegroundColor $Colors.White
    
    return (Read-Host "Sélectionnez une option (0-5)").Trim()
}

# Programme principal
if ($Command) {
    # Mode ligne de commande
    switch ($Command) {
        "start" { Start-Server }
        "qr" { Generate-QRCodes }
        "setup" { Open-Setup }
        "admin" { Open-Admin }
        "help" { Show-Help }
        default { Show-Help }
    }
} else {
    # Mode interactif
    if (-not (Test-Prerequisites)) {
        Write-Error "`nVeuillez installer les prérequis avant de continuer."
        Read-Host "Appuyez sur Entrée pour quitter"
        exit 1
    }
    
    do {
        $choice = Show-Menu
        
        switch ($choice) {
            "1" { Start-Server }
            "2" { Generate-QRCodes }
            "3" { Open-Setup }
            "4" { Open-Admin }
            "5" { Show-Help; Read-Host "Appuyez sur Entrée pour continuer" }
            "0" { Write-Host "`nAu revoir!" -ForegroundColor Green; break }
            default { Write-Warning "Option invalide" }
        }
        
        if ($choice -ne "0") {
            Read-Host "`nAppuyez sur Entrée pour continuer"
        }
    } while ($choice -ne "0")
}
