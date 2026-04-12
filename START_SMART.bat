@echo off
REM Script de démarrage intelligent pour Menu Numérique (Windows CMD)

cls
echo.
echo ======================================================================
echo  Serveur Menu Numerique
echo ======================================================================
echo.

REM Afficher les informations réseau
ipconfig | findstr /R "IPv4 Address"

echo.
echo ^! Si l'IP affichee n'est pas la bonne:
echo.
echo 1. Executez:   node detectIP.js
echo 2. Copiez l'adresse IP correcte
echo 3. Modifiez cette ligne:
echo    SET SERVER_IP=192.168.1.5
echo.
echo Sinon, appuyez sur ENTREE pour continuer...
pause

REM Vous pouvez spécifier une IP manuelle ici:
REM SET SERVER_IP=192.168.1.5

echo.
echo Appuyez sur ENTREE pour demarrer le serveur...
pause

echo.
echo Demarrage en cours...
echo.

npm start

pause
