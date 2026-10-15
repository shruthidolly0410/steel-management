import { useState, useEffect } from "react";
import api from "../api";

const BADGE_MAP = {
  Completed: "badge-completed",
  "In Progress": "badge-inprogress",
  Delayed: "badge-delayed",
  Planned: "badge-planned",
  Pass: "badge-pass",
  Fail: "badge-fail",
  Rework: "badge-rework",
  Running: "badge-running",
  Idle: "badge-idle",
  Maintenance: "badge-maintenance",
};

const STATUS_VALUES = new Set(Object.keys(BADGE_MAP));

function formatCell(value) {
  if (value instanceof Date || (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value))) {
    const d = new Date(value);
    if (!isNaN(d)) return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }
  if (STATUS_VALUES.has(value)) {
    return <span className={`badge ${BADGE_MAP[value]}`}>{value}</span>;
  }
  return value ?? "—";
}

export default function CrudPage({ title, hint, endpoint, fields, columns }) {
  const empty = Object.fromEntries(fields.map((f) => [f.key, ""]));
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadItems() {
    try {
      const data = await api.list(endpoint);
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadItems(); }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    // Coerce number fields
    const body = { ...form };
    fields.forEach((f) => {
      if (f.type === "number" && body[f.key] !== "") body[f.key] = Number(body[f.key]);
    });
    try {
      if (editingId) {
        await api.update(endpoint, editingId, body);
      } else {
        await api.create(endpoint, body);
      }
      setForm(empty);
      setEditingId(null);
      await loadItems();
    } catch (e) {
      setError(e.message);
    }
  }

  function handleEdit(item) {
    const patch = {};
    fields.forEach((f) => {
      let v = item[f.key] ?? "";
      // Convert date to yyyy-MM-dd for <input type="date">
      if (f.type === "date" && v) {
        v = new Date(v).toISOString().slice(0, 10);
      }
      patch[f.key] = v;
    });
    setForm(patch);
    setEditingId(item._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this record?")) return;
    try {
      await api.remove(endpoint, id);
      await loadItems();
    } catch (e) {
      setError(e.message);
    }
  }

  function handleCancel() {
    setForm(empty);
    setEditingId(null);
    setError("");
  }

  return (
    <div className="crud-page">
      <div className="page-header">
        <h1>{title}</h1>
        {hint && <p className="hint">{hint}</p>}
      </div>

      {/* ── Form ── */}
      <section className="panel form-panel">
        <h2>{editingId ? "Edit Record" : "Add New Record"}</h2>
        {error && <div className="alert-error">{error}</div>}
        <form className="crud-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            {fields.map((f) =>
              f.options ? (
                <label key={f.key} className="form-field">
                  <span>{f.label}</span>
                  <select name={f.key} value={form[f.key]} onChange={handleChange} required={f.required}>
                    <option value="">— select —</option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <label key={f.key} className="form-field">
                  <span>{f.label}</span>
                  <input
                    type={f.type || "text"}
                    name={f.key}
                    value={form[f.key]}
                    onChange={handleChange}
                    placeholder={f.placeholder || ""}
                    required={f.required}
                    min={f.min}
                    step={f.step}
                  />
                </label>
              )
            )}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? "Update Record" : "Add Record"}
            </button>
            {editingId && (
              <button type="button" className="btn-ghost" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* ── Table ── */}
      <section className="panel table-panel">
        <h2>Records ({items.length})</h2>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="muted">No records found. Add one above.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    {columns.map((c) => (
                      <td key={c.key}>{formatCell(item[c.key])}</td>
                    ))}
                    <td className="actions-cell">
                      <button className="link-btn edit" onClick={() => handleEdit(item)}>Edit</button>
                      <button className="link-btn del" onClick={() => handleDelete(item._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
