const mongoose = require("mongoose");

/**
 * Serverless-safe connection cache.
 *
 * Persists across warm invocations in serverless and handles reconnects
 * seamlessly in local development.
 */
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/steel_db";

  // Return the existing connection immediately if ready
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If no in-flight promise exists, start one.
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((m) => {
        console.log(`MongoDB connected: ${m.connection.name}`);
        return m;
      })
      .catch((err) => {
        // Reset so the next request can retry.
        cached.promise = null;
        cached.conn = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
