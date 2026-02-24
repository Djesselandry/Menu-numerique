-- Migration pour ajouter la désactivation temporaire

-- Ajouter la colonne disabled_until à la table menu
ALTER TABLE menu 
ADD COLUMN disabled_until TIMESTAMP NULL;

-- Créer un index pour performance
CREATE INDEX IF NOT EXISTS idx_menu_disabled_until 
ON menu(disabled_until);

-- Vérifier la colonne
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name='menu' AND column_name='disabled_until';
