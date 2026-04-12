@echo off
REM Script de démarrage du système Restaurant - Réseau Local
REM Lancez ce fichier pour démarrer le serveur

setlocal enabledelayedexpansion

REM Couleurs
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "RESET=[0m"

cls
echo.
echo ===============================================================
echo    DEMARRAGE DU SYSTEME - RESTAURANT MENU NUMERIQUE
echo ===============================================================
echo.

REM Vérifier Node.js
echo %YELLOW%[1/3] Vérification de Node.js...%RESET%
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo %RED%ERREUR: Node.js n'est pas installé%RESET%
    echo Téléchargez-le depuis: https://nodejs.org
    pause
    exit /b 1
)
set /p NODE_VERSION=< <(node --version)
echo %GREEN%✓ Node.js %NODE_VERSION% trouvé%RESET%
echo.

REM Vérifier PostgreSQL
echo %YELLOW%[2/3] Vérification de PostgreSQL...%RESET%
where psql >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo %RED%ERREUR: PostgreSQL n'est pas installé%RESET%
    echo Téléchargez-le depuis: https://www.postgresql.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('psql --version') do set PG_VERSION=%%i
echo %GREEN%✓ %PG_VERSION%

 trouvé%RESET%
echo.

REM Aller au répertoire du projet
echo %YELLOW%[3/3] Préparation du projet...%RESET%
cd /d "c:\Users\Landry\Menu numerique"
if %ERRORLEVEL% neq 0 (
    echo %RED%ERREUR: Le répertoire du projet n'existe pas%RESET%
    pause
    exit /b 1
)
echo %GREEN%✓ Répertoire du projet trouvé%RESET%
echo.

REM Afficher les menus disponibles
:MENU
cls
echo.
echo ===============================================================
echo    MENU PRINCIPAL - RESTAURANT MENU NUMERIQUE
echo ===============================================================
echo.
echo  1. Démarrer le serveur (Lance le backend)
echo  2. Générér les codes QR (Crée les codes QR pour les tables)
echo  3. Voir le portail de configuration (Ouvre la page de setup)
echo  4. Ouvrir l'interface admin (Ouvre le dashboard)
echo  5. Consulter le guide (Affiche GUIDE_RESEAU_LOCAL.md)
echo  6. Plus d'options >>
echo  0. Quitter
echo.
set /p CHOICE=Sélectionnez une option (0-6): 

if "%CHOICE%"=="1" goto START_SERVER
if "%CHOICE%"=="2" goto GENERATE_QR
if "%CHOICE%"=="3" goto OPEN_SETUP
if "%CHOICE%"=="4" goto OPEN_ADMIN
if "%CHOICE%"=="5" goto VIEW_GUIDE
if "%CHOICE%"=="6" goto MORE_OPTIONS
if "%CHOICE%"=="0" exit /b 0
goto MENU

REM ========================================
REM OPTION 1: Démarrer le serveur
REM ========================================
:START_SERVER
cls
echo.
echo ===============================================================
echo    DEMARRAGE DU SERVEUR
echo ===============================================================
echo.
echo %YELLOW%Vérification des dépendances (npm install)...%RESET%
call npm install >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo %RED%ERREUR: Impossible d'installer les dépendances%RESET%
    pause
    goto MENU
)
echo %GREEN%✓ Dépendances installées%RESET%
echo.

echo %YELLOW%Démarrage du serveur...%RESET%
echo %GREEN%Le serveur devrait afficher l'adresse IP locale.%RESET%
echo %GREEN%Notez cette adresse (ex: 192.168.x.x)%RESET%
echo.

REM Démarrer le serveur
call npm start
pause
goto MENU

REM ========================================
REM OPTION 2: Générer les codes QR
REM ========================================
:GENERATE_QR
cls
echo.
echo ===============================================================
echo    GENERATION DES CODES QR
echo ===============================================================
echo.
echo Combien de tables voulez-vous? (défaut: 10)
set /p NUM_TABLES=Nombre de tables: 
if "%NUM_TABLES%"=="" set NUM_TABLES=10

