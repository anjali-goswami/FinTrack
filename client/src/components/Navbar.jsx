import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const pageTitles = {
  "/": "Dashboard",
  "/transactions": "Transactions",
  "/budgets": "Budgets",
  "/reports": "Reports",
  "/login": "Login",
  "/register": "Register",
  "/add-transaction": "Add Transaction",
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const title = pageTitles[location.pathname] || (location.pathname.startsWith("/edit-transaction") ? "Edit Transaction" : "FinTrack");
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleSidebar = () => window.dispatchEvent(new Event("toggle-sidebar"));
  const searchQuery = searchParams.get("search") || "";
  const updateSearch = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("search", value);
    else next.delete("search");
    setSearchParams(next, { replace: true });
  };
  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate({ pathname: "/transactions", search: query ? `?search=${encodeURIComponent(query)}` : "" });
  };
  const initials = (user?.name || user?.email || "U").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="mobile-menu-btn" type="button" onClick={toggleSidebar} aria-label="Open navigation menu">
          <Icon d="M3 6h18M3 12h18M3 18h18" />
        </button>
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="navbar-center">
        <form className="navbar-search" role="search" onSubmit={submitSearch}>
          <span className="navbar-search-icon"><Icon d="M21 21l-4.35-4.35M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0z" /></span>
          <input className="navbar-search-input" type="search" aria-label="Search expenses" placeholder="Search expenses..." value={searchQuery} onChange={(event) => updateSearch(event.target.value)} />
          <button className="navbar-search-submit" type="submit" aria-label="Show matching expenses"><Icon d="M5 12h14M13 6l6 6-6 6" /></button>
        </form>
      </div>
      <div className="navbar-right">
        <div className="dropdown">
          <button className="navbar-user-avatar" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="User menu" aria-expanded={menuOpen}>{initials}</button>
          {menuOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item" aria-label="Signed in account">{user?.email}</div>
              <div className="dropdown-divider" />
              <button className="dropdown-item danger" type="button" onClick={handleLogout}>Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
