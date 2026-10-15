const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    supplier: { type: String, default: "" },
    stockTons: { type: Number, required: true, min: 0 },
    usedTons: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", materialSchema);
