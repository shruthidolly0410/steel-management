import { useState, useEffect } from "react";
import api from "../api";

// ── Urgency helpers ────────────────────────────────────────────────────────────
function getUrgency(m) {
  if (m.stockTons === 0)                         return "critical";
  if (m.stockTons <= m.reorderLevel * 0.5)       return "danger";
  return "warning";
}

const URGENCY_META = {
  critical: { label: "OUT OF STOCK", cls: "urg-critical", color: "var(--bad)"  },
  danger:   { label: "CRITICAL",     cls: "urg-danger",   color: "#c05621"      },
  warning:  { label: "LOW STOCK",    cls: "urg-warning",  color: "var(--warn)"  },
};

function StockBar({ stockTons, reorderLevel }) {
  const max   = Math.max(reorderLevel * 2, stockTons, 1);
  const pct   = Math.min((stockTons / max) * 100, 100);
  const roPct = Math.min((reorderLevel / max) * 100, 100);
  return (
    <div className="stock-bar-wrap">
      <div className="stock-bar-track">
        <div
          className="stock-bar-fill"
          style={{ width: `${pct}%`, background: stockTons === 0 ? "var(--bad)" : pct < 30 ? "#c05621" : "var(--warn)" }}
        />
        {/* Reorder level marker */}
        <div className="stock-bar-marker" style={{ left: `${roPct}%` }} title="Reorder level" />
      </div>
      <div className="stock-bar-legend">
        <span>{stockTons} t stock</span>
        <span className="muted">Reorder at {reorderLevel} t</span>
      </div>
    </div>
  );
}

function RecommendCard({ label, value, sub, color }) {
  return (
    <div className="ls-stat-card" style={{ borderTopColor: color }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function LowStock() {
  const [materials, setMaterials] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [lastFetch, setLastFetch] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.list("materials");
      setMaterials(data);
      setLastFetch(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Compute derived data
  const lowStock = materials
    .filter(m => m.stockTons <= m.reorderLevel)
    .map(m => ({ ...m, urgency: getUrgency(m) }))
    .sort((a, b) => {
      const order = { critical: 0, danger: 1, warning: 2 };
      return order[a.urgency] - order[b.urgency];
    });

  const criticalCount = lowStock.filter(m => m.urgency === "critical").length;
  const dangerCount   = lowStock.filter(m => m.urgency === "danger").length;
  const recommendedQty = lowStock.reduce((sum, m) => {
    const target = m.reorderLevel * 3;
    return sum + Math.max(0, target - m.stockTons);
  }, 0);

  return (
    <div className="crud-page">
      <div className="page-header">
        <h1>⚠ Stock Alert Dashboard</h1>
        <p className="hint">
          Materials at or below reorder threshold — action required
          {lastFetch && (
            <span className="muted"> · Last updated {lastFetch.toLocaleTimeString("en-IN")}</span>
          )}
        </p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* ── Summary stat cards ── */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <RecommendCard
          label="Materials Below Threshold"
          value={lowStock.length}
          sub={`of ${materials.length} total materials tracked`}
          color="var(--warn)"
        />
        <RecommendCard
          label="Out of Stock / Critical"
          value={criticalCount + dangerCount}
          sub={criticalCount > 0 ? `${criticalCount} completely depleted` : "None fully depleted"}
          color={criticalCount > 0 ? "var(--bad)" : "#c05621"}
        />
        <RecommendCard
          label="Total Reorder Quantity"
          value={`${recommendedQty.toLocaleString()} t`}
          sub="Recommended purchase (3× reorder level)"
          color="var(--heat)"
        />
        <RecommendCard
          label="Normal Stock Items"
          value={materials.length - lowStock.length}
          sub="No immediate action needed"
          color="var(--ok)"
        />
      </div>

      {loading ? (
        <p className="muted loading-msg">Loading stock levels…</p>
      ) : lowStock.length === 0 ? (
        <div className="panel">
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h2 style={{ color: "var(--ok)", borderBottom: "none", marginBottom: 6 }}>All Stock Levels Normal</h2>
            <p className="muted">No materials are currently below their reorder threshold.</p>
          </div>
        </div>
      ) : (
        <>
          {/* ── Alert banner for critical items ── */}
          {criticalCount > 0 && (
            <div className="alert-error" style={{ marginBottom: 16, fontWeight: 600 }}>
              🚨 IMMEDIATE ACTION REQUIRED: {criticalCount} material{criticalCount > 1 ? "s" : ""} completely depleted
              ({lowStock.filter(m => m.urgency === "critical").map(m => m.name).join(", ")})
            </div>
          )}

          {/* ── Alert cards grouped by urgency ── */}
          {["critical", "danger", "warning"].map(urgLevel => {
            const group = lowStock.filter(m => m.urgency === urgLevel);
            if (!group.length) return null;
            const meta = URGENCY_META[urgLevel];
            return (
              <div key={urgLevel} className="panel" style={{ marginBottom: 20 }}>
                <h2 style={{ color: meta.color }}>
                  {urgLevel === "critical" ? "🔴" : urgLevel === "danger" ? "🟠" : "🟡"} {meta.label} ({group.length})
                </h2>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Supplier</th>
                        <th>Current Stock</th>
                        <th>Reorder Level</th>
                        <th>Stock Level</th>
                        <th>Recommended Order</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.map(m => {
                        const recommended = Math.max(0, (m.reorderLevel * 3) - m.stockTons);
                        return (
                          <tr key={m._id}>
                            <td><strong>{m.name}</strong></td>
                            <td>{m.supplier || <span className="muted">—</span>}</td>
                            <td>
                              <span style={{ color: meta.color, fontWeight: 700 }}>
                                {m.stockTons} t
                              </span>
                            </td>
                            <td>{m.reorderLevel} t</td>
                            <td style={{ minWidth: 200 }}>
                              <StockBar stockTons={m.stockTons} reorderLevel={m.reorderLevel} />
                            </td>
                            <td>
                              <span style={{ fontWeight: 600, color: "var(--heat)" }}>
                                {recommended} t
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${meta.cls}`}>{meta.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* ── Action checklist ── */}
          <div className="panel">
            <h2>📋 Recommended Purchase Orders</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Material</th>
                    <th>Current Stock</th>
                    <th>Order Quantity (3× reorder)</th>
                    <th>Supplier</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((m, idx) => {
                    const meta = URGENCY_META[m.urgency];
                    const qty  = Math.max(0, (m.reorderLevel * 3) - m.stockTons);
                    return (
                      <tr key={m._id}>
                        <td className="muted">{idx + 1}</td>
                        <td><strong>{m.name}</strong></td>
                        <td>{m.stockTons} t</td>
                        <td style={{ fontWeight: 600 }}>{qty} t</td>
                        <td>{m.supplier || <span className="muted">Contact procurement</span>}</td>
                        <td><span className={`badge ${meta.cls}`}>{meta.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
              <button className="btn-primary" onClick={load}>↻ Refresh</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
