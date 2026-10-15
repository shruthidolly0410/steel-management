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
// In production the backend serves the frontend from the same origin,
// so CORS is only needed for separate-origin deployments.
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin requests (no Origin header) and known origins
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      // In production without an explicit CLIENT_URL, allow all (CDN, Render preview URLs)
      if (isProd && !process.env.CLIENT_URL) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());

// ── Health ─────────────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", env: process.env.NODE_ENV || "development" })
);

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use("/api/schedules", crudRouter(Schedule));
app.use("/api/furnaces", crudRouter(Furnace));
app.use("/api/materials", crudRouter(Material));
app.use("/api/inspections", crudRouter(Inspection));
app.use("/api/analytics", analyticsRouter);

// ── Serve Frontend Build (production only) ────────────────────────────────────
// The frontend `npm run build` outputs to frontend/dist.
// In production, the backend serves those static files directly,
// so only one server/port is needed.
if (isProd) {
  const distPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(distPath));

  // Catch-all: return index.html for any non-API route (SPA client-side routing)
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// ── Start ──────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`[${process.env.NODE_ENV || "development"}] Server → http://localhost:${PORT}`)
  );
});
