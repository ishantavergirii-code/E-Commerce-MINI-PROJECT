function clampInt(v, { min, max, fallback }) {
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

async function paginate({ pool, page, limit, dataSql, dataParams, countSql, countParams }) {
  const safePage = clampInt(page, { min: 1, max: 10_000, fallback: 1 });
  const safeLimit = clampInt(limit, { min: 1, max: 100, fallback: 12 });
  const offset = (safePage - 1) * safeLimit;

  const [[{ totalItems }]] = await pool.query(countSql, countParams);
  const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));
  const effectivePage = Math.min(safePage, totalPages);
  const effectiveOffset = (effectivePage - 1) * safeLimit;

  const [rows] = await pool.query(dataSql, [...dataParams, safeLimit, effectiveOffset]);

  return {
    data: rows,
    page: effectivePage,
    totalPages,
    totalItems,
  };
}

module.exports = { paginate };

