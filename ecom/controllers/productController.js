const { listProducts, getProductById } = require("../models/productModel");

async function list(req, res, next) {
  try {
    const result = await listProducts({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      sort: req.query.sort,
      priceMin: req.query.priceMin,
      priceMax: req.query.priceMax,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function detail(req, res, next) {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, detail };

