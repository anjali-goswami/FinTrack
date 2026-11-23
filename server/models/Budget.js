const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  limit: { type: Number, required: true, min: 0.01 },
  duration: { type: String, enum: ["week", "month", "year"], default: "month" },
}, { timestamps: true });

budgetSchema.index({ userId: 1, category: 1, duration: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);
