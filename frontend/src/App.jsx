import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Schedules from "./pages/Schedules";
import Furnaces from "./pages/Furnaces";
import Materials from "./pages/Materials";
import Inspections from "./pages/Inspections";
import Auth from "./pages/Auth";
import LowStock from "./pages/LowStock";
import InspectionReport from "./pages/InspectionReport";

const NAV = [
  { id: "dashboard",         label: "Production analytics",   icon: "📊", view: <Dashboard /> },
  { id: "schedules",         label: "Production scheduling",   icon: "📅", view: <Schedules /> },
  { id: "furnaces",          label: "Furnace monitoring",      icon: "🔥", view: <Furnaces /> },
  { id: "materials",         label: "Raw material tracking",   icon: "📦", view: <Materials /> },
  { id: "inspections",       label: "Quality inspection",      icon: "🔬", view: <Inspections /> },
  { id: "lowstock",          label: "Stock alerts",            icon: "⚠️",  view: <LowStock /> },
  { id: "inspectionreport",  label: "Inspection report",       icon: "🖨️",  view: <InspectionReport /> },
];

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("steel_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState("dashboard");
  const current = NAV.find((n) => n.id === page);

  function handleLogout() {
    localStorage.removeItem("steel_token");
    localStorage.removeItem("steel_user");
    setUser(null);
  }

  // If not logged in, show the Auth screen
  if (!user) {
    return <Auth onAuthSuccess={(authenticatedUser) => setUser(authenticatedUser)} />;
  }

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">⚙</span>
          <span className="brand-name">Steel Plant<br />Operations</span>
        </div>

        {/* User Profile Pill in Sidebar */}
        <div className="sidebar-user-pill">
          <div className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-badge">{user.role || "Operator"}</span>
          </div>
        </div>

        <nav>
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${page === n.id ? "active" : ""}`}
              onClick={() => setPage(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-meta">
            <span>Steel MMS v1.0</span>
            <span className="user-dept">{user.department || "Operations"}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Sign Out">
            <span>Sign Out</span> ➔
          </button>
        </div>
      </aside>

      {/* ── Main content — key forces re-mount on tab switch ── */}
      <main className="main-content" key={page}>
        {current.view}
      </main>
    </div>
  );
}
