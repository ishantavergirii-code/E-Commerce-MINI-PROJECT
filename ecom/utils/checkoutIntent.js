const jwt = require("jsonwebtoken");

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function signIntent(payload) {
  return jwt.sign(payload, requireEnv("CHECKOUT_INTENT_SECRET"), {
    expiresIn: process.env.CHECKOUT_INTENT_EXPIRES_IN || "15m",
  });
}

function verifyIntent(token) {
  return jwt.verify(token, requireEnv("CHECKOUT_INTENT_SECRET"));
}

module.exports = { signIntent, verifyIntent };

