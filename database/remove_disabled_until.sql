-- Migration pour supprimer la colonne disabled_until (non utilisée)

-- Supprimer l'index
DROP INDEX IF EXISTS idx_menu_disabled_until;

-- Supprimer la colonne
ALTER TABLE menu 
DROP COLUMN disabled_until;

-- Vérifier
SELECT column_name FROM information_schema.columns 
WHERE table_name='menu' 
ORDER BY ordinal_position;
