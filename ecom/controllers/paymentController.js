const { body, validationResult } = require("express-validator");

const { paypalCreateOrder, paypalCaptureOrder } = require("../services/paypalService");
const { verifyIntent } = require("../utils/checkoutIntent");
const { getProductById } = require("../models/productModel");
const { getCartLinesForCheckout, clearCart } = require("../models/cartModel");
const { createOrderWithItems } = require("../models/orderModel");

function assertValid(req) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const err = new Error("Validation failed");
    err.status = 400;
    err.details = result.array();
    throw err;
  }
}

const validateCreateOrder = [
  body("source").isIn(["cart", "intent"]),
  body("intentToken").optional().isString(),
];

const validateCapture = [
  body("paypalOrderId").isString().trim().notEmpty(),
  body("source").isIn(["cart", "intent"]),
  body("intentToken").optional().isString(),
];

async function buildCheckoutFromSource({ userId, source, intentToken }) {
  if (source === "cart") {
    const lines = await getCartLinesForCheckout({ userId });
    if (!lines.length) {
      const err = new Error("Cart is empty");
      err.status = 400;
      throw err;
    }

    const items = lines.map((l) => ({
      productId: l.productId,
      quantity: Number(l.quantity),
      price: Number(l.price),
      name: l.name,
    }));
    const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    return { items, total };
  }

  if (!intentToken) {
    const err = new Error("intentToken is required for intent checkout");
    err.status = 400;
    throw err;
  }

  const decoded = verifyIntent(intentToken);
  const product = await getProductById(decoded.productId);
  if (!product) {
    const err = new Error("Product not found");
    err.status = 404;
    throw err;
  }

  const quantity = Math.max(1, Math.min(99, Number(decoded.quantity || 1)));
  const item = {
    productId: product.id,
    quantity,
    price: Number(product.price),
    name: product.name,
  };
  const total = item.price * item.quantity;
  return { items: [item], total };
}

async function createOrder(req, res, next) {
  try {
    assertValid(req);
    const userId = req.user.id;
    const { source, intentToken } = req.body;

    const { total } = await buildCheckoutFromSource({ userId, source, intentToken });
    const paypalOrder = await paypalCreateOrder({ total });

    res.status(201).json({ paypalOrderId: paypalOrder.id });
  } catch (err) {
    if (err.status) res.status(err.status);
    next(err);
  }
}

async function capture(req, res, next) {
  try {
    assertValid(req);
    const userId = req.user.id;
    const { paypalOrderId, source, intentToken } = req.body;

    const { items, total } = await buildCheckoutFromSource({ userId, source, intentToken });

    const captureResult = await paypalCaptureOrder({ paypalOrderId });
    const status = captureResult.status;

    if (status !== "COMPLETED") {
      res.status(400);
      throw new Error("Payment not completed");
    }

    const orderId = await createOrderWithItems({
      userId,
      totalAmount: total,
      paymentStatus: "CAPTURED",
      paypalReferenceId: paypalOrderId,
      items,
    });

    if (source === "cart") {
      await clearCart({ userId });
    }

    res.json({ orderId, paymentStatus: "CAPTURED" });
  } catch (err) {
    if (err.status) res.status(err.status);
    next(err);
  }
}

module.exports = { validateCreateOrder, validateCapture, createOrder, capture };

