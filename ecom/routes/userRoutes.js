const express = require("express");

const { authMiddleware } = require("../middlewares/auth");
const { profile, orders } = require("../controllers/userController");

const router = express.Router();

router.use(authMiddleware);
router.get("/profile", profile);
router.get("/orders", orders);

module.exports = { userRouter: router };

