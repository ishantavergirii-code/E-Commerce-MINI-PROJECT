const express = require("express");

const { list, detail } = require("../controllers/productController");

const router = express.Router();

router.get("/", list);
router.get("/:id", detail);

module.exports = { productRouter: router };

