const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  amount: { type: Number, required: true, min: 0.01 },
  type: { type: String, enum: ["income", "expense"], default: "expense" },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  budgetId: { type: mongoose.Schema.Types.ObjectId, ref: "Budget", default: null },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  description: { type: String, trim: true, maxlength: 500, default: "" },
}, { timestamps: true });

expenseSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Expense", expenseSchema);
