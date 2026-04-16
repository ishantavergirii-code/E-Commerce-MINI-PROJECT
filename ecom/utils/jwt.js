const jwt = require("jsonwebtoken");

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function signAuthToken(payload) {
  return jwt.sign(payload, requireEnv("JWT_SECRET"), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function verifyAuthToken(token) {
  return jwt.verify(token, requireEnv("JWT_SECRET"));
}

module.exports = { signAuthToken, verifyAuthToken };

