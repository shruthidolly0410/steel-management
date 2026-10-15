import CrudPage from "../components/CrudPage";

const FIELDS = [
  { key: "furnaceName", label: "Furnace Name", required: true, placeholder: "EAF-1" },
  {
    key: "furnaceType", label: "Furnace Type",
    options: ["Electric Arc", "Induction", "Blast", "Ladle"],
  },
  { key: "heatNumber", label: "Heat Number", required: true, placeholder: "H-2201" },
  { key: "temperature", label: "Temperature (°C)", type: "number", required: true, min: 0 },
  {
    key: "status", label: "Status",
    options: ["Running", "Idle", "Maintenance"],
  },
  { key: "remarks", label: "Remarks", placeholder: "Optional notes…" },
];

const COLUMNS = [
  { key: "furnaceName", label: "Furnace" },
  { key: "furnaceType", label: "Type" },
  { key: "heatNumber", label: "Heat No." },
  { key: "temperature", label: "Temp (°C)" },
  { key: "status", label: "Status" },
  { key: "remarks", label: "Remarks" },
];

export default function Furnaces() {
  return (
    <CrudPage
      title="Furnace Monitoring"
      hint="Log furnace heat records, temperatures and operational status."
      endpoint="furnaces"
      fields={FIELDS}
      columns={COLUMNS}
    />
  );
}
