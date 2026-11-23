const mongoose = require("mongoose");
const Budget = require("../models/Budget");

const cleanBudget = (body) => ({
  category: String(body.category || "").trim(),
  limit: Number(body.limit),
  duration: body.duration || "month",
});

const valid = (budget) => budget.category && budget.category.length <= 80
  && Number.isFinite(budget.limit) && budget.limit > 0
  && ["week", "month", "year"].includes(budget.duration);

exports.list = async (req, res, next) => {
  try { return res.json(await Budget.find({ userId: req.user.id }).sort({ createdAt: -1 })); }
  catch (error) { return next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const data = cleanBudget(req.body);
    if (!valid(data)) return res.status(400).json({ message: "Choose a category, duration, and positive budget limit." });
    const budget = await Budget.create({ ...data, userId: req.user.id });
    return res.status(201).json(budget);
  } catch (error) { return next(error); }
};

exports.update = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Budget not found." });
    const data = cleanBudget(req.body);
    if (!valid(data)) return res.status(400).json({ message: "Choose a category, duration, and positive budget limit." });
    const budget = await Budget.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, data, { new: true, runValidators: true });
    if (!budget) return res.status(404).json({ message: "Budget not found." });
    return res.json(budget);
  } catch (error) { return next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Budget not found." });
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!budget) return res.status(404).json({ message: "Budget not found." });
    return res.status(204).end();
  } catch (error) { return next(error); }
};
