const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createSession = (user) => ({
  token: jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" }),
  user: { id: user.id, name: user.name, email: user.email },
});

exports.register = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Enter your name and a valid email address." });
    }
    if (password.length < 8) return res.status(400).json({ message: "Password must contain at least 8 characters." });
    const exists = await User.exists({ email });
    if (exists) return res.status(409).json({ message: "An account with this email already exists." });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: passwordHash });
    return res.status(201).json(createSession(user));
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }
    return res.json(createSession(user));
  } catch (error) {
    return next(error);
  }
};

exports.me = (req, res) => res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email } });
