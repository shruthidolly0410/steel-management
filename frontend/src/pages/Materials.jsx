import CrudPage from "../components/CrudPage";

const FIELDS = [
  { key: "name", label: "Material Name", required: true, placeholder: "Iron Ore" },
  { key: "supplier", label: "Supplier", placeholder: "Supplier name" },
  { key: "stockTons", label: "Stock (t)", type: "number", required: true, min: 0, step: 0.1 },
  { key: "usedTons", label: "Used (t)", type: "number", min: 0, step: 0.1 },
  { key: "reorderLevel", label: "Reorder Level (t)", type: "number", min: 0, step: 0.1 },
];

const COLUMNS = [
  { key: "name", label: "Material" },
  { key: "supplier", label: "Supplier" },
  { key: "stockTons", label: "Stock (t)" },
  { key: "usedTons", label: "Used (t)" },
  { key: "reorderLevel", label: "Reorder Level (t)" },
];

export default function Materials() {
  return (
    <CrudPage
      title="Raw Material Tracking"
      hint="Track inventory stock levels, consumption and reorder thresholds."
      endpoint="materials"
      fields={FIELDS}
      columns={COLUMNS}
    />
  );
}
