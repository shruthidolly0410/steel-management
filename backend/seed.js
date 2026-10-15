require("dotenv").config();
const mongoose = require("mongoose");

const Schedule = require("./models/Schedule");
const Furnace = require("./models/Furnace");
const Material = require("./models/Material");
const Inspection = require("./models/Inspection");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/steel_db";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB for seeding...");

  // Clear all collections
  await Promise.all([
    Schedule.deleteMany({}),
    Furnace.deleteMany({}),
    Material.deleteMany({}),
    Inspection.deleteMany({}),
  ]);
  console.log("Cleared all collections.");

  // ── Schedules ────────────────────────────────────────────────────────────
  await Schedule.insertMany([
    {
      orderNo: "ORD-2024-001",
      product: "TMT Bar",
      plannedTons: 500,
      producedTons: 487,
      furnace: "EAF-1",
      startDate: new Date("2024-10-01"),
      endDate: new Date("2024-10-10"),
      status: "Completed",
    },
    {
      orderNo: "ORD-2024-002",
      product: "Steel Plate",
      plannedTons: 300,
      producedTons: 180,
      furnace: "EAF-2",
      startDate: new Date("2024-10-08"),
      endDate: new Date("2024-10-18"),
      status: "In Progress",
    },
    {
      orderNo: "ORD-2024-003",
      product: "Wire Rod",
      plannedTons: 250,
      producedTons: 0,
      furnace: "IF-1",
      startDate: new Date("2024-10-20"),
      endDate: new Date("2024-10-28"),
      status: "Planned",
    },
    {
      orderNo: "ORD-2024-004",
      product: "TMT Bar",
      plannedTons: 400,
      producedTons: 150,
      furnace: "EAF-1",
      startDate: new Date("2024-10-05"),
      endDate: new Date("2024-10-12"),
      status: "Delayed",
    },
  ]);
  console.log("Seeded Schedules.");

  // ── Furnaces ─────────────────────────────────────────────────────────────
  await Furnace.insertMany([
    {
      furnaceName: "EAF-1",
      furnaceType: "Electric Arc",
      heatNumber: "H-2201",
      temperature: 1620,
      status: "Running",
      remarks: "Operating at nominal capacity",
      recordedAt: new Date(),
    },
    {
      furnaceName: "EAF-2",
      furnaceType: "Electric Arc",
      heatNumber: "H-2202",
      temperature: 1580,
      status: "Running",
      remarks: "Slight temperature dip; monitoring",
      recordedAt: new Date(),
    },
    {
      furnaceName: "IF-1",
      furnaceType: "Induction",
      heatNumber: "H-2203",
      temperature: 0,
      status: "Maintenance",
      remarks: "Scheduled electrode replacement",
      recordedAt: new Date(),
    },
  ]);
  console.log("Seeded Furnaces.");

  // ── Materials ────────────────────────────────────────────────────────────
  await Material.insertMany([
    {
      name: "Iron Ore",
      supplier: "Odisha Minerals Ltd.",
      stockTons: 1200,
      usedTons: 850,
      reorderLevel: 300,
    },
    {
      name: "Scrap Steel",
      supplier: "Metro Scrap Traders",
      stockTons: 80,       // below reorderLevel → triggers low-stock alert
      usedTons: 420,
      reorderLevel: 150,
    },
    {
      name: "Coke",
      supplier: "Eastern Coke Corp.",
      stockTons: 560,
      usedTons: 310,
      reorderLevel: 100,
    },
    {
      name: "Limestone",
      supplier: "Rajasthan Minerals",
      stockTons: 340,
      usedTons: 190,
      reorderLevel: 80,
    },
  ]);
  console.log("Seeded Materials.");

  // ── Inspections ──────────────────────────────────────────────────────────
  await Inspection.insertMany([
    {
      heatNumber: "H-2201",
      product: "TMT Bar",
      inspector: "Ramesh Kumar",
      carbonPercent: 0.22,
      tensileStrength: 540,
      result: "Pass",
      inspectionDate: new Date("2024-10-10"),
      remarks: "All parameters within spec",
    },
    {
      heatNumber: "H-2202",
      product: "Steel Plate",
      inspector: "Anita Sharma",
      carbonPercent: 0.18,
      tensileStrength: 490,
      result: "Pass",
      inspectionDate: new Date("2024-10-09"),
      remarks: "Good surface quality",
    },
    {
      heatNumber: "H-2201-B",
      product: "TMT Bar",
      inspector: "Suresh Nair",
      carbonPercent: 0.31,
      tensileStrength: 420,
      result: "Rework",
      inspectionDate: new Date("2024-10-11"),
      remarks: "Carbon percent slightly high; sent for re-rolling",
    },
    {
      heatNumber: "H-2203",
      product: "Wire Rod",
      inspector: "Priya Singh",
      carbonPercent: 0.45,
      tensileStrength: 380,
      result: "Fail",
      inspectionDate: new Date("2024-10-07"),
      remarks: "Below minimum tensile strength; batch rejected",
    },
  ]);
  console.log("Seeded Inspections.");

  await mongoose.disconnect();
  console.log("Seeding complete. Database disconnected.");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
