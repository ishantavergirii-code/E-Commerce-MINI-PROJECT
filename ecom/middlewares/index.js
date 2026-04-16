const cors = require("cors");
const morgan = require("morgan");

function buildCors() {
  const allow = process.env.CORS_ORIGINS;
  if (!allow) {
    // Dev default: reflect origin (works for file:// and localhost)
    return cors({ origin: true, credentials: true });
  }

  const allowed = allow.split(",").map((s) => s.trim()).filter(Boolean);
  return cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowed.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  });
}

function buildLogger() {
  if (process.env.NODE_ENV === "test") return (req, res, next) => next();
  return morgan(process.env.NODE_ENV === "production" ? "combined" : "dev");
}

module.exports = { buildCors, buildLogger };

