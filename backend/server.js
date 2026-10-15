require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const Schedule = require("./models/Schedule");
const Furnace = require("./models/Furnace");
const Material = require("./models/Material");
const Inspection = require("./models/Inspection");
const crudRouter = require("./routes/crudRouter");
const analyticsRouter = require("./routes/analytics");

const app = express();
const isProd = process.env.NODE_ENV === "production";

// ── CORS ──────────────────────────────────────────────────────────────────────
// Build the list of explicitly allowed origins from env + known Vercel URLs.
const allowedOrigins = [
  process.env.CLIENT_URL,                          // set in Vercel dashboard
  "https://steel-management-in2n.vercel.app",      // production frontend
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Same-origin or server-to-server requests have no Origin header — allow.
      if (!origin) return callback(null, true);

      // Explicitly listed origins.
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Allow any *.vercel.app preview deployment URL automatically
      // so staging/preview branches work without changing code.
      if (/^https:\/\/[a-z0-9-]+-[a-z0-9]+-[a-z0-9]+\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      // Broader fallback: any vercel.app subdomain
      if (/\.vercel\.app$/.test(origin)) return callback(null, true);

      return callback(new Error(`CORS: origin not allowed — ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

// ── Health check (no DB needed) ───────────────────────────────────────────────
app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  })
);

// ── DB middleware — runs before every /api route ───────────────────────────────
// In serverless each cold-start needs to (re)connect. The connectDB()
// function caches the connection so warm invocations are instant.
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed:", err.message);
    return res.status(503).json({
      success: false,
      message: "Database unavailable. Check MONGO_URI and Atlas Network Access.",
    });
  }
});

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use("/api/schedules", crudRouter(Schedule));
app.use("/api/furnaces", crudRouter(Furnace));
app.use("/api/materials", crudRouter(Material));
app.use("/api/inspections", crudRouter(Inspection));
app.use("/api/analytics", analyticsRouter);

// Unknown API route
app.use("/api", (req, res) =>
  res.status(404).json({ success: false, message: "API route not found" })
);

// ── Serve frontend build in non-serverless production (e.g. Render) ───────────
if (isProd && !process.env.VERCEL) {
  const distPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) =>
    res.sendFile(path.join(distPath, "index.html"))
  );
}

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ── Local dev: start HTTP server ──────────────────────────────────────────────
// On Vercel this block is skipped — Vercel calls the exported app directly.
if (!process.env.VERCEL && require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() =>
      app.listen(PORT, "0.0.0.0", () =>
        console.log(`Server running at http://localhost:${PORT}`)
      )
    )
    .catch((err) => {
      console.error("Failed to connect to DB on startup:", err.message);
      process.exit(1);
    });
}

// Required for Vercel serverless — export the Express app as the handler.
module.exports = app;