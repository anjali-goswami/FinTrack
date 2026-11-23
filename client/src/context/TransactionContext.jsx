import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "./AuthContext";

const TransactionContext = createContext(null);
const normalize = (item) => ({
  ...item,
  id: item._id || item.id,
  budgetId: item.budgetId?._id || item.budgetId || "",
});

const bootstrapPromises = new Map();
const loadAccountData = (userId) => {
  if (bootstrapPromises.has(userId)) return bootstrapPromises.get(userId);
  const promise = (async () => {
    const [expenseResponse, budgetResponse, summaryResponse] = await Promise.all([
      api.get("/expenses"),
      api.get("/budgets"),
      api.get("/dashboard"),
    ]);
    return {
      transactions: expenseResponse.data.map(normalize),
      budgets: budgetResponse.data.map(normalize),
      summary: summaryResponse.data,
    };
  })();
  bootstrapPromises.set(userId, promise);
  promise.then(() => bootstrapPromises.delete(userId), () => bootstrapPromises.delete(userId));
  return promise;
};

export function TransactionProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return undefined;
    let active = true;
    if (!user) {
      Promise.resolve().then(() => {
        if (!active) return;
        setTransactions([]);
        setBudgets([]);
        setSummary(null);
        setLoading(false);
        setError("");
      });
      return () => { active = false; };
    }
    Promise.resolve().then(() => {
      if (active) setLoading(true);
      return loadAccountData(user.id);
    }).then((data) => {
      if (!active) return;
      setTransactions(data.transactions);
      setBudgets(data.budgets);
      setSummary(data.summary);
      setError("");
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.message || "Could not load your financial data.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [user, authLoading]);

  const refreshSummary = async () => {
    const { data } = await api.get("/dashboard");
    setSummary(data);
  };

  const addTransaction = async (transaction) => {
    const { data } = await api.post("/expenses", transaction);
    const created = normalize(data);
    setTransactions((items) => [created, ...items]);
    await refreshSummary();
    return created;
  };

  const deleteTransaction = async (id) => {
    await api.delete(`/expenses/${id}`);
    setTransactions((items) => items.filter((item) => String(item.id) !== String(id)));
    await refreshSummary();
  };

  const updateTransaction = async (id, updatedData) => {
    const { data } = await api.put(`/expenses/${id}`, updatedData);
    const updated = normalize(data);
    setTransactions((items) => items.map((item) => String(item.id) === String(id) ? updated : item));
    await refreshSummary();
    return updated;
  };

  const addBudget = async (budget) => {
    const { data } = await api.post("/budgets", budget);
    const created = normalize(data);
    setBudgets((items) => [created, ...items]);
    await refreshSummary();
    return created;
  };

  const deleteBudget = async (id) => {
    await api.delete(`/budgets/${id}`);
    setBudgets((items) => items.filter((item) => String(item.id) !== String(id)));
    await refreshSummary();
  };

  const updateBudget = async (id, updatedData) => {
    const { data } = await api.put(`/budgets/${id}`, updatedData);
    const updated = normalize(data);
    setBudgets((items) => items.map((item) => String(item.id) === String(id) ? updated : item));
    await refreshSummary();
    return updated;
  };

  const value = {
    transactions, budgets, summary, loading, error,
    addTransaction, deleteTransaction, updateTransaction,
    addBudget, deleteBudget, updateBudget,
  };

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTransactions = () => useContext(TransactionContext);
