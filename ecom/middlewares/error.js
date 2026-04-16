function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status =
    err.status ||
    (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  const payload = {
    error: {
      message: err.message || "Internal Server Error",
      status,
    },
  };

  if (err.details) payload.error.details = err.details;

  if (process.env.NODE_ENV !== "production" && err.stack) {
    payload.error.stack = err.stack;
  }

  res.status(status).json(payload);
}

module.exports = { notFound, errorHandler };

