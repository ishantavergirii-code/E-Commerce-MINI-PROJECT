const { getPool } = require("../config/db");
const { paginate } = require("../utils/paginate");

function buildProductFilters({ search, priceMin, priceMax }) {
  const where = [];
  const params = [];

  if (search) {
    where.push("(name LIKE ? OR description LIKE ?)");
    const like = `%${search}%`;
    params.push(like, like);
  }

  if (priceMin !== undefined && priceMin !== null && priceMin !== "") {
    where.push("price >= ?");
    params.push(Number(priceMin));
  }

  if (priceMax !== undefined && priceMax !== null && priceMax !== "") {
    where.push("price <= ?");
    params.push(Number(priceMax));
  }

  return { whereSql: where.length ? `WHERE ${where.join(" AND ")}` : "", params };
}

function buildSort(sort) {
  switch (sort) {
    case "price_asc":
      return "ORDER BY price ASC";
    case "price_desc":
      return "ORDER BY price DESC";
    case "newest":
    default:
      return "ORDER BY created_at DESC";
  }
}

async function listProducts({ page, limit, search, sort, priceMin, priceMax }) {
  const pool = getPool();
  const { whereSql, params } = buildProductFilters({ search, priceMin, priceMax });
  const sortSql = buildSort(sort);

  const countSql = `SELECT COUNT(*) AS totalItems FROM products ${whereSql}`;
  const dataSql = `SELECT id, name, description, price, image_url, stock, created_at
                   FROM products
                   ${whereSql}
                   ${sortSql}
                   LIMIT ? OFFSET ?`;

  return paginate({
    pool,
    page,
    limit,
    dataSql,
    dataParams: params,
    countSql,
    countParams: params,
  });
}

async function getProductById(id) {
  const pool = getPool();
  const [rows] = await pool.execute(
    "SELECT id, name, description, price, image_url, stock, created_at FROM products WHERE id = ?",
    [id],
  );
  return rows[0] || null;
}

module.exports = { listProducts, getProductById };

