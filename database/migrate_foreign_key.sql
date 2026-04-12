-- Migration pour ajouter ON DELETE CASCADE à la foreign key fk_item_menu

-- Supprimer la contrainte existante
ALTER TABLE order_items 
DROP CONSTRAINT fk_item_menu;

-- Créer la nouvelle contrainte avec ON DELETE CASCADE
ALTER TABLE order_items
ADD CONSTRAINT fk_item_menu
FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE CASCADE;

-- Vérifier les contraintes
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE table_name='order_items' AND constraint_type='FOREIGN KEY';
