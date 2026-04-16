const express = require("express");

const { authMiddleware } = require("../middlewares/auth");
const { validateCreateOrder, validateCapture, createOrder, capture } = require("../controllers/paymentController");

const router = express.Router();

router.get("/client-id", (req, res) => {
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID || "" });
});

router.use(authMiddleware);

router.post("/create-order", validateCreateOrder, createOrder);
router.post("/capture", validateCapture, capture);

module.exports = { paymentRouter: router };

