
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddTransaction from "./pages/AddTransaction";
import EditTransaction from "./pages/EditTransaction";

import { TransactionProvider, useTransactions } from "./context/TransactionContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const accountData = useTransactions();
  if (loading) return <div className="app-loading" role="status">Loading your account…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (accountData.loading) return <div className="app-loading" role="status">Loading your financial data…</div>;
  if (accountData.error) return <main className="app-loading"><p role="alert">{accountData.error}</p><button className="btn btn-primary" type="button" onClick={() => window.location.reload()}>Retry</button></main>;
  return children;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading" role="status">Loading your account…</div>;
  return user ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/transactions" element={<RequireAuth><Transactions /></RequireAuth>} />
      <Route path="/budgets" element={<RequireAuth><Budgets /></RequireAuth>} />
      <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
      <Route path="/add-transaction" element={<RequireAuth><AddTransaction /></RequireAuth>} />
      <Route path="/edit-transaction/:id" element={<RequireAuth><EditTransaction /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return <AuthProvider><BrowserRouter><TransactionProvider><AppRoutes /></TransactionProvider></BrowserRouter></AuthProvider>;
}

export default App;
