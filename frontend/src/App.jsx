import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Schedules from "./pages/Schedules";
import Furnaces from "./pages/Furnaces";
import Materials from "./pages/Materials";
import Inspections from "./pages/Inspections";

const NAV = [
  { id: "dashboard",   label: "Production analytics",   icon: "📊", view: <Dashboard /> },
  { id: "schedules",   label: "Production scheduling",   icon: "📅", view: <Schedules /> },
  { id: "furnaces",    label: "Furnace monitoring",      icon: "🔥", view: <Furnaces /> },
  { id: "materials",   label: "Raw material tracking",   icon: "📦", view: <Materials /> },
  { id: "inspections", label: "Quality inspection",      icon: "🔬", view: <Inspections /> },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const current = NAV.find((n) => n.id === page);

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">⚙</span>
          <span className="brand-name">Steel Plant<br />Operations</span>
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
        <div className="sidebar-footer">Steel MMS v1.0</div>
      </aside>

      {/* ── Main content — key forces re-mount on tab switch ── */}
      <main className="main-content" key={page}>
        {current.view}
      </main>
    </div>
  );
}
