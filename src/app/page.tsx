import Card from "./components/Card";
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
