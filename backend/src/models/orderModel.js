const pool = require('../config/db');

const createOrderWithItems = async (orderData) => {
  const { table_id, total_price, items } = orderData;
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); 

    // 1. Insérer dans la table 'orders'
    const orderResult = await client.query(
      `INSERT INTO orders (table_id, total, status)
       VALUES ($1, $2, 'PENDING')
       RETURNING id, created_at, status`,
      [table_id, total_price]
    );
    const newOrder = orderResult.rows[0];

    // 2. Insérer chaque article dans 'order_items'
    const itemPromises = items.map(item => {
      return client.query(
        `INSERT INTO order_items (order_id, menu_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [newOrder.id, item.menu_id, item.quantity, item.unit_price, item.subtotal]
      );
    }); 

    await Promise.all(itemPromises);

    await client.query('COMMIT');

    // Retourner la commande complète avec ses articles
    return { ...newOrder, items };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Erreur dans la transaction de création de commande:", error);
    throw error;
  } finally {
    client.release();
  }
};

const getAllOrders = async () => {
    // Cette requête récupère les commandes et agrège les détails des articles dans un tableau JSON
    const result = await pool.query(`
        SELECT
            o.id,
            o.table_id,
            t.table_number,
            o.total,
            o.status,
            o.created_at,
            (SELECT json_agg(json_build_object('name', m.name, 'quantity', oi.quantity, 'price', oi.unit_price))
             FROM order_items oi JOIN menu m ON m.id = oi.menu_id
             WHERE oi.order_id = o.id) as items
        FROM orders o
        JOIN tables t ON t.id = o.table_id
        ORDER BY o.created_at DESC
    `);
    return result.rows;
};


module.exports = {
  createOrderWithItems,
  getAllOrders,
};