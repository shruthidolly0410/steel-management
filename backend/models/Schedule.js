const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    orderNo: { type: String, required: true, unique: true },
    product: { type: String, required: true },
    plannedTons: { type: Number, required: true, min: 0 },
    producedTons: { type: Number, default: 0, min: 0 },
    furnace: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Planned", "In Progress", "Completed", "Delayed"],
      default: "Planned",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
