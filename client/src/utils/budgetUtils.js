export const ALL_CATEGORIES = "All categories";

export const getPeriodStart = (duration, today = new Date()) => {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (duration === "week") {
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  } else if (duration === "month") {
    start.setDate(1);
  } else if (duration === "year") {
    start.setMonth(0, 1);
  }
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
};

export const getBudgetSpent = (budget, transactions, today = new Date()) => {
  const start = getPeriodStart(budget.duration || "month", today);
  const duration = budget.duration || "month";
  const end = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return transactions
    .filter((transaction) => transaction.type === "expense"
      && (budget.category === ALL_CATEGORIES || transaction.category === budget.category)
      && (transaction.budgetId
        ? String(transaction.budgetId) === String(budget.id)
        : duration === "month")
      && transaction.date >= start && transaction.date <= end)
    .reduce((total, transaction) => {
      const amount = Number(transaction.amount);
      return total + (Number.isFinite(amount) ? amount : 0);
    }, 0);
};

export const getRemainingBudgetTotal = (budgets, transactions, today = new Date()) => {
  const durations = [...new Set(budgets.map((budget) => budget.duration || "month"))];
  return durations.reduce((total, duration) => {
    const sameDuration = budgets.filter((budget) => (budget.duration || "month") === duration);
    const categoryBudgets = sameDuration.filter((budget) => budget.category !== ALL_CATEGORIES);
    const applicableBudgets = categoryBudgets.length
      ? categoryBudgets
      : sameDuration.filter((budget) => budget.category === ALL_CATEGORIES);
    return total + applicableBudgets.reduce((periodTotal, budget) =>
      periodTotal + Number(budget.limit || 0) - getBudgetSpent(budget, transactions, today), 0);
  }, 0);
};

export const getBudgetRemaining = (budget, transactions, today = new Date()) => {
  const limit = Number(budget.limit || 0);
  const spent = getBudgetSpent(budget, transactions, today);
  return limit - spent;
};

export const canAffordBudget = (budget, amount, transactions, today = new Date()) => {
  return getBudgetRemaining(budget, transactions, today) >= Number(amount);
};
