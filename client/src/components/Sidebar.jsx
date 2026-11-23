import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Icon = ({ d }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;

const navItems = [
  { to: "/", label: "Dashboard", icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" },
  { to: "/transactions", label: "Transactions", icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { to: "/budgets", label: "Budgets", icon: "M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M21 12h-4a2 2 0 0 0 0 4h4" },
  { to: "/reports", label: "Reports", icon: "M3 3v18h18M7 16l4-4 4 4 5-6" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const toggleSidebar = () => setMobileOpen((open) => !open);
    window.addEventListener("toggle-sidebar", toggleSidebar);
    return () => window.removeEventListener("toggle-sidebar", toggleSidebar);
  }, []);

  const closeMobileSidebar = () => setMobileOpen(false);

  return <>
    <button className={`sidebar-overlay ${mobileOpen ? "open" : ""}`} type="button" aria-label="Close navigation menu" onClick={closeMobileSidebar} tabIndex={mobileOpen ? 0 : -1} />
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""}`} aria-label="Main navigation">
      <div className="sidebar-header">
        <NavLink to="/" className="sidebar-logo" onClick={closeMobileSidebar}>
          <div className="sidebar-logo-icon">F</div>
          {(!collapsed || mobileOpen) && <span className="sidebar-logo-text">FinTrack</span>}
        </NavLink>
        <button className="btn btn-ghost btn-icon btn-sm sidebar-collapse-btn" type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed}>
          {collapsed ? "›" : "‹"}
        </button>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          {(!collapsed || mobileOpen) && <div className="nav-section-title">Menu</div>}
          {navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.to === "/"} title={collapsed ? item.label : undefined} onClick={closeMobileSidebar} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <span className="nav-link-icon"><Icon d={item.icon} /></span>
            {(!collapsed || mobileOpen) && <span>{item.label}</span>}
          </NavLink>)}
        </div>
      </nav>
      <div className="sidebar-footer">
        <div className="user-info"><div className="user-avatar">{(user?.name || user?.email || "U").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</div>{(!collapsed || mobileOpen) && <div className="user-details"><div className="user-name">{user?.name || "Account"}</div><div className="user-email">{user?.email}</div></div>}</div>
      </div>
    </aside>
  </>;
}
