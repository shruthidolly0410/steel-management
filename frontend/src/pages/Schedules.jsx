import CrudPage from "../components/CrudPage";

const FIELDS = [
  { key: "orderNo", label: "Order No", required: true, placeholder: "ORD-2024-001" },
  {
    key: "product", label: "Product", required: true,
    options: ["TMT Bar", "Steel Plate", "Wire Rod", "HR Coil", "CR Sheet"],
  },
  { key: "plannedTons", label: "Planned (t)", type: "number", required: true, min: 0 },
  { key: "producedTons", label: "Produced (t)", type: "number", min: 0 },
  {
    key: "furnace", label: "Furnace", required: true,
    options: ["EAF-1", "EAF-2", "IF-1", "IF-2", "BF-1"],
  },
  { key: "startDate", label: "Start Date", type: "date", required: true },
  { key: "endDate", label: "End Date", type: "date", required: true },
  {
    key: "status", label: "Status",
    options: ["Planned", "In Progress", "Completed", "Delayed"],
  },
];

const COLUMNS = [
  { key: "orderNo", label: "Order No" },
  { key: "product", label: "Product" },
  { key: "plannedTons", label: "Planned (t)" },
  { key: "producedTons", label: "Produced (t)" },
  { key: "furnace", label: "Furnace" },
  { key: "startDate", label: "Start" },
  { key: "endDate", label: "End" },
  { key: "status", label: "Status" },
];

export default function Schedules() {
  return (
    <CrudPage
      title="Production Scheduling"
      hint="Manage production orders, target tons, and furnace assignments."
      endpoint="schedules"
      fields={FIELDS}
      columns={COLUMNS}
    />
  );
}
