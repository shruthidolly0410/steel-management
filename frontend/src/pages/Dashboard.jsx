import { useState, useEffect } from "react";
import api from "../api";

function Bars({ data, unit = "" }) {
  const values = Object.values(data);
  const max = Math.max(...values, 1);
  return (
    <ul className="bar-list">
      {Object.entries(data).map(([label, value]) => (
        <li key={label} className="bar-item">
          <div className="bar-label">
            <span>{label}</span>
            <span className="bar-value">{value}{unit}</span>
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.analytics()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert-error">{error}</div>;
  if (!data) return <p className="muted loading-msg">Loading dashboard…</p>;

  const { production, furnaces, materials, quality } = data;
  const pctComplete =
    production.plannedTons > 0
      ? ((production.producedTons / production.plannedTons) * 100).toFixed(1)
      : 0;

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Production Analytics</h1>
        <p className="hint">Real-time overview of plant operations</p>
      </div>

      {/* ── Low-stock alert ── */}
      {materials.lowStock.length > 0 && (
        <div className="alert-warn">
          ⚠ Reorder needed: <strong>{materials.lowStock.join(", ")}</strong>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Production Output</div>
          <div className="stat-value">{production.producedTons.toLocaleString()} t</div>
          <div className="stat-sub">of {production.plannedTons.toLocaleString()} t planned · {pctComplete}% complete</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Furnaces Running</div>
          <div className="stat-value">{furnaces.runningCount} / {furnaces.total}</div>
          <div className="stat-sub">Avg temp {furnaces.avgTemperature} °C</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Raw Material Stock</div>
          <div className="stat-value">{materials.totalStockTons.toLocaleString()} t</div>
          <div className="stat-sub">{materials.totalUsedTons.toLocaleString()} t consumed</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Inspection Pass Rate</div>
          <div className="stat-value">{quality.passRate}%</div>
          <div className="stat-sub">{quality.total} batches inspected</div>
        </div>
      </div>

      {/* ── Chart panels ── */}
      <div className="chart-grid">
        <div className="panel">
          <h2>Orders by Status</h2>
          {Object.keys(production.byStatus).length > 0 ? (
            <Bars data={production.byStatus} unit=" orders" />
          ) : (
            <p className="muted">No data</p>
          )}
        </div>

        <div className="panel">
          <h2>Produced Tons by Product</h2>
          {Object.keys(production.byProduct).length > 0 ? (
            <Bars data={production.byProduct} unit=" t" />
          ) : (
            <p className="muted">No data</p>
          )}
        </div>

        <div className="panel">
          <h2>Inspection Results</h2>
          {quality.total > 0 ? (
            <Bars data={quality.byResult} unit=" batches" />
          ) : (
            <p className="muted">No data</p>
          )}
        </div>
      </div>
    </div>
  );
}
