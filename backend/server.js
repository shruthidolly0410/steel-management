require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const Schedule = require("./models/Schedule");
const Furnace = require("./models/Furnace");
const Material = require("./models/Material");
const Inspection = require("./models/Inspection");

const crudRouter = require("./routes/crudRouter");
const analyticsRouter = require("./routes/analytics");

const app = express();

const isVercel = Boolean(process.env.VERCEL);

// Middleware
app.use(express.json());

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
    origin: (origin, callback) => {
      // Allow requests without an Origin header.
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow other origins only when explicitly configured
      // for your deployment.
      if (
        process.env.NODE_ENV === "production" &&
        process.env.ALLOW_ALL_ORIGINS === "true"
      ) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  })
);

// Health check (does not require a database connection)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Steel Management API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

// Reuse the database connection across requests.
let dbPromise;

async function ensureDBConnected() {
  if (!dbPromise) {
    dbPromise = Promise.resolve()
      .then(() => connectDB())
      .catch((error) => {
        // Allow a later request to retry after a connection failure.
        dbPromise = null;
        throw error;
      });
  }

  await dbPromise;
}

// Ensure MongoDB is connected before processing API routes.
app.use("/api", async (req, res, next) => {
  try {
    await ensureDBConnected();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);

    res.status(503).json({
      success: false,
      message: "Database connection unavailable",
    });
  }
});

// API routes
app.use("/api/schedules", crudRouter(Schedule));
app.use("/api/furnaces", crudRouter(Furnace));
app.use("/api/materials", crudRouter(Material));
app.use("/api/inspections", crudRouter(Inspection));
app.use("/api/analytics", analyticsRouter);

// Handle unknown API routes.
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Request error:", error.message);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Local development only.
// Vercel handles incoming requests through its serverless runtime.
if (!isVercel && require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(
      `Server running at http://localhost:${PORT}`
    );
  });
}

// Required for Vercel to load the Express application.
module.exports = app;