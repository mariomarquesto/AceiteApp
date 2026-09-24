const fs = require("fs");

// ============================================
// Card.tsx - versión profesional
// ============================================
const card = `export default function Card({
  title,
  value,
  subtitle,
  icon,
  color = "#0ea5e9",
  trend
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">{title}</div>
        {icon && (
          <div className="card-icon" style={{ background: color + "15", color }}>
            {icon}
          </div>
        )}
      </div>

      <div className="card-value">{value}</div>

      <div className="card-footer">
        {subtitle && <div className="card-subtitle">{subtitle}</div>}
        {trend && (
          <div className={"card-trend " + (trend.positive ? "positive" : "negative")}>
            {trend.positive ? "↑" : "↓"} {trend.value}
          </div>
        )}
      </div>

      <div className="card-glow" style={{ background: color }} />
    </div>
  );
}
`;
fs.writeFileSync("src/app/components/Card.tsx", card, "utf8");
console.log("OK: Card.tsx");

// ============================================
// CSS de las cards
// ============================================
let css = fs.readFileSync("src/app/globals.css", "utf8");

const cardCss = `

/* ============================================
   CARD
   ============================================ */
.card {
  position: relative;
  background: #fff;
  padding: 22px;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
  border: 1px solid #e8eef5;
  overflow: hidden;
  transition: all 0.25s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.08);
  border-color: #dbe6f1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.card-value {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  min-height: 20px;
}

.card-subtitle {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.card-trend {
  font-size: 12px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.card-trend.positive {
  color: #16a34a;
  background: #dcfce7;
}

.card-trend.negative {
  color: #dc2626;
  background: #fee2e2;
}

.card-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.06;
  filter: blur(40px);
  pointer-events: none;
  transform: translate(30%, -30%);
}
`;

if (!css.includes("/* CARD */")) {
  css += cardCss;
  fs.writeFileSync("src/app/globals.css", css, "utf8");
  console.log("OK: globals.css con estilos de card");
}

// ============================================
// Estilos extras globales (botones, tablas, forms, headers)
// ============================================
const extras = `

/* ============================================
   PAGE HEADER
   ============================================ */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}

/* ============================================
   BOTONES MEJORADOS
   ============================================ */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  color: white;
  box-shadow: 0 4px 12px rgba(14,165,233,0.3);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(14,165,233,0.45);
}

.btn-secondary {
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.btn-secondary:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 12px rgba(239,68,68,0.3);
}
.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(239,68,68,0.45);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* ============================================
   TABLAS
   ============================================ */
.table-wrapper {
  background: white;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
  border: 1px solid #e8eef5;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.table th {
  text-align: left;
  padding: 14px 18px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table td {
  padding: 16px 18px;
  border-top: 1px solid #f1f5f9;
  font-size: 14px;
  color: #334155;
}

.table tbody tr {
  transition: background 0.15s;
}

.table tbody tr:hover {
  background: #f8fafc;
}

/* ============================================
   INPUTS
   ============================================ */
.input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: white;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
}

.input:focus {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14,165,233,0.12);
}

.input::placeholder {
  color: #94a3b8;
}

/* ============================================
   FORM CARDS
   ============================================ */
.form-card {
  background: white;
  padding: 28px;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
  border: 1px solid #e8eef5;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.form-group {
  margin-bottom: 18px;
}

/* ============================================
   EMPTY STATE
   ============================================ */
.empty-state {
  background: white;
  padding: 60px 24px;
  border-radius: 14px;
  text-align: center;
  color: #64748b;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
  border: 1px solid #e8eef5;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

/* ============================================
   BADGE
   ============================================ */
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2px;
}
`;

if (!css.includes("/* PAGE HEADER */")) {
  css += extras;
  fs.writeFileSync("src/app/globals.css", css, "utf8");
  console.log("OK: estilos extras agregados");
}
