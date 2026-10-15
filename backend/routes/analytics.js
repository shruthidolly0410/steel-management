const express = require("express");
const router = express.Router();

const Schedule = require("../models/Schedule");
const Furnace = require("../models/Furnace");
const Material = require("../models/Material");
const Inspection = require("../models/Inspection");

router.get("/", async (req, res) => {
  try {
    const [schedules, furnaces, materials, inspections] = await Promise.all([
      Schedule.find(),
      Furnace.find(),
      Material.find(),
      Inspection.find(),
    ]);

    // ── Production ──────────────────────────────────────────────────────────
    const plannedTons = schedules.reduce((s, o) => s + (o.plannedTons || 0), 0);
    const producedTons = schedules.reduce((s, o) => s + (o.producedTons || 0), 0);
    const totalOrders = schedules.length;

    const byStatus = {};
    schedules.forEach((o) => {
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    });

    const byProduct = {};
    schedules.forEach((o) => {
      byProduct[o.product] = (byProduct[o.product] || 0) + (o.producedTons || 0);
    });

    // ── Furnaces ─────────────────────────────────────────────────────────────
    // Group by furnaceName; take latest recordedAt record per furnace
    const furnaceMap = {};
    furnaces.forEach((f) => {
      if (
        !furnaceMap[f.furnaceName] ||
        new Date(f.recordedAt) > new Date(furnaceMap[f.furnaceName].recordedAt)
      ) {
        furnaceMap[f.furnaceName] = f;
      }
    });
    const uniqueFurnaces = Object.values(furnaceMap);
    const totalFurnaces = uniqueFurnaces.length;
    const runningCount = uniqueFurnaces.filter((f) => f.status === "Running").length;
    const avgTemperature =
      uniqueFurnaces.length > 0
        ? Math.round(
            uniqueFurnaces.reduce((s, f) => s + (f.temperature || 0), 0) /
              uniqueFurnaces.length
          )
        : 0;

    // ── Materials ─────────────────────────────────────────────────────────────
    const totalStockTons = materials.reduce((s, m) => s + (m.stockTons || 0), 0);
    const totalUsedTons = materials.reduce((s, m) => s + (m.usedTons || 0), 0);
    const lowStock = materials
      .filter((m) => m.stockTons <= m.reorderLevel)
      .map((m) => m.name);

    // ── Quality ──────────────────────────────────────────────────────────────
    const totalInspections = inspections.length;
    const passCount = inspections.filter((i) => i.result === "Pass").length;
    const passRate =
      totalInspections > 0
        ? parseFloat(((passCount / totalInspections) * 100).toFixed(1))
        : 0;

    const byResult = { Pass: 0, Fail: 0, Rework: 0 };
    inspections.forEach((i) => {
      if (byResult[i.result] !== undefined) byResult[i.result]++;
    });

    res.json({
      production: { plannedTons, producedTons, totalOrders, byStatus, byProduct },
      furnaces: { total: totalFurnaces, runningCount, avgTemperature },
      materials: { totalStockTons, totalUsedTons, lowStock },
      quality: { total: totalInspections, passRate, byResult },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
