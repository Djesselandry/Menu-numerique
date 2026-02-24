const pool = require('../config/db');

// Créer une nouvelle commande
const createOrder = async (tableNumber, items) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Vérifier ou créer la table
    const tableResult = await client.query(
      'SELECT id FROM tables WHERE table_number = $1',
      [tableNumber]
    );

    let tableId;
    if (tableResult.rows.length === 0) {
      const newTable = await client.query(
        'INSERT INTO tables (table_number) VALUES ($1) RETURNING id',
        [tableNumber]
      );
      tableId = newTable.rows[0].id;
    } else {
      tableId = tableResult.rows[0].id;
    }

    // 2. Calculer le total
    const total = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // 3. Créer la commande
    const orderResult = await client.query(
      `INSERT INTO orders (table_id, status, total, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, table_id, status, total, created_at`,
      [tableId, 'PENDING', total]
    );

    const order = orderResult.rows[0];

    // 4. Ajouter les articles de la commande
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.id, item.quantity, item.price, item.price * item.quantity]
      );
    }

    await client.query('COMMIT');

    return {
      ...order,
      items: items
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Récupérer toutes les commandes actives
const getActiveOrders = async () => {
  const res = await pool.query(`
    SELECT 
      o.id,
      o.table_id,
      t.table_number,
      o.status,
      o.total,
      o.created_at,
      COUNT(oi.id) as item_count
    FROM orders o
    JOIN tables t ON o.table_id = t.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.status <> 'ARCHIVED'
    GROUP BY o.id, t.table_number, o.table_id, o.status, o.total, o.created_at
    ORDER BY o.created_at DESC
  `);
  return res.rows;
};

// Récupérer les détails d'une commande
const getOrderDetails = async (orderId) => {
  const res = await pool.query(`
    SELECT 
      o.id,
      o.table_id,
      t.table_number,
      o.status,
      o.total,
      o.created_at,
      array_agg(
        json_build_object(
          'id', m.id,
          'name', m.name,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'subtotal', oi.subtotal
        )
      ) as items
    FROM orders o
    JOIN tables t ON o.table_id = t.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN menu m ON oi.menu_id = m.id
    WHERE o.id = $1
    GROUP BY o.id, t.table_number, o.table_id, o.status, o.total, o.created_at
  `, [orderId]);
  return res.rows[0];
};

// Changer le statut d'une commande
const updateOrderStatus = async (orderId, status) => {
  const res = await pool.query(
    `UPDATE orders 
     SET status = $1 
     WHERE id = $2 
     RETURNING id, table_id, status, total, created_at`,
    [status, orderId]
  );
  return res.rows[0];
};

// Récupérer les commandes par table
const getOrdersByTable = async (tableNumber) => {
  const res = await pool.query(`
    SELECT 
      o.id,
      o.table_id,
      t.table_number,
      o.status,
      o.total,
      o.created_at,
      array_agg(
        json_build_object(
          'id', m.id,
          'name', m.name,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'subtotal', oi.subtotal
        )
      ) as items
    FROM orders o
    JOIN tables t ON o.table_id = t.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN menu m ON oi.menu_id = m.id
    WHERE t.table_number = $1
    GROUP BY o.id, t.table_number, o.table_id, o.status, o.total, o.created_at
    ORDER BY o.created_at DESC
  `, [tableNumber]);
  return res.rows;
};

module.exports = {
  createOrder,
  getActiveOrders,
  getOrderDetails,
  updateOrderStatus,
  getOrdersByTable
};
