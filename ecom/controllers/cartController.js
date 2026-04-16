const { body, validationResult } = require("express-validator");

const { addToCart, listCart, updateCartQuantity, removeFromCart, getCartCount } = require("../models/cartModel");
const { getProductById } = require("../models/productModel");

function assertValid(req) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const err = new Error("Validation failed");
    err.status = 400;
    err.details = result.array();
    throw err;
  }
}

const validateAdd = [
  body("productId").isString().trim().notEmpty(),
  body("quantity").optional().isInt({ min: 1, max: 99 }).toInt(),
];

const validateUpdate = [
  body("productId").isString().trim().notEmpty(),
  body("quantity").isInt({ min: 0, max: 99 }).toInt(),
];

const validateRemove = [body("productId").isString().trim().notEmpty()];

async function add(req, res, next) {
  try {
    assertValid(req);
    const userId = req.user.id;
    const { productId } = req.body;
    const quantity = req.body.quantity || 1;

    const product = await getProductById(productId);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    await addToCart({ userId, productId, quantity });
    const count = await getCartCount({ userId });
    res.status(201).json({ ok: true, cartCount: count });
  } catch (err) {
    if (err.status) res.status(err.status);
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await listCart({ userId, page: req.query.page, limit: req.query.limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    assertValid(req);
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    await updateCartQuantity({ userId, productId, quantity });
    const count = await getCartCount({ userId });
    res.json({ ok: true, cartCount: count });
  } catch (err) {
    if (err.status) res.status(err.status);
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    assertValid(req);
    const userId = req.user.id;
    const { productId } = req.body;

    await removeFromCart({ userId, productId });
    const count = await getCartCount({ userId });
    res.json({ ok: true, cartCount: count });
  } catch (err) {
    if (err.status) res.status(err.status);
    next(err);
  }
}

async function count(req, res, next) {
  try {
    const userId = req.user.id;
    const cartCount = await getCartCount({ userId });
    res.json({ cartCount });
  } catch (err) {
    next(err);
  }
}

module.exports = { validateAdd, validateUpdate, validateRemove, add, get, update, remove, count };

