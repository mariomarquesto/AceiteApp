import Card from "./components/Card";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getMetricas() {
  const hoy = new Date();
  const hoyStr = hoy.toISOString().slice(0, 10);
  const en7dias = new Date(hoy.getTime() + 7 * 86400000);
  const en7diasStr = en7dias.toISOString().slice(0, 10);

  const [
    clientes,
    productos,
    stockBajo,
    pagosHoy,
    tareasResumen,
    ordenesEnProceso,
    cumplesRaw
  ] = await Promise.all([
    supabase.from("clientes").select("id", { count: "exact", head: true }).eq("activo", true),
    supabase.from("productos").select("id", { count: "exact", head: true }).eq("activo", true),
    supabase.from("v_stock_bajo").select("*").limit(5),
    supabase.from("pagos").select("monto, medio").gte("fecha", hoyStr),
    supabase.from("tareas").select("estado, fecha_vencimiento, fecha_completada").eq("estado", "pendiente"),
    supabase.from("ordenes").select("id", { count: "exact", head: true }).eq("estado", "en_proceso"),
    supabase.from("clientes").select("id, nombre, telefono, fecha_nacimiento").not("fecha_nacimiento", "is", null).eq("activo", true)
  ]);

  const tareasPendientes = tareasResumen.data || [];
  const vencidas = tareasPendientes.filter(t => t.fecha_vencimiento < hoyStr).length;
  const hoyTareas = tareasPendientes.filter(t => t.fecha_vencimiento === hoyStr).length;
  const proximos7 = tareasPendientes.filter(t => t.fecha_vencimiento > hoyStr && t.fecha_vencimiento <= en7diasStr).length;

  const cobradoHoy = (pagosHoy.data || []).reduce((s, p) => s + Number(p.monto), 0);

  const proximosCumples = (cumplesRaw.data || [])
    .map((c: any) => {
      const cumple = new Date(c.fecha_nacimiento + "T00:00:00");
      const esteAnio = new Date(hoy.getFullYear(), cumple.getMonth(), cumple.getDate());
      if (esteAnio < hoy) esteAnio.setFullYear(hoy.getFullYear() + 1);
      const diasHasta = Math.ceil((esteAnio.getTime() - hoy.getTime()) / 86400000);
      return { ...c, dias_hasta: diasHasta };
    })
    .filter((c: any) => c.dias_hasta >= 0 && c.dias_hasta <= 7)
    .sort((a: any, b: any) => a.dias_hasta - b.dias_hasta);

  return {
    totalClientes: clientes.count || 0,
    totalProductos: productos.count || 0,
    productosBajos: stockBajo.data || [],
    cobradoHoy,
    tareas: {
      vencidas,
      hoy: hoyTareas,
      proximos_7_dias: proximos7,
      completadas_hoy: 0
    },
    ordenesEnProceso: ordenesEnProceso.count || 0,
    cumples: proximosCumples
  };
}

