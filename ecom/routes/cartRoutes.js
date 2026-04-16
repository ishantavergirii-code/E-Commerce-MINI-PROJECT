const express = require("express");

const { authMiddleware } = require("../middlewares/auth");
const { validateAdd, validateUpdate, validateRemove, add, get, update, remove, count } = require("../controllers/cartController");

const router = express.Router();

router.use(authMiddleware);

router.get("/count", count);
router.post("/add", validateAdd, add);
router.get("/", get);
router.put("/update", validateUpdate, update);
router.delete("/remove", validateRemove, remove);

module.exports = { cartRouter: router };

