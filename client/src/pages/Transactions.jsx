import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useTransactions } from "../context/TransactionContext";

const PAGE_SIZE = 10;
const money = (value) => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const getBudgetName = (budgetId, budgets) => {
  const budget = budgets.find((item) => String(item.id) === String(budgetId));
  return budget ? `${budget.category} (${(budget.duration || "month").charAt(0).toUpperCase()}${(budget.duration || "month").slice(1)})` : "—";
};

export default function Transactions() {
  const { transactions, budgets, deleteTransaction } = useTransactions();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [requestError, setRequestError] = useState("");
  const categories = useMemo(() => [...new Set(transactions.map((item) => item.category).filter(Boolean))].sort(), [transactions]);
  const updateSearch = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("search", value);
    else next.delete("search");
    setSearchParams(next, { replace: true });
    setPage(1);
  };
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return transactions
      .filter((item) => item.type === "expense")
      .filter((item) => (category === "all" || item.category === category))
      .filter((item) => !query || `${item.title} ${item.category} ${item.description || ""} ${getBudgetName(item.budgetId, budgets)}`.toLowerCase().includes(query))
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [transactions, budgets, search, category]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const clear = () => { setSearchParams({}, { replace: true }); setCategory("all"); setPage(1); };
  const remove = async (id) => {
    if (!window.confirm("Delete this transaction? This cannot be undone.")) return;
    try {
      await deleteTransaction(id);
      setRequestError("");
    } catch (error) {
      setRequestError(error.response?.data?.message || "Could not delete this expense.");
    }
  };

  return <div className="dashboard-layout"><Sidebar /><main className="main-content"><Navbar /><div className="dashboard-content">
    <div className="dashboard-heading page-heading-row"><div><h1>Transactions</h1><p>Manage all your expenses.</p></div><Link to="/add-transaction" className="btn btn-primary">+ Add expense</Link></div>
    {requestError && <p className="form-error" role="alert">{requestError}</p>}
    <section className="filter-container" aria-label="Filter transactions">
      <input className="filter-input" type="search" placeholder="Search title, category or note" value={search} aria-label="Search expenses" onChange={(e) => updateSearch(e.target.value)} />
      <select className="filter-select" value={category} aria-label="Filter by category" onChange={(e) => { setCategory(e.target.value); setPage(1); }}><option value="all">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
      <button className="clear-filter-btn" type="button" onClick={clear}>Clear filters</button>
    </section>
    <section className="card" aria-label="Transaction list"><div className="card-header"><div><h2 className="card-title">All transactions</h2><p className="card-subtitle">{filtered.length} {filtered.length === 1 ? "transaction" : "transactions"}</p></div></div>
      <div className="table-container transaction-table-wrap"><table><thead><tr><th scope="col">Transaction</th><th scope="col">Category</th><th scope="col">Budget</th><th scope="col">Date</th><th scope="col">Amount</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead><tbody>
        {visible.map((item) => <tr key={item.id}><td><strong>{item.title}</strong>{item.description && <div className="transaction-note">{item.description}</div>}</td><td>{item.category || "Other"}</td><td>{getBudgetName(item.budgetId, budgets)}</td><td>{item.date || "—"}</td><td className="expense">−{money(item.amount)}</td><td><div className="table-actions"><Link className="btn btn-ghost btn-sm" to={`/edit-transaction/${item.id}`} aria-label={`Edit ${item.title}`}>Edit</Link><button className="btn btn-ghost btn-sm nav-link-danger" type="button" onClick={() => remove(item.id)} aria-label={`Delete ${item.title}`}>Delete</button></div></td></tr>)}
        {visible.length === 0 && <tr><td colSpan="6"><div className="transaction-empty"><h3>{transactions.length ? (search.trim() ? "No expenses found" : "No matching expenses") : "No transactions yet"}</h3><p>{transactions.length ? (search.trim() ? `We couldn’t find any expenses matching “${search.trim()}”. Try another search or clear your filters.` : "Try changing or clearing your filters.") : "Add your first expense to start tracking your finances."}</p>{!transactions.length && <Link to="/add-transaction" className="btn btn-primary">Add expense</Link>}</div></td></tr>}
      </tbody></table></div>
      {filtered.length > PAGE_SIZE && <div className="pagination" aria-label="Transaction pages"><button className="pagination-btn" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button><span className="pagination-info">Page {currentPage} of {pageCount}</span><button className="pagination-btn" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Next</button></div>}
    </section>
  </div></main></div>;
}
