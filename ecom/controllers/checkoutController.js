const { body, validationResult } = require("express-validator");

const { signIntent, verifyIntent } = require("../utils/checkoutIntent");
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

const validateCreateIntent = [
  body("productId").isString().trim().notEmpty(),
  body("quantity").optional().isInt({ min: 1, max: 99 }).toInt(),
];

async function createIntent(req, res, next) {
  try {
    assertValid(req);
    const { productId } = req.body;
    const quantity = req.body.quantity || 1;

    // Minimal payload; product details are always reloaded server-side at checkout.
    const intentToken = signIntent({
      productId,
      quantity,
      userId: req.user?.id || null,
    });

    res.status(201).json({ intentToken });
  } catch (err) {
    if (err.status) res.status(err.status);
    next(err);
  }
}

async function resolveIntent(req, res, next) {
  try {
    const decoded = verifyIntent(req.params.token);
    const product = await getProductById(decoded.productId);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const quantity = Math.max(1, Math.min(99, Number(decoded.quantity || 1)));
    const total = Number(product.price) * quantity;

    res.json({
      items: [
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.image_url,
          quantity,
        },
      ],
      total,
    });
  } catch (err) {
    res.status(400);
    next(new Error("Invalid or expired intent token"));
  }
}

module.exports = { validateCreateIntent, createIntent, resolveIntent };

