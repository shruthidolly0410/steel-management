const mongoose = require("mongoose");

const furnaceSchema = new mongoose.Schema(
  {
    furnaceName: { type: String, required: true },
    furnaceType: {
      type: String,
      enum: ["Electric Arc", "Induction", "Blast", "Ladle"],
      default: "Electric Arc",
    },
    heatNumber: { type: String, required: true },
    temperature: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Running", "Idle", "Maintenance"],
      default: "Running",
    },
    remarks: { type: String, default: "" },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Furnace", furnaceSchema);