export default async function Home() {
  const m = await getMetricas();
  const totalTareasPendientes = m.tareas.vencidas + m.tareas.hoy + m.tareas.proximos_7_dias;

  // ============================================
  // ACCIONES RÁPIDAS
  // ============================================
  const accesosAcciones = [
    {
      href: "/tareas",
      icon: "📋",
      title: "Tareas del día",
      subtitle: m.tareas.vencidas > 0
        ? m.tareas.vencidas + " vencidas"
        : m.tareas.hoy > 0
          ? m.tareas.hoy + " para hoy"
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

  // ============================================
  // SECCIONES (todas del mismo estilo)
  // ============================================
  const accesosSecciones = [
    {
      href: "/whatsapp",
      icon: "💬",
      title: "WhatsApp",
      subtitle: "Conversaciones del bot",
      gradient: "linear-gradient(135deg, #22c55e, #16a34a)"
    },
    {
      href: "/promociones",
      icon: "🎁",
      title: "Promociones",
      subtitle: "Ofertas activas",
      gradient: "linear-gradient(135deg, #ec4899, #f43f5e)"
    },
    {
      href: "/reportes",
      icon: "📈",
      title: "Reportes",
      subtitle: "Métricas y proyecciones",
      gradient: "linear-gradient(135deg, #0ea5e9, #3b82f6)"
    },
    {
      href: "/clientes-vip",
      icon: "🏆",
      title: "Clientes VIP",
      subtitle: "Top 10 por facturación",
      gradient: "linear-gradient(135deg, #f59e0b, #eab308)"
    },
    {
      href: "/puntos",
      icon: "⭐",
      title: "Puntos",
      subtitle: "Programa de fidelidad",
      gradient: "linear-gradient(135deg, #8b5cf6, #a855f7)"
    },
    {
      href: "/cuenta-corriente",
      icon: "💳",
      title: "Cuenta corriente",
      subtitle: "Saldos y cobros",
      gradient: "linear-gradient(135deg, #06b6d4, #0ea5e9)"
    },
    {
      href: "/vehiculos",
      icon: "🚗",
      title: "Vehículos",
      subtitle: "Flota de clientes",
      gradient: "linear-gradient(135deg, #64748b, #475569)"
    },
    {
      href: "/productos",
      icon: "📦",
      title: "Productos",
      subtitle: "Inventario y stock",
      gradient: "linear-gradient(135deg, #f97316, #ea580c)"
    },
    {
      href: "/servicios",
      icon: "🔧",
      title: "Servicios",
      subtitle: "Mano de obra",
      gradient: "linear-gradient(135deg, #0ea5e9, #06b6d4)"
    },
    {
      href: "/configuracion",
      icon: "🎛️",
      title: "Configuración",
      subtitle: "Descuentos y bot",
      gradient: "linear-gradient(135deg, #475569, #1e293b)"
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

      {/* ALERTA DE CUMPLEAÑOS */}
      {m.cumples.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, #fef3c7, #fde68a)",
          border: "2px solid #f59e0b",
          borderRadius: 14,
          padding: 18,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          boxShadow: "0 4px 16px rgba(245,158,11,0.25)"
        }}>
          <div style={{ fontSize: 42 }}>🎂</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 800, color: "#78350f", fontSize: 17 }}>
              {m.cumples.length} cumpleaños esta semana
            </div>
            <div style={{ fontSize: 13, color: "#92400e", marginTop: 4 }}>
              {m.cumples.slice(0, 3).map((c: any, i: number) => (
                <span key={c.id}>
                  {i > 0 && " · "}
                  <strong>{c.nombre}</strong>
                  {" "}({c.dias_hasta === 0 ? "¡HOY!" : c.dias_hasta === 1 ? "mañana" : `en ${c.dias_hasta} días`})
                </span>
              ))}
              {m.cumples.length > 3 && ` · +${m.cumples.length - 3} más`}
            </div>
          </div>
        </div>
      )}

      {/* ALERTA DE TAREAS VENCIDAS */}
      {m.tareas.vencidas > 0 && (
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
            boxShadow: "0 4px 16px rgba(239,68,68,0.2)"
          }}>
            <div style={{ fontSize: 36 }}>🔴</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: "#991b1b", fontSize: 17 }}>
                {m.tareas.vencidas} {m.tareas.vencidas === 1 ? "tarea vencida" : "tareas vencidas"}
              </div>
              <div style={{ fontSize: 13, color: "#b91c1c", marginTop: 2 }}>
                Contactá a esos clientes para recuperar ventas
              </div>
            </div>
            <div style={{ fontSize: 28, color: "#991b1b", fontWeight: 700 }}>→</div>
          </div>
        </Link>
      )}

      {/* MÉTRICAS */}
      <div className="dashboard-grid" style={{ marginBottom: 32 }}>
        <Card title="Clientes" value={m.totalClientes} icon="👥" color="#0ea5e9" subtitle="Registrados" />
        <Card title="Órdenes activas" value={m.ordenesEnProceso} icon="🔧" color="#8b5cf6" subtitle="En proceso" />
        <Card title="Cobrado hoy" value={"$" + Number(m.cobradoHoy).toLocaleString("es-AR")} icon="💰" color="#10b981" subtitle="Efectivo + transferencia" />
        <Card title="Tareas pendientes" value={totalTareasPendientes} icon="📋" color={m.tareas.vencidas > 0 ? "#ef4444" : "#f59e0b"} subtitle={m.tareas.vencidas > 0 ? m.tareas.vencidas + " vencidas" : "Al día"} />
      </div>

      {/* ACCIONES RÁPIDAS */}
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 16, letterSpacing: -0.3 }}>
        ⚡ Acciones rápidas
      </h2>

      <div className="quick-grid" style={{ marginBottom: 32 }}>
        {accesosAcciones.map(a => (
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

      {/* SECCIONES (mismo estilo que arriba) */}
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 16, letterSpacing: -0.3 }}>
        🗂️ Secciones
      </h2>

      <div className="quick-grid" style={{ marginBottom: 32 }}>
        {accesosSecciones.map(a => (
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="dashboard-columns">
        <div className="form-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 17, color: "#0f172a", fontWeight: 700 }}>📅 Resumen de tareas</h2>
            <Link href="/tareas" style={{ fontSize: 13, color: "#0ea5e9", fontWeight: 600 }}>Ver todas →</Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "#fef2f2", borderRadius: 8, borderLeft: "3px solid #ef4444" }}>
              <span style={{ fontSize: 14, color: "#991b1b", fontWeight: 500 }}>🔴 Vencidas</span>
              <span style={{ fontWeight: 700, color: "#991b1b" }}>{m.tareas.vencidas}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "#fef9c3", borderRadius: 8, borderLeft: "3px solid #eab308" }}>
              <span style={{ fontSize: 14, color: "#713f12", fontWeight: 500 }}>🟡 Para hoy</span>
              <span style={{ fontWeight: 700, color: "#713f12" }}>{m.tareas.hoy}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "#e0f2fe", borderRadius: 8, borderLeft: "3px solid #0ea5e9" }}>
              <span style={{ fontSize: 14, color: "#0c4a6e", fontWeight: 500 }}>📅 Próximos 7 días</span>
              <span style={{ fontWeight: 700, color: "#0c4a6e" }}>{m.tareas.proximos_7_dias}</span>
            </div>
          </div>
        </div>

        <div className="form-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 17, color: "#0f172a", fontWeight: 700 }}>⚠️ Stock bajo</h2>
            <Link href="/productos" style={{ fontSize: 13, color: "#0ea5e9", fontWeight: 600 }}>Ver todos →</Link>
          </div>

          {m.productosBajos.length === 0 ? (
            <div style={{ textAlign: "center", padding: 24, color: "#94a3b8", fontSize: 14 }}>
              ✅ Todo el inventario está en orden
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {m.productosBajos.map((p: any) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#fef2f2", borderRadius: 8, borderLeft: "3px solid #ef4444" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{p.nombre}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Mínimo: {p.stock_minimo}</div>
                  </div>
                  <div style={{ background: "#ef4444", color: "white", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
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