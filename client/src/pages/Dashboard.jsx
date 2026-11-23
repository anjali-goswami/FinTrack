import { useMemo } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import SummaryCard from "../components/SummaryCard";
import { useTransactions } from "../context/TransactionContext";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { getBudgetSpent } from "../utils/budgetUtils";

const money = (value) => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

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

const Dashboard = () => {
  const { transactions, budgets, summary } = useTransactions();

  const validAmount = (transaction) => {
    const amount = Number(transaction.amount);
    return Number.isFinite(amount) ? amount : 0;
  };

  const totalBudget = summary?.totalBudget ?? budgets.reduce((sum, b) => sum + Number(b.limit || 0), 0);

  const calculatedSpent = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + validAmount(t), 0);

  const totalSpent = summary?.totalSpent ?? calculatedSpent;
  const remainingBudget = summary?.remainingBudget ?? totalBudget - totalSpent;

  const budgetUsage = summary?.budgetUsage ?? (totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0);

  const activeBudgets = summary?.activeBudgets ?? budgets.length;

  const today = useMemo(() => new Date(), []);

  const monthlySpending = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const monthEnd = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`;
      const monthTxns = transactions.filter(
        (t) => t.type === "expense" && t.date && t.date >= monthStart && t.date < monthEnd
      );
      months.push({
        month: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        spending: monthTxns.reduce((sum, t) => sum + validAmount(t), 0),
      });
    }
    return months;
  }, [transactions, today]);

  const expenseByCategory = useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const cat = t.category || "Other";
        map[cat] = (map[cat] || 0) + validAmount(t);
      });
    return Object.entries(map).map(([category, amount]) => ({ category, amount }));
  }, [transactions]);

  const totalCategorySpending = expenseByCategory.reduce((sum, item) => sum + item.amount, 0);

  const recentTransactions = [...transactions]
    .filter((t) => t.type === "expense")
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 5);

  const budgetOverview = budgets.map((budget) => {
    const spent = getBudgetSpent(budget, transactions, today);
    const limit = Number(budget.limit || 0);
    const remaining = limit - spent;
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    let status = "Within Budget";
    if (percentage >= 100) status = "Over Budget";
    else if (percentage >= 80) status = "Almost Reached";
    return { ...budget, spent, limit, remaining, percentage, status };
  });

  const overspendingAlerts = budgetOverview.filter((b) => b.percentage >= 100);
  const topCategories = expenseByCategory
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <Navbar />

        <div className="dashboard-content">
          <div className="dashboard-heading page-heading-row">
            <div>
              <h1>Dashboard</h1>
              <p>Overview of your spending and budgets.</p>
            </div>
            <div className="quick-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => { window.location.href = "/add-transaction"; }} title="Add Expense">
                <Icon d="M19 5H9.5A3.5 3.5 0 0 0 6 8.5v10A3.5 3.5 0 0 0 9.5 22h11a3.5 3.5 0 0 0 3.5-3.5v-10A3.5 3.5 0 0 0 19 5" />
                Add Expense
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => { window.location.href = "/budgets"; }} title="Create Budget">
                <Icon d="M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M21 12h-4a2 2 0 0 0 0 4h4" />
                Create Budget
              </button>
              <Link to="/reports" className="btn btn-ghost btn-sm" title="View Reports">
                <Icon d="M3 3v18h18M7 16l4-4 4 4 5-6" />
                View Reports
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="stats-grid">
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
              title="Total Spent"
              amount={totalSpent}
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
              title="Remaining Budget"
              amount={remainingBudget}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
              color={remainingBudget >= 0 ? "balance" : "expense"}
            />
            <SummaryCard
              title="Active Budgets"
              amount={activeBudgets}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              }
              color="balance"
              trend={budgetUsage}
            />
          </div>

          {/* Charts Row */}
          <div className="dashboard-grid">
            <section className="card chart-card" aria-labelledby="monthly-spending-title">
              <div className="card-header">
                <div>
                  <h2 id="monthly-spending-title" className="card-title">Monthly Spending</h2>
                  <p className="card-subtitle">Expense trend over last 6 months</p>
                </div>
              </div>
              <div className="card-content" style={{ padding: 0 }}>
                <div className="chart-wrapper">
                  {transactions.length === 0 ? (
                    <div className="report-empty-chart">
                      <p>No expense data available for the selected period.</p>
                    </div>
                  ) : (
                    <BarChart width={600} height={300} data={monthlySpending} margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="chart-tooltip">
                              <div>{data.month}</div>
                              <div><span style={{ color: "#ef4444" }}>\u25CF</span> Spent: {money(data.spending)}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                      />
                      <Legend />
                      <Bar dataKey="spending" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </div>
              </div>
            </section>

            <section className="card chart-card" aria-labelledby="category-breakdown-title">
              <div className="card-header">
                <div>
                  <h2 id="category-breakdown-title" className="card-title">Spending by Category</h2>
                  <p className="card-subtitle">Where your money goes</p>
                </div>
              </div>
              <div className="card-content" style={{ padding: 0 }}>
                <div className="chart-wrapper">
                  {totalCategorySpending === 0 ? (
                    <div className="report-empty-chart">
                      <p>No expense data available for category analysis.</p>
                    </div>
                  ) : (
                    <>
                      <PieChart width={400} height={400}>
                        <Pie
                          data={expenseByCategory}
                          dataKey="amount"
                          nameKey="category"
                          cx={200}
                          cy={200}
                          innerRadius={80}
                          outerRadius={140}
                          label
                        >
                          {expenseByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || "#94a3b8"} />
                          ))}
                        </Pie>
                        <Tooltip content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const pct = totalCategorySpending > 0 ? ((data.amount / totalCategorySpending) * 100).toFixed(1) : 0;
                            return (
                              <div className="chart-tooltip">
                                <div>{data.category}</div>
                                <div>{money(data.amount)}</div>
                                <div>{pct}% of spending</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                        />
                      </PieChart>
                      <div className="breakdown-legend">
                        {expenseByCategory.map((entry) => {
                          const pct = totalCategorySpending > 0 ? ((entry.amount / totalCategorySpending) * 100).toFixed(1) : 0;
                          return (
                            <div key={entry.category} className="legend-item">
                              <span className="legend-dot" style={{ backgroundColor: CATEGORY_COLORS[entry.category] || "#94a3b8" }} />
                              <span className="legend-label">{entry.category}</span>
                              <span className="legend-value">{money(entry.amount)} ({pct}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Budget Overview */}
          <section className="card" aria-labelledby="budget-overview-title">
            <div className="card-header page-heading-row">
              <div>
                <h2 id="budget-overview-title" className="card-title">Budget Overview</h2>
                <p className="card-subtitle">Track spending against your budget limits</p>
              </div>
              {budgets.length > 0 && <Link to="/budgets" className="btn btn-ghost btn-sm">Manage Budgets</Link>}
            </div>
            <div className="card-content">
              {budgets.length === 0 ? (
                <div className="budget-empty-state">
                  <div className="budget-empty-icon">&#128203;</div>
                  <h2>No budgets created yet</h2>
                  <p>Create a budget to track your spending against limits.</p>
                  <Link to="/budgets" className="btn btn-primary">Create Your First Budget</Link>
                </div>
              ) : (
                <div className="budget-list">
                  {budgetOverview.map((budget) => {
                    const exceeded = budget.percentage >= 100;
                    const nearLimit = budget.percentage >= 80 && budget.percentage < 100;
                    return (
                      <div key={budget.id} className="budget-row">
                        <div className="budget-row-info">
                          <div className="budget-row-name">{budget.category}</div>
                          <div className="budget-row-meta">
                            <span>{budget.duration || "Monthly"}</span>
                            <span className={exceeded ? "budget-status-over" : nearLimit ? "budget-status-warning" : "budget-status-safe"}>
                              {exceeded ? "Over budget" : nearLimit ? "Almost reached" : "Within budget"}
                            </span>
                          </div>
                        </div>
                        <div className="budget-row-amounts">
                          <div className="budget-row-amount"><span>Spent</span><div>{money(budget.spent)}</div></div>
                          <div className="budget-row-amount"><span>Remaining</span><div>{money(budget.remaining)}</div></div>
                        </div>
                        <div className="budget-row-progress">
                          <div className="progress-bar">
                            <div
                              className={`progress-fill ${exceeded ? "budget-over-limit" : nearLimit ? "progress-warning" : "progress-safe"}`}
                              style={{ width: `${Math.min(Math.max(budget.percentage, 0), 100)}%` }}
                            />
                          </div>
                          <div className="budget-row-percent">{budget.percentage.toFixed(1)}% used</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Recent Transactions */}
          <section className="card" aria-labelledby="recent-transactions-title">
            <div className="card-header page-heading-row">
              <div>
                <h2 id="recent-transactions-title" className="card-title">Recent Transactions</h2>
                <p className="card-subtitle">Your latest expenses</p>
              </div>
              <Link to="/transactions" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            <div className="card-content" style={{ padding: 0 }}>
              <div className="table-container" style={{ border: "none", borderRadius: 0, boxShadow: "none" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>Category</th>
                      <th>Budget</th>
                      <th>Date</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction) => {
                        const budget = budgets.find((b) => String(b.id) === String(transaction.budgetId));
                        return (
                          <tr key={transaction.id}>
                            <td><strong>{transaction.title}</strong>{transaction.description && <div className="transaction-note">{transaction.description}</div>}</td>
                            <td>{transaction.category || "Other"}</td>
                            <td>{budget ? budget.category : "—"}</td>
                            <td style={{ color: "var(--color-text-secondary)" }}>{transaction.date || "—"}</td>
                            <td className="expense">
                              −{money(transaction.amount)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", padding: "var(--spacing-10)", color: "var(--color-text-tertiary)" }}>
                          <div className="empty-state" style={{ padding: 0 }}>
                            <div className="empty-state-icon">&#128198;</div>
                            <p className="empty-state-title">No transactions yet</p>
                            <p className="empty-state-description">Start by adding your first expense.</p>
                            <Link to="/add-transaction" className="btn btn-primary">Add Expense</Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Overspending Alerts */}
          {overspendingAlerts.length > 0 && (
            <section className="card" aria-labelledby="overspending-title">
              <div className="card-header">
                <div>
                  <h2 id="overspending-title" className="card-title">Overspending Alerts</h2>
                  <p className="card-subtitle">Budgets that have been exceeded</p>
                </div>
              </div>
              <div className="card-content">
                <div className="insights-list">
                  {overspendingAlerts.map((budget) => (
                    <div key={budget.id} className="insight-item">
                      <div className="insight-dot" style={{ background: "#ef4444" }} />
                      <p className="insight-text">
                        You have exceeded your <strong>{budget.category}</strong> budget by <strong>{money(Math.abs(budget.remaining))}</strong> ({budget.percentage.toFixed(1)}% used).
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Top Spending Categories */}
          {topCategories.length > 0 && (
            <section className="card" aria-labelledby="top-categories-title">
              <div className="card-header">
                <div>
                  <h2 id="top-categories-title" className="card-title">Top Spending Categories</h2>
                  <p className="card-subtitle">Your highest expense categories</p>
                </div>
              </div>
              <div className="card-content">
                <div className="insights-list">
                  {topCategories.map((category) => (
                    <div key={category.category} className="insight-item">
                      <div className="insight-dot" style={{ background: CATEGORY_COLORS[category.category] || "#94a3b8" }} />
                      <div style={{ flex: 1 }}>
                        <p className="insight-text" style={{ margin: 0, display: "flex", justifyContent: "space-between" }}>
                          <span>{category.category}</span>
                          <span>{money(category.amount)}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
