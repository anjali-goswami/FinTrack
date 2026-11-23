const Budget = require("../models/Budget");
const Expense = require("../models/Expense");

const periodStart = (duration, now) => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (duration === "week") start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  else if (duration === "month") start.setDate(1);
  else if (duration === "year") start.setMonth(0, 1);
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
};

exports.getSummary = async (req, res, next) => {
  try {
    const [expenses, budgets] = await Promise.all([
      Expense.find({ userId: req.user.id }).lean(),
      Budget.find({ userId: req.user.id }).lean(),
    ]);
    const sum = (items) => items.reduce((total, item) => total + item.amount, 0);
    const incomeItems = expenses.filter((item) => item.type === "income");
    const expenseItems = expenses.filter((item) => item.type === "expense");
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const month = today.slice(0, 7);
    const monthlyIncome = sum(incomeItems.filter((item) => item.date.startsWith(month)));
    const monthlyExpenses = sum(expenseItems.filter((item) => item.date.startsWith(month)));

    const durations = [...new Set(budgets.map((budget) => budget.duration || "month"))];
    const budgetSummary = durations.reduce((total, duration) => {
      const sameDuration = budgets.filter((budget) => (budget.duration || "month") === duration);
      const categories = sameDuration.filter((budget) => budget.category !== "All categories");
      const applicable = categories.length ? categories : sameDuration;
      const start = periodStart(duration, now);
      const periodSummary = applicable.reduce((periodTotal, budget) => {
        const spent = sum(expenseItems.filter((item) => {
          const categoryMatches = budget.category === "All categories" || item.category === budget.category;
          const linkedMatches = item.budgetId
            ? String(item.budgetId) === String(budget._id)
            : duration === "month";
          return categoryMatches && linkedMatches && item.date >= start && item.date <= today;
        }));
        return {
          limit: periodTotal.limit + budget.limit,
          spent: periodTotal.spent + spent,
        };
      }, { limit: 0, spent: 0 });
      return {
        limit: total.limit + periodSummary.limit,
        spent: total.spent + periodSummary.spent,
      };
    }, { limit: 0, spent: 0 });
    const remainingBudget = budgetSummary.limit - budgetSummary.spent;

    return res.json({
      totalIncome: sum(incomeItems),
      totalExpenses: sum(expenseItems),
      totalBudget: budgetSummary.limit,
      totalSpent: budgets.length ? budgetSummary.spent : sum(expenseItems),
      remainingBudget: budgets.length ? remainingBudget : 0,
      budgetUsage: budgetSummary.limit > 0 ? (budgetSummary.spent / budgetSummary.limit) * 100 : 0,
      activeBudgets: budgets.length,
      totalBalance: budgets.length ? remainingBudget : sum(incomeItems) - sum(expenseItems),
      monthlyIncome,
      monthlyExpenses,
      monthlySavings: monthlyIncome - monthlyExpenses,
    });
  } catch (error) { return next(error); }
};
