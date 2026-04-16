const path = require("path");
const express = require("express");
const rateLimit = require("express-rate-limit");

const { buildCors, buildLogger } = require("../middlewares");
const { apiRouter } = require("../routes");
const { notFound, errorHandler } = require("../middlewares/error");

function loadExpress(app) {
  app.disable("x-powered-by");

  app.use(buildLogger());
  app.use(buildCors());

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (req, res) => res.redirect("/HOME%20page/index.html"));

  // static frontend
  app.use(express.static(path.join(__dirname, "..", "public")));

  // APIs
  app.use(
    "/api",
    rateLimit({
      windowMs: 60 * 1000,
      limit: Number(process.env.RATE_LIMIT_PER_MIN || 120),
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use("/api", apiRouter);

  // errors
  app.use(notFound);
  app.use(errorHandler);
}

module.exports = { loadExpress };

