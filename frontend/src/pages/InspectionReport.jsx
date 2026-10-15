import { useState, useEffect } from "react";
import api from "../api";

const RESULT_COLOR = { Pass: "var(--ok)", Fail: "var(--bad)", Rework: "var(--warn)" };
const RESULT_ICON  = { Pass: "✅", Fail: "❌", Rework: "🔄" };

function StatPill({ label, value, color }) {
  return (
    <div className="ir-stat-pill" style={{ borderColor: color }}>
      <span className="ir-stat-value" style={{ color }}>{value}</span>
      <span className="ir-stat-label">{label}</span>
    </div>
  );
}

export default function InspectionReport() {
  const [inspections, setInspections]   = useState([]);
  const [selectedHeat, setSelectedHeat] = useState("");
  const [loading,  setLoading]          = useState(true);
  const [error,    setError]            = useState("");

  useEffect(() => {
    api.list("inspections")
      .then(setInspections)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Unique sorted heat numbers
  const heatNumbers = [...new Set(inspections.map(i => i.heatNumber))].sort();

  // All inspections for the selected heat
  const records = selectedHeat
    ? inspections.filter(i => i.heatNumber === selectedHeat)
    : [];

  // Aggregates
  const passCount   = records.filter(i => i.result === "Pass").length;
  const failCount   = records.filter(i => i.result === "Fail").length;
  const reworkCount = records.filter(i => i.result === "Rework").length;
  const passRate    = records.length > 0 ? ((passCount / records.length) * 100).toFixed(1) : null;

  const avgCarbon   = records.length && records.some(r => r.carbonPercent != null)
    ? (records.reduce((s, r) => s + (r.carbonPercent || 0), 0) / records.length).toFixed(3)
    : null;
  const avgTensile  = records.length && records.some(r => r.tensileStrength != null)
    ? Math.round(records.reduce((s, r) => s + (r.tensileStrength || 0), 0) / records.length)
    : null;

  // Overall result for the heat
  function overallResult() {
    if (!records.length) return null;
    if (failCount > 0)   return { label: "FAIL",   color: "var(--bad)", icon: "❌" };
    if (reworkCount > 0) return { label: "REWORK",  color: "var(--warn)", icon: "🔄" };
    return                      { label: "PASS",    color: "var(--ok)",  icon: "✅" };
  }
  const overall = overallResult();

  function handlePrint() {
    window.print();
  }

  const printDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div className="crud-page">
      {/* ── Screen header (hidden on print) ── */}
      <div className="page-header no-print">
        <h1>🖨 Inspection Summary Report</h1>
        <p className="hint">Select a heat number to generate a printable quality report</p>
      </div>

      {error && <div className="alert-error no-print">{error}</div>}

      {/* ── Heat selector ── */}
      <div className="panel no-print" style={{ marginBottom: 20 }}>
        <h2>Select Heat Number</h2>
        {loading ? (
          <p className="muted">Loading inspections…</p>
        ) : (
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={selectedHeat}
              onChange={e => setSelectedHeat(e.target.value)}
              style={{ height: 38, padding: "0 12px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 14, minWidth: 200 }}
            >
              <option value="">— Choose a heat number —</option>
              {heatNumbers.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            {selectedHeat && (
              <>
                <span className="muted">
                  {records.length} inspection{records.length !== 1 ? "s" : ""} found
                </span>
                <button className="btn-primary" onClick={handlePrint}>
                  🖨 Print / Save PDF
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => setSelectedHeat("")}
                >
                  Clear
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
          PRINTABLE REPORT — visible on screen + in print
          ═══════════════════════════════════════════════════════ */}
      {selectedHeat && records.length > 0 && (
        <div className="print-region">

          {/* ── Report letterhead ── */}
          <div className="ir-letterhead">
            <div className="ir-letterhead-left">
              <div className="ir-logo">⚙ Steel Plant Operations</div>
              <div className="ir-subtitle">Quality Inspection Summary Report</div>
            </div>
            <div className="ir-letterhead-right">
              <div className="ir-meta-line"><strong>Heat Number:</strong> {selectedHeat}</div>
              <div className="ir-meta-line"><strong>Product:</strong> {records[0]?.product || "—"}</div>
              <div className="ir-meta-line"><strong>Report Date:</strong> {printDate}</div>
              <div className="ir-meta-line"><strong>Inspections:</strong> {records.length} batch{records.length !== 1 ? "es" : ""}</div>
            </div>
          </div>

          {/* ── Overall verdict banner ── */}
          <div className="ir-verdict" style={{ borderColor: overall.color, background: `${overall.color}12` }}>
            <span className="ir-verdict-icon">{overall.icon}</span>
            <div>
              <div className="ir-verdict-label" style={{ color: overall.color }}>
                OVERALL HEAT RESULT: {overall.label}
              </div>
              <div className="ir-verdict-sub">
                {passCount} passed · {failCount} failed · {reworkCount} rework
                {passRate !== null && ` · Pass rate: ${passRate}%`}
              </div>
            </div>
          </div>

          {/* ── KPI pills ── */}
          <div className="ir-stats-row">
            <StatPill label="Pass Rate"         value={`${passRate}%`}        color="var(--ok)"  />
            <StatPill label="Passed"            value={passCount}             color="var(--ok)"  />
            <StatPill label="Failed"            value={failCount}             color="var(--bad)" />
            <StatPill label="Rework"            value={reworkCount}           color="var(--warn)"/>
            {avgCarbon  && <StatPill label="Avg Carbon %"     value={avgCarbon}    color="var(--ink)" />}
            {avgTensile && <StatPill label="Avg Tensile (MPa)" value={avgTensile}  color="var(--ink)" />}
          </div>

          {/* ── Detailed records table ── */}
          <div className="panel" style={{ marginTop: 20 }}>
            <h2 style={{ fontFamily: "\"Barlow Condensed\", sans-serif" }}>
              Detailed Inspection Records — Heat {selectedHeat}
            </h2>
            <div className="table-wrap">
              <table className="ir-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Inspector</th>
                    <th>Date</th>
                    <th>Carbon %</th>
                    <th>Tensile (MPa)</th>
                    <th>Result</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, idx) => (
                    <tr key={r._id}>
                      <td className="muted">{idx + 1}</td>
                      <td><strong>{r.inspector}</strong></td>
                      <td>
                        {r.inspectionDate
                          ? new Date(r.inspectionDate).toLocaleDateString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td>{r.carbonPercent != null ? `${r.carbonPercent}%` : "—"}</td>
                      <td>{r.tensileStrength != null ? `${r.tensileStrength} MPa` : "—"}</td>
                      <td>
                        <span style={{ color: RESULT_COLOR[r.result], fontWeight: 700 }}>
                          {RESULT_ICON[r.result]} {r.result}
                        </span>
                      </td>
                      <td style={{ maxWidth: 220, wordBreak: "break-word" }}>
                        {r.remarks || <span className="muted">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Print footer (only visible when printing) ── */}
          <div className="ir-print-footer">
            <div>Steel Plant Operations — Confidential Quality Document</div>
            <div>Generated: {printDate} · Heat: {selectedHeat}</div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !selectedHeat && (
        <div className="panel" style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🖨</div>
          <h2 style={{ borderBottom: "none", marginBottom: 8, color: "var(--muted)" }}>
            Select a Heat Number
          </h2>
          <p className="muted">
            Choose a heat number above to generate the quality inspection summary.<br />
            Click "Print / Save PDF" to export as a PDF via your browser.
          </p>
        </div>
      )}

      {selectedHeat && records.length === 0 && !loading && (
        <div className="alert-warn">
          No inspection records found for heat number <strong>{selectedHeat}</strong>.
        </div>
      )}
    </div>
  );
}
