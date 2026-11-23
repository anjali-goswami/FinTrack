const mongoose = require("mongoose");
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");

const cleanExpense = (body) => ({
  title: String(body.title || "").trim(),
  amount: Number(body.amount),
  type: body.type || "expense",
  category: String(body.category || "").trim(),
  date: String(body.date || ""),
  description: String(body.description || "").trim(),
  budgetId: body.type === "expense" && body.budgetId ? body.budgetId : null,
});

const valid = (data) => data.title && data.title.length <= 120
  && Number.isFinite(data.amount) && data.amount > 0
  && ["income", "expense"].includes(data.type)
  && data.category && data.category.length <= 80
  && /^\d{4}-\d{2}-\d{2}$/.test(data.date)
  && data.description.length <= 500;

const checkBudget = async (data, userId) => {
  if (!data.budgetId) return true;
  if (!mongoose.isValidObjectId(data.budgetId)) return false;
  const budget = await Budget.findOne({ _id: data.budgetId, userId });
  return Boolean(budget && (budget.category === "All categories" || budget.category === data.category));
};

exports.list = async (req, res, next) => {
  try { return res.json(await Expense.find({ userId: req.user.id }).sort({ date: -1, createdAt: -1 })); }
  catch (error) { return next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const data = cleanExpense(req.body);
    if (!valid(data)) return res.status(400).json({ message: "Enter a title, valid amount, category, and date." });
    if (!(await checkBudget(data, req.user.id))) return res.status(400).json({ message: "Selected budget does not match this expense." });
    return res.status(201).json(await Expense.create({ ...data, userId: req.user.id }));
  } catch (error) { return next(error); }
};

exports.update = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Transaction not found." });
    const data = cleanExpense(req.body);
    if (!valid(data)) return res.status(400).json({ message: "Enter a title, valid amount, category, and date." });
    if (!(await checkBudget(data, req.user.id))) return res.status(400).json({ message: "Selected budget does not match this expense." });
    const expense = await Expense.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, data, { new: true, runValidators: true });
    if (!expense) return res.status(404).json({ message: "Transaction not found." });
    return res.json(expense);
  } catch (error) { return next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Transaction not found." });
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ message: "Transaction not found." });
    return res.status(204).end();
  } catch (error) { return next(error); }
};
