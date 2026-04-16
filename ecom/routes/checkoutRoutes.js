const express = require("express");

const { authMiddleware } = require("../middlewares/auth");
const { validateCreateIntent, createIntent, resolveIntent } = require("../controllers/checkoutController");

const router = express.Router();

// allow guest intent creation, but attach user if token is provided
router.post("/intent", (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header) return next();
  return authMiddleware(req, res, next);
}, validateCreateIntent, createIntent);

router.get("/intent/:token", resolveIntent);

module.exports = { checkoutRouter: router };

