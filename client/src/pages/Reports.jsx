import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import SummaryCard from "../components/SummaryCard";
import { useTransactions } from "../context/TransactionContext";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getBudgetSpent } from "../utils/budgetUtils";

const money = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

const CATEGORY_COLORS = {
  Food: "#10b981",
  Shopping: "#3b82f6",
  Transportation: "#f59e0b",
  Entertainment: "#ec4899",
  Utilities: "#8b5cf6",
  Healthcare: "#ef4444",
  Education: "#06b6d4",
  Other: "#64748b",
};

const Reports = () => {
  const { transactions, budgets } = useTransactions();

  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  // Total spending (all time)
  const totalSpending = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Current month spending
  const monthTransactions = transactions.filter(
    (t) => t.type === "expense" && t.date && t.date.startsWith(currentMonth),
  );
  const monthSpending = monthTransactions.reduce(
    (sum, t) => sum + Number(t.amount || 0), 0,
  );

  // Total budget and remaining
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.limit || 0), 0);
  const totalSpent = totalSpending;
  const remainingBudget = totalBudget - totalSpent;

  // Monthly data for last 6 months
  const monthlyData = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const monthTxns = transactions.filter((transaction) => {
      const transactionDate = new Date(`${transaction.date}T00:00:00`);
      return (
        !Number.isNaN(transactionDate.getTime()) &&
        transactionDate.getFullYear() === year &&
        transactionDate.getMonth() === month &&
        transaction.type === "expense"
      );
    });

    return {
      month: monthDate.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      spending: monthTxns.reduce((sum, t) => sum + Number(t.amount || 0), 0),
    };
  });

  // Category-wise expenses
  const categoryTotals = transactions
    .filter((t) => t.type === "expense")
    .reduce((result, transaction) => {
      const category = transaction.category || "Other";
      result[category] = (result[category] || 0) + Number(transaction.amount || 0);
      return result;
    }, {});

  const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  // Budget utilization
  const budgetOverview = budgets.map((budget) => {
    const spent = getBudgetSpent(budget, transactions, today);
    const limit = Number(budget.limit || 0);
    const remaining = limit - spent;
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    return { ...budget, spent, limit, remaining, percentage };
  });

  const overspendingBudgets = budgetOverview.filter((b) => b.percentage >= 100);
  const topCategories = categoryData
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const chartColors = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#8b5cf6",
    "#06b6d4",
    "#ef4444",
    "#64748b",
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <Navbar />

        <div className="dashboard-content">
          <div className="dashboard-heading">
            <h1>Reports</h1>
            <p>Track your spending and budget utilization.</p>
          </div>

          {transactions.length > 0 || budgets.length > 0 ? (
            <>
              {/* Financial Summary */}
              <div className="summary-grid">
                <SummaryCard
                  title="Total Spending"
                  amount={totalSpending}
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  }
                  color="expense"
                />

                <SummaryCard
                  title="This Month"
                  amount={monthSpending}
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  }
                  color="balance"
                />

                <SummaryCard
                  title="Total Budget"
                  amount={totalBudget}
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="16" y1="5" x2="16" y2="3" />
                      <line x1="12" y1="5" x2="12" y2="3" />
                      <line x1="8" y1="5" x2="8" y2="3" />
                    </svg>
                  }
                  color="balance"
                />

                <SummaryCard
                  title="Remaining Budget"
                  amount={remainingBudget}
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  }
                  color={remainingBudget >= 0 ? "balance" : "expense"}
                />
              </div>

              {/* Monthly Spending Trend */}
              <section className="report-chart-card">
                <div className="report-chart-heading">
                  <h2>Monthly Spending Trend</h2>
                  <p>Your expenses over the last six months.</p>
                </div>

                {transactions.some((t) => t.type === "expense") ? (
                  <div className="report-chart">
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis
                          tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                        />
                        <Tooltip formatter={(value) => money(value)} />
                        <Legend />
                        <Bar
                          dataKey="spending"
                          name="Spending"
                          fill="#ef4444"
                          radius={[5, 5, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="report-empty-chart">
                    No expense data available for the last six months.
                  </div>
                )}
              </section>

              {/* Category-wise Expenses */}
              <section className="report-chart-card">
                <div className="report-chart-heading">
                  <h2>Expense Breakdown by Category</h2>
                  <p>See where your money is being spent.</p>
                </div>

                {categoryData.length > 0 ? (
                  <div className="report-pie-layout">
                    <div className="report-pie-chart">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={105}
                            label
                          >
                            {categoryData.map((entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={chartColors[index % chartColors.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => money(value)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="report-category-list">
                      {categoryData.map((category, index) => (
                        <div className="report-category-item" key={category.name}>
                          <div className="report-category-name">
                            <span
                              className="report-category-dot"
                              style={{ backgroundColor: chartColors[index % chartColors.length] }}
                            ></span>
                            {category.name}
                          </div>
                          <strong>{money(category.value)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="report-empty-chart">
                    No expense transactions available for category analysis.
                  </div>
                )}
              </section>

              {/* Budget Utilization */}
              <section className="report-chart-card">
                <div className="report-chart-heading">
                  <h2>Budget Utilization</h2>
                  <p>How much of each budget has been used.</p>
                </div>

                {budgets.length > 0 ? (
                  <div className="report-category-list">
                    {budgetOverview.map((budget) => {
                      const exceeded = budget.percentage >= 100;
                      const nearLimit = budget.percentage >= 80 && budget.percentage < 100;
                      return (
                        <div className="report-category-item" key={budget.id}>
                          <div className="report-category-name">
                            <span
                              className="report-category-dot"
                              style={{
                                backgroundColor: exceeded
                                  ? "#ef4444"
                                  : nearLimit
                                    ? "#f59e0b"
                                    : "#10b981",
                              }}
                            ></span>
                            {budget.category}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <strong>{money(budget.spent)} / {money(budget.limit)}</strong>
                            <span style={{ fontSize: 12, color: "#64748b" }}>
                              {budget.percentage.toFixed(1)}% used
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="report-empty-chart">
                    No budgets created yet. Create budgets to track utilization.
                  </div>
                )}
              </section>

              {/* Overspending Alerts */}
              {overspendingBudgets.length > 0 && (
                <section className="report-chart-card">
                  <div className="report-chart-heading">
                    <h2>Overspending Alerts</h2>
                    <p>Budgets that have been exceeded.</p>
                  </div>
                  <div className="report-category-list">
                    {overspendingBudgets.map((budget) => (
                      <div className="report-category-item" key={budget.id}>
                        <div className="report-category-name">
                          <span className="report-category-dot" style={{ backgroundColor: "#ef4444" }}></span>
                          {budget.category}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <strong style={{ color: "#ef4444" }}>
                            Over by {money(Math.abs(budget.remaining))}
                          </strong>
                          <span style={{ fontSize: 12, color: "#64748b" }}>
                            {budget.percentage.toFixed(1)}% of budget used
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Top Spending Categories */}
              {topCategories.length > 0 && (
                <section className="report-chart-card">
                  <div className="report-chart-heading">
                    <h2>Top Spending Categories</h2>
                    <p>Your highest expense categories.</p>
                  </div>
                  <div className="report-category-list">
                    {topCategories.map((category) => (
                      <div className="report-category-item" key={category.name}>
                        <div className="report-category-name">
                          <span className="report-category-dot" style={{ backgroundColor: CATEGORY_COLORS[category.name] || "#94a3b8" }}></span>
                          {category.name}
                        </div>
                        <strong>{money(category.value)}</strong>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="report-empty-state">
              <div className="report-empty-icon">📊</div>
              <h2>No reports available</h2>
              <p>
                Add your first expense and create a budget.
                Your spending summaries and charts will appear here automatically.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;