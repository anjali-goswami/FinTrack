const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function authMiddleware(req, res, next) {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Authentication required." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("name email");
    if (!user) return res.status(401).json({ message: "Account no longer exists." });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please sign in again." });
  }
};
