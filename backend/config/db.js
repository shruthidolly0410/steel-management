const mongoose = require("mongoose");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/steel_db";

if (!MONGO_URI) {
  throw new Error("MONGO_URI environment variable is not defined.");
}

/**
 * Serverless-safe connection cache.
 *
 * Vercel spins up a new Node.js module per cold start, but the global
 * object persists across warm invocations in the same container.
 * Caching the promise here prevents opening a new connection on every
 * request while still reconnecting after a cold start.
 */
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  // Return the existing connection immediately if available.
  if (cached.conn) {
    return cached.conn;
  }

  // If no in-flight promise exists, start one.
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,          // Fail fast instead of buffering ops
      serverSelectionTimeoutMS: 8000, // Give Atlas 8 s to respond
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(MONGO_URI, opts)
      .then((m) => {
        console.log(`MongoDB connected: ${m.connection.name}`);
        return m;
      })
      .catch((err) => {
        // Reset so the next request can retry.
        cached.promise = null;
        // Re-throw — do NOT call process.exit() in serverless.
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
