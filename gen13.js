const fs = require("fs");

const dashboard = `import Card from "./components/Card";
import Link from "next/link";

async function fetchJSON(path: string) {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(base + path, { cache: "no-store" });
    if (!res.ok) return { data: [] };
    return res.json();
  } catch {
    return { data: [] };
  }
}

export default async function Home() {
  const [clientes, productos, stockBajo, cierre, ventas] = await Promise.all([
    fetchJSON("/api/clientes"),
    fetchJSON("/api/productos"),
    fetchJSON("/api/reportes/stock-bajo"),
    fetchJSON("/api/reportes/cierre-caja"),
    fetchJSON("/api/ventas")
  ]);

  const totalClientes = (clientes.data || []).length;
  const totalProductos = (productos.data || []).length;
  const productosBajos = stockBajo.data || [];
  const cobradoHoy = cierre.data?.total_cobrado || 0;
  const totalVentas = (ventas.data || []).length;

  const accesos = [
    {
      href: "/ventas/nueva",
      icon: "🛒",
      title: "Nueva venta",
      subtitle: "Registrar venta rápida",
      gradient: "linear-gradient(135deg, #0ea5e9, #8b5cf6)"
    },
    {
      href: "/clientes/nuevo",
      icon: "👤",
      title: "Nuevo cliente",
      subtitle: "Cargar datos del cliente",
      gradient: "linear-gradient(135deg, #10b981, #0ea5e9)"
    },
    {
      href: "/productos",
      icon: "📦",
      title: "Inventario",
      subtitle: "Ver y editar productos",
      gradient: "linear-gradient(135deg, #f59e0b, #ef4444)"
    },
    {
      href: "/ventas",
      icon: "💰",
      title: "Ver ventas",
      subtitle: "Historial de ventas",
      gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)"
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Panel de control</h1>
          <div className="page-subtitle">
            Resumen de tu negocio en tiempo real
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 18,
        marginBottom: 32
      }}>
        <Card
          title="Clientes"
          value={totalClientes}
          icon="👥"
          color="#0ea5e9"
          subtitle="Registrados"
        />
        <Card
          title="Productos"
          value={totalProductos}
          icon="📦"
          color="#8b5cf6"
          subtitle="En inventario"
        />
        <Card
          title="Cobrado hoy"
          value={"$" + Number(cobradoHoy).toLocaleString("es-AR")}
          icon="💰"
          color="#10b981"
          subtitle="Efectivo + transferencia"
        />
        <Card
          title="Stock bajo"
          value={productosBajos.length}
          icon="⚠️"
          color="#ef4444"
          subtitle={productosBajos.length > 0 ? "Requiere reposición" : "Todo en orden"}
        />
      </div>

      {/* Accesos rápidos */}
      <h2 style={{
        fontSize: 18,
        fontWeight: 700,
        color: "#0f172a",
        marginBottom: 16,
        letterSpacing: -0.3
      }}>
        ⚡ Accesos rápidos
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
        marginBottom: 32
      }}>
        {accesos.map(a => (
          <Link key={a.href} href={a.href} className="quick-access">
            <div
              className="quick-access-icon"
              style={{ background: a.gradient }}
            >
              {a.icon}
            </div>
            <div className="quick-access-content">
              <div className="quick-access-title">{a.title}</div>
              <div className="quick-access-subtitle">{a.subtitle}</div>
            </div>
            <div className="quick-access-arrow">→</div>
          </Link>
        ))}
      </div>

      {/* Stock bajo */}
      <div className="form-card">
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16
        }}>
          <h2 style={{ fontSize: 17, color: "#0f172a", fontWeight: 700 }}>
            ⚠️ Stock bajo
          </h2>
          <Link href="/productos" style={{
            fontSize: 13,
            color: "#0ea5e9",
            fontWeight: 600
          }}>
            Ver todos →
          </Link>
        </div>

        {productosBajos.length === 0 ? (
          <div style={{ textAlign: "center", padding: 24, color: "#94a3b8", fontSize: 14 }}>
            ✅ Todo el inventario está en orden
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {productosBajos.slice(0, 5).map((p: any) => (
              <div key={p.id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                background: "#fef2f2",
                borderRadius: 8,
                borderLeft: "3px solid #ef4444"
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>
                    {p.nombre}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    Mínimo: {p.stock_minimo}
                  </div>
                </div>
                <div style={{
                  background: "#ef4444",
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  {p.stock}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
`;
fs.writeFileSync("src/app/page.tsx", dashboard, "utf8");
console.log("OK: page.tsx con nuevos accesos");

// CSS de accesos rápidos
let css = fs.readFileSync("src/app/globals.css", "utf8");

const quickCss = `

/* ============================================
   QUICK ACCESS
   ============================================ */
.quick-access {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: white;
  border-radius: 14px;
  border: 1px solid #e8eef5;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
}

.quick-access::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(14,165,233,0.04), rgba(139,92,246,0.04));
  opacity: 0;
  transition: opacity 0.25s;
}

.quick-access:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(14,165,233,0.15), 0 4px 12px rgba(0,0,0,0.06);
  border-color: #bae6fd;
}

.quick-access:hover::before {
  opacity: 1;
}

.quick-access-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: transform 0.25s;
  position: relative;
  z-index: 1;
}

.quick-access:hover .quick-access-icon {
  transform: scale(1.08) rotate(-4deg);
}

.quick-access-content {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.quick-access-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2px;
  letter-spacing: -0.2px;
}

.quick-access-subtitle {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.quick-access-arrow {
  font-size: 20px;
  color: #cbd5e1;
  transition: all 0.25s;
  position: relative;
  z-index: 1;
  font-weight: 700;
}

.quick-access:hover .quick-access-arrow {
  color: #0ea5e9;
  transform: translateX(4px);
}
`;

if (!css.includes("/* QUICK ACCESS */")) {
  css += quickCss;
  fs.writeFileSync("src/app/globals.css", css, "utf8");
  console.log("OK: estilos de quick access agregados");
} else {
  console.log("quick access ya existia");
}
