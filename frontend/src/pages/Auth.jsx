import { useState } from "react";
import api from "../api";

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Operator",
    department: "Melting Shop",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.login({
          email: form.email,
          password: form.password,
        });
        localStorage.setItem("steel_token", data.token);
        localStorage.setItem("steel_user", JSON.stringify(data.user));
        if (onAuthSuccess) onAuthSuccess(data.user, data.token);
      } else {
        const data = await api.register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          department: form.department,
        });
        localStorage.setItem("steel_token", data.token);
        localStorage.setItem("steel_user", JSON.stringify(data.user));
        if (onAuthSuccess) onAuthSuccess(data.user, data.token);
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(role, name, email) {
    setIsLogin(false);
    setForm({
      name,
      email,
      password: "password123",
      role,
      department: role === "Quality Inspector" ? "Quality Assurance" : "Steel Melting Shop",
    });
    setError("");
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-brand">
          <span className="auth-brand-icon">⚙</span>
          <div>
            <h1>Steel Plant Operations</h1>
            <p>Manufacturing Management System</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${isLogin ? "active" : ""}`}
            onClick={() => { setIsLogin(true); setError(""); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLogin ? "active" : ""}`}
            onClick={() => { setIsLogin(false); setError(""); }}
          >
            Create Account
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <label className="form-field">
                <span>Full Name</span>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Ramesh Kumar"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <div className="auth-form-row">
                <label className="form-field">
                  <span>Role / Position</span>
                  <select name="role" value={form.role} onChange={handleChange}>
                    <option value="Operator">Operator</option>
                    <option value="Shift Supervisor">Shift Supervisor</option>
                    <option value="Plant Manager">Plant Manager</option>
                    <option value="Quality Inspector">Quality Inspector</option>
                  </select>
                </label>

                <label className="form-field">
                  <span>Department</span>
                  <input
                    type="text"
                    name="department"
                    placeholder="e.g. Melting Shop"
                    value={form.department}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </>
          )}

          <label className="form-field">
            <span>Corporate Email</span>
            <input
              type="email"
              name="email"
              placeholder="e.g. engineer@steelplant.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </label>

          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Processing..." : isLogin ? "Sign In to Operations" : "Register Operator Account"}
          </button>
        </form>

        {/* Demo Fast Fill */}
        <div className="auth-demo-section">
          <p className="auth-demo-title">Quick Test Presets (Click to autofill):</p>
          <div className="auth-demo-chips">
            <button
              type="button"
              className="demo-chip"
              onClick={() => fillDemo("Shift Supervisor", "Vikram Patel", "supervisor@steelops.com")}
            >
              👷 Supervisor
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => fillDemo("Quality Inspector", "Anita Sharma", "inspector@steelops.com")}
            >
              🔬 Inspector
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => fillDemo("Plant Manager", "Rajesh Varma", "manager@steelops.com")}
            >
              👔 Manager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
