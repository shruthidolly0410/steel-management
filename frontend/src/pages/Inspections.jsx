import CrudPage from "../components/CrudPage";

const FIELDS = [
  { key: "heatNumber", label: "Heat Number", required: true, placeholder: "H-2201" },
  { key: "product", label: "Product", required: true, placeholder: "TMT Bar" },
  { key: "inspector", label: "Inspector", required: true, placeholder: "Inspector name" },
  { key: "carbonPercent", label: "Carbon %", type: "number", min: 0, step: 0.01, placeholder: "0.22" },
  { key: "tensileStrength", label: "Tensile Strength (MPa)", type: "number", min: 0, placeholder: "540" },
  {
    key: "result", label: "Result", required: true,
    options: ["Pass", "Fail", "Rework"],
  },
  { key: "remarks", label: "Remarks", placeholder: "Observations…" },
];

const COLUMNS = [
  { key: "heatNumber", label: "Heat No." },
  { key: "product", label: "Product" },
  { key: "inspector", label: "Inspector" },
  { key: "carbonPercent", label: "Carbon %" },
  { key: "tensileStrength", label: "Tensile (MPa)" },
  { key: "result", label: "Result" },
  { key: "inspectionDate", label: "Date" },
];

export default function Inspections() {
  return (
    <CrudPage
      title="Quality Inspection"
      hint="Record heat-wise quality checks, mechanical properties and test results."
      endpoint="inspections"
      fields={FIELDS}
      columns={COLUMNS}
    />
  );
}
