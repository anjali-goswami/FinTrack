import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useTransactions } from "../context/TransactionContext";
import { ALL_CATEGORIES, getBudgetRemaining, canAffordBudget } from "../utils/budgetUtils";

const money = (value) => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const AddTransaction = () => {
  const navigate = useNavigate();
  const { addTransaction, budgets, transactions } = useTransactions();

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    budgetId: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [budgetWarning, setBudgetWarning] = useState(null);
  const [proceedAnyway, setProceedAnyway] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  const matchingBudgets = useMemo(() => {
    return budgets.filter((budget) =>
      budget.category === formData.category || budget.category === ALL_CATEGORIES,
    );
  }, [budgets, formData.category]);

  const selectedBudget = budgets.find((b) => String(b.id) === String(formData.budgetId));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((previousData) => {
      const nextData = { ...previousData, [name]: value };
      if (name === "category") {
        nextData.budgetId = "";
        const available = budgets.filter((budget) =>
          budget.category === value || budget.category === ALL_CATEGORIES,
        );
        if (available.length === 1) {
          nextData.budgetId = String(available[0].id);
        }
      }
      return nextData;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "amount" || name === "budgetId") {
      setBudgetWarning(null);
      setProceedAnyway(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Transaction title is required";
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.date) {
      newErrors.date = "Please select a date";
    }

    if (budgets.length === 0) {
      newErrors.budgetId = "No budgets exist. Create a budget first before adding an expense.";
    } else if (matchingBudgets.length === 0) {
      newErrors.budgetId = "No budget matches this category. Create one on the Budgets page.";
    } else if (!formData.budgetId && !proceedAnyway) {
      newErrors.budgetId = "Choose which budget this expense belongs to.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBudgetBlur = () => {
    if (formData.budgetId && formData.amount && selectedBudget) {
      const amount = Number(formData.amount);
      const remaining = getBudgetRemaining(selectedBudget, transactions);
      if (remaining < amount && !proceedAnyway) {
        setBudgetWarning({
          budget: selectedBudget,
          amount,
          remaining,
          exceeded: amount - remaining,
        });
      } else {
        setBudgetWarning(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.budgetId && selectedBudget && !proceedAnyway) {
      const amount = Number(formData.amount);
      const remaining = getBudgetRemaining(selectedBudget, transactions);
      if (remaining < amount) {
        setBudgetWarning({
          budget: selectedBudget,
          amount,
          remaining,
          exceeded: amount - remaining,
        });
        return;
      }
    }

    if (!validateForm()) return;

    try {
      await addTransaction({
        ...formData,
        type: "expense",
        amount: Number(formData.amount),
        budgetId: formData.budgetId,
      });
      setSubmitMessage({ type: "success", text: "Expense saved successfully." });
      setTimeout(() => navigate("/transactions"), 900);
    } catch (error) {
      setSubmitMessage({ type: "error", text: error.response?.data?.message || "Could not save this expense." });
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <div className="dashboard-content">
          <div className="dashboard-heading page-heading-row">
            <div>
              <h1>Add Expense</h1>
              <p>Record a new expense and link it to a budget.</p>
            </div>
            <Link to="/transactions" className="btn btn-ghost">← Back to Transactions</Link>
          </div>

          {submitMessage && (
            <div className={`alert alert-${submitMessage.type}`} role="alert">
              {submitMessage.text}
            </div>
          )}

          <section className="card transaction-form-card">
            <div className="card-content">
              <form onSubmit={handleSubmit} className="transaction-form" noValidate>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="title" className="form-label form-label-required">
                      Expense Title
                    </label>
                    <input
                      id="title"
                      name="title"
                      placeholder="e.g. Grocery Shopping"
                      value={formData.title}
                      onChange={handleChange}
                      className={`form-input ${errors.title ? "error" : ""}`}
                      required
                      aria-invalid={errors.title ? "true" : "false"}
                      aria-describedby={errors.title ? "title-error" : undefined}
                    />
                    {errors.title && (
                      <p id="title-error" className="form-error" role="alert">{errors.title}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="amount" className="form-label form-label-required">
                      Amount (₹)
                    </label>
                    <div className="input-with-icon">
                      <span className="input-prefix">₹</span>
                      <input
                        id="amount"
                        name="amount"
                        type="number"
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleChange}
                        onBlur={handleBudgetBlur}
                        className={`form-input ${errors.amount ? "error" : ""}`}
                        required
                        aria-invalid={errors.amount ? "true" : "false"}
                        aria-describedby={errors.amount ? "amount-error" : undefined}
                      />
                    </div>
                    {errors.amount && (
                      <p id="amount-error" className="form-error" role="alert">{errors.amount}</p>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="category" className="form-label form-label-required">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`form-select ${errors.category ? "error" : ""}`}
                    required
                    aria-invalid={errors.category ? "true" : "false"}
                    aria-describedby={errors.category ? "category-error" : undefined}
                  >
                    <option value="">Select Category</option>
                    <option value="Food">Food</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.category && (
                    <p id="category-error" className="form-error" role="alert">{errors.category}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="budgetId" className="form-label form-label-required">
                    Select Budget
                  </label>
                  {budgets.length === 0 && (
                    <div className="budget-empty-hint">
                      <Icon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" size={14} />
                      No budgets created yet. <Link to="/budgets" className="budget-create-link">Create your first budget</Link> before adding an expense.
                    </div>
                  )}
                  {budgets.length > 0 && matchingBudgets.length === 0 && (
                    <div className="budget-empty-hint">
                      <Icon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" size={14} />
                      No budget matches the "{formData.category}" category. Create one on the <Link to="/budgets" className="budget-create-link">Budgets page</Link>.
                    </div>
                  )}
                  {matchingBudgets.length > 0 && (
                    <select
                      id="budgetId"
                      name="budgetId"
                      value={formData.budgetId}
                      onChange={handleChange}
                      className={`form-select ${errors.budgetId ? "error" : ""}`}
                      aria-invalid={Boolean(errors.budgetId)}
                      aria-describedby={errors.budgetId ? "budget-error" : undefined}
                    >
                      <option value="">Choose a budget</option>
                      {matchingBudgets.map((budget) => {
                        const remaining = getBudgetRemaining(budget, transactions);
                        const canAfford = canAffordBudget(budget, formData.amount || 0, transactions);
                        return (
                          <option
                            key={budget.id}
                            value={budget.id}
                            disabled={!canAfford && !proceedAnyway}
                          >
                            {budget.category === ALL_CATEGORIES ? "All Categories" : budget.category}
                            {" • "}
                            {budget.duration || "Monthly"}
                            {" • Remaining: "}
                            {money(remaining)}
                          </option>
                        );
                      })}
                    </select>
                  )}
                  {errors.budgetId && (
                    <p id="budget-error" className="form-error" role="alert">{errors.budgetId}</p>
                  )}
                  {formData.category && matchingBudgets.length > 0 && budgets.length > 0 && !errors.budgetId && (
                    <p className="form-hint">Select the budget this expense will be deducted from.</p>
                  )}
                </div>

                {budgetWarning && !proceedAnyway && (
                  <div className="budget-warning-banner">
                    <Icon d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    <div>
                      <div className="budget-warning-title">Insufficient budget balance</div>
                      <div className="budget-warning-detail">
                        Selecting <strong>{budgetWarning.budget.category}</strong> would exceed its remaining balance by <strong>{money(budgetWarning.exceeded)}</strong> (remaining: {money(budgetWarning.remaining)}, expense: {money(budgetWarning.amount)}).
                      </div>
                    </div>
                    <label className="proceed-checkbox">
                      <input
                        type="checkbox"
                        checked={proceedAnyway}
                        onChange={() => setProceedAnyway(!proceedAnyway)}
                      />
                      I understand — proceed anyway
                    </label>
                  </div>
                )}

                {proceedAnyway && budgetWarning && (
                  <div className="budget-confirm-banner">
                    <Icon d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <div>Over-budget expense confirmed. The transaction will still be saved.</div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="date" className="form-label form-label-required">
                    Date
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`form-input ${errors.date ? "error" : ""}`}
                    required
                    max={new Date().toISOString().split("T")[0]}
                    aria-invalid={errors.date ? "true" : "false"}
                    aria-describedby={errors.date ? "date-error" : undefined}
                  />
                  {errors.date && (
                    <p id="date-error" className="form-error" role="alert">{errors.date}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Optional description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-input"
                  />
                  <p className="form-hint">Optional - add any additional details</p>
                </div>

                <div className="form-actions">
                  <Link to="/transactions" className="btn btn-ghost">Cancel</Link>
                  <button type="submit" className="btn btn-primary btn-lg">
                    <Icon d="M5 19L19 5L5 5L5 19" size={16} /> Save Expense
                  </button>
                </div>

              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AddTransaction;
