const { verifyAuthToken } = require("../utils/jwt");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    res.status(401);
    return next(new Error("Unauthorized"));
  }

  try {
    const decoded = verifyAuthToken(token);
    req.user = { id: decoded.sub };
    return next();
  } catch (err) {
    res.status(401);
    return next(new Error("Invalid token"));
  }
}

module.exports = { authMiddleware };

