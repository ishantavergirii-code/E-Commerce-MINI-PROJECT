const express = require("express");

const { authRouter } = require("./authRoutes");
const { productRouter } = require("./productRoutes");
const { cartRouter } = require("./cartRoutes");
const { checkoutRouter } = require("./checkoutRoutes");
const { paymentRouter } = require("./paymentRoutes");
const { userRouter } = require("./userRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ ok: true });
});

router.use("/auth", authRouter);
router.use("/products", productRouter);
router.use("/cart", cartRouter);
router.use("/checkout", checkoutRouter);
router.use("/payment", paymentRouter);
router.use("/user", userRouter);

module.exports = { apiRouter: router };

