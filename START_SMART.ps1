#!/usr/bin/env pwsh

# Script de démarrage intelligent pour Menu Numérique
# Détecte automatiquement l'IP réseau et démarre le serveur

Write-Host "`n" -ForegroundColor Cyan
Write-Host "=".PadRight(70, "=") -ForegroundColor Cyan
Write-Host "🚀 Serveur Menu Numérique" -ForegroundColor Cyan
Write-Host "=".PadRight(70, "=") -ForegroundColor Cyan
Write-Host ""

# Obtenir toutes les interfaces réseau
$interfaces = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne "127.0.0.1" }

if ($interfaces.Count -eq 0) {
    Write-Host "❌ Aucune interface réseau trouvée" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Interfaces réseau disponibles:`n" -ForegroundColor Yellow

$ips = @()
$counter = 1

foreach ($iface in $interfaces) {
    $interfaceName = $iface.InterfaceAlias
    $ipAddress = $iface.IPAddress
    
    Write-Host "   $counter. $interfaceName`: $ipAddress" -ForegroundColor Green
    
    $ips += @{
        Name = $interfaceName
        IP = $ipAddress
    }
    
    $counter++
}

Write-Host ""

# Si plusieurs IPs, laisser l'utilisateur choisir (optionnel)
if ($ips.Count -gt 1) {
    Write-Host "⚠️  Plusieurs interfaces trouvées" -ForegroundColor Yellow
    Write-Host "   (La première sera utilisée: $($ips[0].IP))"
    Write-Host ""
}

# Utiliser la première IP
$selectedIP = $ips[0].IP

Write-Host "✅ IP sélectionnée: $selectedIP`n" -ForegroundColor Green

# Démarrer le serveur avec cette IP
Write-Host "Démarrage du serveur..." -ForegroundColor Cyan
Write-Host ""

$env:SERVER_IP = $selectedIP
npm start

Write-Host "`n$('='.PadRight(70, '='))" -ForegroundColor Cyan
