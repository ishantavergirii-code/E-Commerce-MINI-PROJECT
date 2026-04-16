const { findUserById } = require("../models/userModel");
const { listOrdersByUser } = require("../models/orderModel");

async function profile(req, res, next) {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function orders(req, res, next) {
  try {
    const rows = await listOrdersByUser({ userId: req.user.id });
    res.json({ orders: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { profile, orders };

