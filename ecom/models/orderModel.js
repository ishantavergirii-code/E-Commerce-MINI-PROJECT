const { v4: uuidv4 } = require("uuid");

const { getPool } = require("../config/db");

async function createOrderWithItems({ userId, totalAmount, paymentStatus, paypalReferenceId, items }) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const orderId = uuidv4();
    await conn.execute(
      `INSERT INTO orders (id, user_id, total_amount, payment_status, paypal_reference_id)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, userId, totalAmount, paymentStatus, paypalReferenceId],
    );

    for (const item of items) {
      await conn.execute(
        `INSERT INTO order_items (id, order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), orderId, item.productId, item.quantity, item.price],
      );
    }

    await conn.commit();
    return orderId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function listOrdersByUser({ userId }) {
  const pool = getPool();
  const [orders] = await pool.execute(
    `SELECT id, total_amount AS totalAmount, payment_status AS paymentStatus, paypal_reference_id AS paypalReferenceId, created_at AS createdAt
     FROM orders
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId],
  );

  if (!orders.length) return [];

  const orderIds = orders.map((o) => o.id);
  const placeholders = orderIds.map(() => "?").join(",");
  const [items] = await pool.query(
    `SELECT oi.order_id AS orderId, oi.product_id AS productId, oi.quantity AS quantity, oi.price AS price, p.name AS name
     FROM order_items oi
     INNER JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id IN (${placeholders})
     ORDER BY oi.created_at ASC`,
    orderIds,
  );

  const byOrderId = new Map();
  for (const it of items) {
    if (!byOrderId.has(it.orderId)) byOrderId.set(it.orderId, []);
    byOrderId.get(it.orderId).push(it);
  }

  return orders.map((o) => ({ ...o, items: byOrderId.get(o.id) || [] }));
}

module.exports = { createOrderWithItems, listOrdersByUser };

