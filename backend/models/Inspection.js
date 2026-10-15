const mongoose = require("mongoose");

const inspectionSchema = new mongoose.Schema(
  {
    heatNumber: { type: String, required: true },
    product: { type: String, required: true },
    inspector: { type: String, required: true },
    carbonPercent: { type: Number, min: 0 },
    tensileStrength: { type: Number, min: 0 },
    result: {
      type: String,
      enum: ["Pass", "Fail", "Rework"],
      required: true,
    },
    inspectionDate: { type: Date, default: Date.now },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inspection", inspectionSchema);