echo.
echo %YELLOW%Éte vous en train de générer les codes QR pour %NUM_TABLES% tables...%RESET%
echo Assurez-vous que le serveur est lancé!
echo.

cd backend
call node scripts/generateQRCodes.js %NUM_TABLES%
pause
cd ..
goto MENU

REM ========================================
REM OPTION 3: Ouvrir le portail de configuration
REM ========================================
:OPEN_SETUP
cls
echo.
echo %YELLOW%Ouverture du portail de configuration...%RESET%
echo http://localhost:5000/qr_setup
echo.
start http://localhost:5000/qr_setup
timeout /t 2
goto MENU

REM ========================================
REM OPTION 4: Ouvrir l'interface admin
REM ========================================
:OPEN_ADMIN
cls
echo.
echo %YELLOW%Ouverture de l'interface admin...%RESET%
echo http://localhost:5000/admin
echo.
start http://localhost:5000/admin
timeout /t 2
goto MENU

REM ========================================
REM OPTION 5: Voir le guide
REM ========================================
:VIEW_GUIDE
if exist "GUIDE_RESEAU_LOCAL.md" (
    start "" "GUIDE_RESEAU_LOCAL.md"
) else (
    echo %RED%Le fichier GUIDE_RESEAU_LOCAL.md n'existe pas%RESET%
    pause
)
goto MENU

REM ========================================
REM OPTION 6: Plus d'options
REM ========================================
:MORE_OPTIONS
cls
echo.
echo ===============================================================
echo    OPTIONS SUPPLÉMENTAIRES
echo ===============================================================
echo.
echo  1. Voir les logs du serveur en direct
echo  2. Vérifier la base de données PostgreSQL
echo  3. Ouvrir l'explorateur de fichiers
echo  4. Consulter l'aide
echo  5. Retour au menu principal
echo.
set /p CHOICE2=Choisissez (1-5): 

if "%CHOICE2%"=="1" goto VIEW_LOGS
if "%CHOICE2%"=="2" goto CHECK_DB
if "%CHOICE2%"=="3" goto OPEN_EXPLORER
if "%CHOICE2%"=="4" goto HELP
if "%CHOICE2%"=="5" goto MENU
goto MORE_OPTIONS

:VIEW_LOGS
echo %YELLOW%Les logs s'affichent en direct ci-dessous...%RESET%
call npm start
pause
goto MENU

:CHECK_DB
echo %YELLOW%Vérification de la connexion PostgreSQL...%RESET%
REM Cette partie nécessite les identifiants de la BD configurés
echo Utilisateur: %DB_USER%
echo Hôte: %DB_HOST%
psql -h localhost -U postgres -c "SELECT version();"
pause
goto MORE_OPTIONS

:OPEN_EXPLORER
start explorer.exe .
goto MORE_OPTIONS

:HELP
echo.
echo ===============================================================
echo    AIDE - QUICK START
echo ===============================================================
echo.
echo 1. PREMIER DÉMARRAGE:
echo    - Cliquez sur "1. Démarrer le serveur"
echo    - Le serveur affichera votre IP locale (ex: 192.168.x.x)
echo    - Gardez ce terminal ouvert
echo.
echo 2. GÉNÉRER LES CODES QR:
echo    - Dans un AUTRE terminal, lancez ce script à nouveau
echo    - Cliquez sur "2. Générer les codes QR"
echo    - Entrez le nombre de tables (ex: 10)
echo.
echo 3. ACCÉDER AU SYSTÈME:
echo    - Client: http://IP_LOCALE:5000/client
echo    - Admin: http://IP_LOCALE:5000/admin
echo    - Setup: http://IP_LOCALE:5000/qr_setup
echo.
echo 4. SUR LES TÉLÉPHONES:
echo    - Connectez-vous au WiFi du restaurant
echo    - Scannez un code QR
echo    - L'interface du menu s'affiche automatiquement
echo.
echo ===============================================================
echo.
pause
goto MORE_OPTIONS

REM ========================================
REM FIN
REM ========================================
:END
echo.
echo %GREEN%Merci d'avoir utilisé le système Restaurant Menu Numérique!%RESET%
echo.
exit /b 0
