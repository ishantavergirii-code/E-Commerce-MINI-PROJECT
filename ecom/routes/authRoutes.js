const express = require("express");
const { body } = require("express-validator");

const { register, login } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").isString().trim().isLength({ min: 2, max: 120 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 8, max: 72 }),
  ],
  register,
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").isString().isLength({ min: 1, max: 72 })],
  login,
);

module.exports = { authRouter: router };

