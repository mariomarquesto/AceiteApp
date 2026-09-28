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
  const [clientes, productos, stockBajo, cierre, tareasResumen, ordenes] = await Promise.all([
    fetchJSON("/api/clientes"),
    fetchJSON("/api/productos"),
    fetchJSON("/api/reportes/stock-bajo"),
    fetchJSON("/api/reportes/cierre-caja"),
    fetchJSON("/api/tareas/resumen"),
    fetchJSON("/api/ordenes?estado=en_proceso")
  ]);

  const totalClientes = (clientes.data || []).length;
  const totalProductos = (productos.data || []).length;
  const productosBajos = stockBajo.data || [];
  const cobradoHoy = cierre.data?.total_cobrado || 0;
  const tareas = tareasResumen.data || { vencidas: 0, hoy: 0, proximos_7_dias: 0, completadas_hoy: 0 };
  const ordenesEnProceso = (ordenes.data || []).length;
  const totalTareasPendientes = tareas.vencidas + tareas.hoy + tareas.proximos_7_dias;

  const accesos = [
    {
      href: "/tareas",
      icon: "📋",
      title: "Tareas del día",
      subtitle: tareas.vencidas > 0
        ? tareas.vencidas + " vencidas"
        : tareas.hoy > 0
          ? tareas.hoy + " para hoy"
          : "Sin pendientes",
      gradient: "linear-gradient(135deg, #f97316, #dc2626)"
    },
    {
      href: "/ordenes/nueva",
      icon: "🔧",
      title: "Nueva orden",
      subtitle: "Cambio de aceite",
      gradient: "linear-gradient(135deg, #0ea5e9, #8b5cf6)"
    },
    {
      href: "/ventas/nueva",
      icon: "🛒",
      title: "Nueva venta",
      subtitle: "Venta rápida",
      gradient: "linear-gradient(135deg, #10b981, #0ea5e9)"
    },
    {
      href: "/clientes/nuevo",
      icon: "👤",
      title: "Nuevo cliente",
      subtitle: "Cargar datos",
      gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)"
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Panel de control</h1>
          <div className="page-subtitle">Resumen de tu negocio en tiempo real</div>
        </div>
      </div>

      {/* Alerta de tareas vencidas */}
      {tareas.vencidas > 0 && (
        <Link href="/tareas" style={{ textDecoration: "none" }}>
          <div style={{
            background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
            border: "2px solid #ef4444",
            borderRadius: 14,
            padding: 18,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(239,68,68,0.2)",
            transition: "all 0.2s"
          }}>
            <div style={{ fontSize: 36 }}>🔴</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: "#991b1b", fontSize: 17, letterSpacing: -0.3 }}>
                {tareas.vencidas} {tareas.vencidas === 1 ? "tarea vencida" : "tareas vencidas"}
              </div>
              <div style={{ fontSize: 13, color: "#b91c1c", marginTop: 2 }}>
                Contactá a esos clientes para recuperar ventas
              </div>
            </div>
            <div style={{ fontSize: 28, color: "#991b1b", fontWeight: 700 }}>→</div>
          </div>
        </Link>
      )}

      {/* Métricas */}
      <div className="dashboard-grid" style={{ marginBottom: 32 }}>
        <Card
          title="Clientes"
          value={totalClientes}
          icon="👥"
          color="#0ea5e9"
          subtitle="Registrados"
        />
        <Card
          title="Órdenes activas"
          value={ordenesEnProceso}
          icon="🔧"
          color="#8b5cf6"
          subtitle="En proceso"
        />
        <Card
          title="Cobrado hoy"
          value={"$" + Number(cobradoHoy).toLocaleString("es-AR")}
          icon="💰"
          color="#10b981"
          subtitle="Efectivo + transferencia"
        />
        <Card
          title="Tareas pendientes"
          value={totalTareasPendientes}
          icon="📋"
          color={tareas.vencidas > 0 ? "#ef4444" : "#f59e0b"}
          subtitle={tareas.vencidas > 0 ? tareas.vencidas + " vencidas" : "Al día"}
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

      <div className="dashboard-grid" style={{ marginBottom: 32 }}>
        {accesos.map(a => (
          <Link key={a.href} href={a.href} className="quick-access">
            <div className="quick-access-icon" style={{ background: a.gradient }}>
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

      {/* 2 columnas: Tareas + Stock bajo */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="dashboard-columns">
        <div className="form-card">
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16
          }}>
            <h2 style={{ fontSize: 17, color: "#0f172a", fontWeight: 700 }}>
              📅 Resumen de tareas
            </h2>
            <Link href="/tareas" style={{ fontSize: 13, color: "#0ea5e9", fontWeight: 600 }}>
              Ver todas →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 14px",
              background: "#fef2f2",
              borderRadius: 8,
              borderLeft: "3px solid #ef4444"
            }}>
              <span style={{ fontSize: 14, color: "#991b1b", fontWeight: 500 }}>
                🔴 Vencidas
              </span>
              <span style={{ fontWeight: 700, color: "#991b1b" }}>{tareas.vencidas}</span>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 14px",
              background: "#fef9c3",
              borderRadius: 8,
              borderLeft: "3px solid #eab308"
            }}>
              <span style={{ fontSize: 14, color: "#713f12", fontWeight: 500 }}>
                🟡 Para hoy
              </span>
              <span style={{ fontWeight: 700, color: "#713f12" }}>{tareas.hoy}</span>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 14px",
              background: "#e0f2fe",
              borderRadius: 8,
              borderLeft: "3px solid #0ea5e9"
            }}>
              <span style={{ fontSize: 14, color: "#0c4a6e", fontWeight: 500 }}>
                📅 Próximos 7 días
              </span>
              <span style={{ fontWeight: 700, color: "#0c4a6e" }}>{tareas.proximos_7_dias}</span>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 14px",
              background: "#dcfce7",
              borderRadius: 8,
              borderLeft: "3px solid #16a34a"
            }}>
              <span style={{ fontSize: 14, color: "#14532d", fontWeight: 500 }}>
                ✅ Completadas hoy
              </span>
              <span style={{ fontWeight: 700, color: "#14532d" }}>{tareas.completadas_hoy}</span>
            </div>
          </div>
        </div>

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
            <Link href="/productos" style={{ fontSize: 13, color: "#0ea5e9", fontWeight: 600 }}>
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
    </div>
  );
}
`;

fs.writeFileSync("src/app/page.tsx", dashboard, "utf8");
console.log("OK: dashboard con cards polenta + CRM integrado");
