const { v4: uuidv4 } = require("uuid");

const { getPool } = require("../config/db");
const { paginate } = require("../utils/paginate");

async function addToCart({ userId, productId, quantity }) {
  const pool = getPool();
  await pool.execute(
    `INSERT INTO cart_items (id, user_id, product_id, quantity)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [uuidv4(), userId, productId, quantity],
  );
}

async function listCart({ userId, page, limit }) {
  const pool = getPool();
  const countSql = "SELECT COUNT(*) AS totalItems FROM cart_items WHERE user_id = ?";
  const dataSql = `
    SELECT
      ci.product_id AS productId,
      ci.quantity AS quantity,
      p.name AS name,
      p.price AS price,
      p.image_url AS imageUrl,
      p.stock AS stock
    FROM cart_items ci
    INNER JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ?
    ORDER BY ci.created_at DESC
    LIMIT ? OFFSET ?
  `;

  return paginate({
    pool,
    page,
    limit,
    dataSql,
    dataParams: [userId],
    countSql,
    countParams: [userId],
  });
}

async function updateCartQuantity({ userId, productId, quantity }) {
  const pool = getPool();
  if (quantity <= 0) {
    await pool.execute("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?", [userId, productId]);
    return;
  }

  await pool.execute("UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?", [
    quantity,
    userId,
    productId,
  ]);
}

async function removeFromCart({ userId, productId }) {
  const pool = getPool();
  await pool.execute("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?", [userId, productId]);
}

async function getCartCount({ userId }) {
  const pool = getPool();
  const [[row]] = await pool.query("SELECT COALESCE(SUM(quantity), 0) AS count FROM cart_items WHERE user_id = ?", [
    userId,
  ]);
  return row.count || 0;
}

async function getCartLinesForCheckout({ userId }) {
  const pool = getPool();
  const [rows] = await pool.query(
    `
      SELECT
        ci.product_id AS productId,
        ci.quantity AS quantity,
        p.name AS name,
        p.price AS price
      FROM cart_items ci
      INNER JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `,
    [userId],
  );
  return rows;
}

async function clearCart({ userId }) {
  const pool = getPool();
  await pool.execute("DELETE FROM cart_items WHERE user_id = ?", [userId]);
}

module.exports = {
  addToCart,
  listCart,
  updateCartQuantity,
  removeFromCart,
  getCartCount,
  getCartLinesForCheckout,
  clearCart,
};

