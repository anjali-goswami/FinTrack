import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useTransactions } from "../context/TransactionContext";
import { ALL_CATEGORIES, getBudgetSpent } from "../utils/budgetUtils";

const DURATIONS = [
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
];

const categories = ["Food", "Shopping", "Transportation", "Entertainment", "Utilities", "Healthcare", "Education", "Other"];
const money = (value) => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function Budgets() {
  const { transactions, budgets, addBudget, deleteBudget, updateBudget } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ category: "", duration: "month", limit: "" });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError("");
    setFormData({ category: "", duration: "month", limit: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const limit = Number(formData.limit);
    if (!formData.category || !Number.isFinite(limit) || limit <= 0) {
      setError("Choose a category and enter an amount greater than zero.");
      return;
    }
    const duplicate = budgets.some((budget) => budget.category === formData.category
      && (budget.duration || "month") === formData.duration && String(budget.id) !== String(editingId));
    if (duplicate) {
      setError(`A ${formData.duration} budget already exists for this selection.`);
      return;
    }
    const budget = { ...formData, limit };
    try {
      if (editingId !== null) await updateBudget(editingId, budget);
      else await addBudget(budget);
      resetForm();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save this budget.");
    }
  };

  const handleEdit = (budget) => {
    setFormData({ category: budget.category, duration: budget.duration || "month", limit: String(budget.limit) });
    setEditingId(budget.id);
    setError("");
    setShowForm(true);
  };

  const summaries = DURATIONS.map(({ value, label }) => {
    const periodBudgets = budgets.filter((budget) => (budget.duration || "month") === value);
    if (!periodBudgets.length) return null;
    const categoryBudgets = periodBudgets.filter((budget) => budget.category !== ALL_CATEGORIES);
    const included = categoryBudgets.length
      ? categoryBudgets
      : periodBudgets.filter((budget) => budget.category === ALL_CATEGORIES);
    const limit = included.reduce((sum, budget) => sum + Number(budget.limit || 0), 0);
    const spent = included.reduce((sum, budget) => sum + getBudgetSpent(budget, transactions), 0);
    return { label, limit, spent, remaining: limit - spent };
  }).filter(Boolean);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <div className="dashboard-content">
          <div className="dashboard-heading">
            <h1>Budgets</h1>
            <p>Set spending limits by category or track all expenses together.</p>
          </div>

          {!showForm && <div className="budget-top-actions">
            <button className="btn btn-primary" type="button" onClick={() => { resetForm(); setShowForm(true); }}>+ Create Budget</button>
          </div>}
          {error && !showForm && <p className="form-error" role="alert">{error}</p>}

          {showForm && <section className="card transaction-form-card budget-form-card" aria-labelledby="budget-form-title">
            <header className="card-header"><div>
              <h2 id="budget-form-title" className="card-title">{editingId !== null ? "Edit Budget" : "Create Budget"}</h2>
              <p className="card-subtitle">Choose what to track and set a spending limit.</p>
            </div></header>
            <div className="card-content">
            <form onSubmit={handleSubmit} className="transaction-form">
              <div className="form-row">
              <div className="form-group">
                <label htmlFor="budget-category" className="form-label form-label-required">Budget category</label>
                <select id="budget-category" name="category" className="form-select" value={formData.category} onChange={(event) => { setFormData({ ...formData, category: event.target.value }); setError(""); }} required>
                  <option value="">Select a category</option>
                  <option value={ALL_CATEGORIES}>All categories (overall)</option>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="budget-duration" className="form-label form-label-required">Budget duration</label>
                <select id="budget-duration" name="duration" className="form-select" value={formData.duration} onChange={(event) => { setFormData({ ...formData, duration: event.target.value }); setError(""); }}>
                  {DURATIONS.map((duration) => <option key={duration.value} value={duration.value}>{duration.label}</option>)}
                </select>
              </div>
              </div>
              <div className="form-group">
                <label htmlFor="budget-limit" className="form-label form-label-required">{formData.duration === "week" ? "Weekly" : formData.duration === "year" ? "Yearly" : "Monthly"} limit (₹)</label>
                <div className="input-with-icon">
                  <span className="input-prefix">₹</span>
                  <input id="budget-limit" className="form-input" type="number" name="limit" placeholder="0.00" value={formData.limit} onChange={(event) => { setFormData({ ...formData, limit: event.target.value }); setError(""); }} min="0.01" step="0.01" required />
                </div>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-lg">{editingId !== null ? "Save changes" : "Create budget"}</button>
              </div>
            </form>
            </div>
          </section>}

          {summaries.length > 0 && !showForm && <div className="summary-grid">
            {summaries.map((summary) => <article className="summary-card balance" key={summary.label}>
              <div className="summary-card-info"><p>{summary.label} budget</p><h2>{money(summary.limit)}</h2><p className="budget-summary-detail">Spent {money(summary.spent)} · Remaining {money(summary.remaining)}</p></div>
            </article>)}
          </div>}

          {budgets.length > 0 && !showForm ? <div className="budget-grid">
            {budgets.map((budget) => {
              const duration = budget.duration || "month";
              const spent = getBudgetSpent(budget, transactions);
              const limit = Number(budget.limit || 0);
              const remaining = limit - spent;
              const percentage = limit > 0 ? (spent / limit) * 100 : 0;
              const exceeded = remaining < 0;
              const label = DURATIONS.find((item) => item.value === duration)?.label || "Monthly";
              return <article className="budget-card" key={budget.id}>
                <div className="budget-card-header"><div><h3>{budget.category === ALL_CATEGORIES ? "All categories" : budget.category}</h3><span className="budget-duration-badge">{label}</span></div>
                  <div className="budget-card-actions"><button type="button" onClick={() => handleEdit(budget)} className="edit-btn">Edit</button><button type="button" onClick={async () => { if (window.confirm("Delete this budget?")) { try { await deleteBudget(budget.id); } catch (requestError) { setError(requestError.response?.data?.message || "Could not delete this budget."); } } }} className="delete-btn">Delete</button></div>
                </div>
                <p className="budget-limit-text">{label} limit: {money(limit)}</p>
                <div className="budget-details"><p>Spent: <strong>{money(spent)}</strong></p><p>Remaining: <strong>{money(remaining)}</strong></p></div>
                <div className="progress-bar" role="progressbar" aria-label={`${budget.category} budget used`} aria-valuenow={Math.max(0, Math.min(percentage, 100))} aria-valuemin="0" aria-valuemax="100"><div className={`progress-fill ${exceeded ? "budget-over-limit" : "green"}`} style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }} /></div>
                <div className="budget-footer"><span>{percentage.toFixed(1)}% used</span><span className={exceeded ? "budget-warning" : "budget-safe"}>{exceeded ? "Budget exceeded" : "Within budget"}</span></div>
              </article>;
            })}
          </div> : !showForm && <div className="budget-empty-state"><div className="budget-empty-icon">◎</div><h2>No budgets created yet</h2><p>Create a category budget or an All categories budget to track total spending.</p><button className="btn btn-primary" type="button" onClick={() => setShowForm(true)}>+ Create Your First Budget</button></div>}
        </div>
      </main>
    </div>
  );
}
