const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const { createUser, findUserByEmail } = require("../models/userModel");
const { signAuthToken } = require("../utils/jwt");

function assertValid(req) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const err = new Error("Validation failed");
    err.status = 400;
    err.details = result.array();
    throw err;
  }
}

async function register(req, res, next) {
  try {
    assertValid(req);
    const { name, email, password } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) {
      res.status(409);
      throw new Error("Email already in use");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      id: uuidv4(),
      name,
      email,
      passwordHash,
    });

    const token = signAuthToken({ sub: user.id });
    res.status(201).json({ user, token });
  } catch (err) {
    if (err.status) res.status(err.status);
    next(err);
  }
}

async function login(req, res, next) {
  try {
    assertValid(req);
    const { email, password } = req.body;

    const userRow = await findUserByEmail(email);
    if (!userRow) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const ok = await bcrypt.compare(password, userRow.password_hash);
    if (!ok) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const user = { id: userRow.id, name: userRow.name, email: userRow.email };
    const token = signAuthToken({ sub: user.id });
    res.json({ user, token });
  } catch (err) {
    if (err.status) res.status(err.status);
    next(err);
  }
}

module.exports = { register, login };

