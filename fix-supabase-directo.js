const fs = require("fs");
const path = require("path");

function w(file, content) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content, "utf8");
  console.log("OK:", file);
}

// ============================================
// DASHBOARD - page.tsx
// ============================================
w("src/app/page.tsx", `import Card from "./components/Card";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

async function getMetricas() {
  const [
    clientes,
    productos,
    stockBajo,
    pagosHoy,
    tareasResumen,
    ordenesEnProceso
  ] = await Promise.all([
    supabase.from("clientes").select("id", { count: "exact", head: true }).eq("activo", true),
    supabase.from("productos").select("id", { count: "exact", head: true }).eq("activo", true),
    supabase.from("v_stock_bajo").select("*").limit(5),
    supabase.from("pagos").select("monto, medio").gte("fecha", new Date().toISOString().slice(0, 10)),
    supabase.from("tareas").select("estado, fecha_vencimiento, fecha_completada").eq("estado", "pendiente"),
    supabase.from("ordenes").select("id", { count: "exact", head: true }).eq("estado", "en_proceso")
  ]);

  const hoy = new Date().toISOString().slice(0, 10);
  const en7dias = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const tareasPendientes = tareasResumen.data || [];
  const vencidas = tareasPendientes.filter(t => t.fecha_vencimiento < hoy).length;
  const hoyTareas = tareasPendientes.filter(t => t.fecha_vencimiento === hoy).length;
  const proximos7 = tareasPendientes.filter(t => t.fecha_vencimiento > hoy && t.fecha_vencimiento <= en7dias).length;

  const cobradoHoy = (pagosHoy.data || []).reduce((s, p) => s + Number(p.monto), 0);

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
    ordenesEnProceso: ordenesEnProceso.count || 0
  };
}

export default async function Home() {
  const m = await getMetricas();
  const totalTareasPendientes = m.tareas.vencidas + m.tareas.hoy + m.tareas.proximos_7_dias;

  const accesos = [
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Panel de control</h1>
          <div className="page-subtitle">Resumen de tu negocio en tiempo real</div>
        </div>
      </div>

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

      <div className="dashboard-grid" style={{ marginBottom: 32 }}>
        <Card title="Clientes" value={m.totalClientes} icon="👥" color="#0ea5e9" subtitle="Registrados" />
        <Card title="Órdenes activas" value={m.ordenesEnProceso} icon="🔧" color="#8b5cf6" subtitle="En proceso" />
        <Card title="Cobrado hoy" value={"$" + Number(m.cobradoHoy).toLocaleString("es-AR")} icon="💰" color="#10b981" subtitle="Efectivo + transferencia" />
        <Card title="Tareas pendientes" value={totalTareasPendientes} icon="📋" color={m.tareas.vencidas > 0 ? "#ef4444" : "#f59e0b"} subtitle={m.tareas.vencidas > 0 ? m.tareas.vencidas + " vencidas" : "Al día"} />
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 16, letterSpacing: -0.3 }}>
        ⚡ Accesos rápidos
      </h2>

      <div className="quick-grid" style={{ marginBottom: 32 }}>
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
`);

// ============================================
// CLIENTES
// ============================================
w("src/app/clientes/page.tsx", `import Link from "next/link";
import { supabase } from "@/lib/supabase";

async function getClientes() {
  const { data } = await supabase
    .from("clientes")
    .select("*")
    .eq("activo", true)
    .order("nombre");
  return data || [];
}

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <div className="page-subtitle">
            {clientes.length} {clientes.length === 1 ? "cliente registrado" : "clientes registrados"}
          </div>
        </div>
        <Link href="/clientes/nuevo" className="btn btn-primary">+ Nuevo cliente</Link>
      </div>

      {clientes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginBottom: 6 }}>No hay clientes aún</div>
          <Link href="/clientes/nuevo" className="btn btn-primary">+ Nuevo cliente</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Cuenta cte.</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c: any) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: "#0f172a" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                        {c.nombre.charAt(0).toUpperCase()}
                      </div>
                      {c.nombre}
                    </div>
                  </td>
                  <td style={{ color: "#64748b" }}>{c.telefono || "—"}</td>
                  <td style={{ color: "#64748b" }}>{c.email || "—"}</td>
                  <td>
                    {c.permite_cuenta_corriente ? (
                      <span className="badge" style={{ background: "#dcfce7", color: "#16a34a" }}>✓ Habilitada</span>
                    ) : (
                      <span style={{ color: "#cbd5e1" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
`);

// ============================================
// PRODUCTOS
// ============================================
w("src/app/productos/page.tsx", `import Link from "next/link";
import { supabase } from "@/lib/supabase";

async function getProductos() {
  const { data } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("nombre");
  return data || [];
}

const tipoInfo: Record<string, { label: string; color: string; icon: string }> = {
  aceite: { label: "Aceite", color: "#f59e0b", icon: "🛢️" },
  filtro: { label: "Filtro", color: "#0ea5e9", icon: "🔧" },
  repuesto: { label: "Repuesto", color: "#8b5cf6", icon: "⚙️" },
  insumo: { label: "Insumo", color: "#64748b", icon: "📦" }
};

export default async function ProductosPage() {
  const productos = await getProductos();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Productos</h1>
          <div className="page-subtitle">
            {productos.length} {productos.length === 1 ? "producto" : "productos"} en inventario
          </div>
        </div>
        <Link href="/productos/nuevo" className="btn btn-primary">+ Nuevo producto</Link>
      </div>

      {productos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginBottom: 6 }}>No hay productos</div>
          <Link href="/productos/nuevo" className="btn btn-primary">+ Nuevo producto</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Marca</th>
                <th>Stock</th>
                <th style={{ textAlign: "right" }}>Precio</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p: any) => {
                const stockBajo = p.stock <= p.stock_minimo;
                const info = tipoInfo[p.tipo] || tipoInfo.insumo;
                return (
                  <tr key={p.id}>
                    <td>
                      <Link href={"/productos/" + p.id} style={{ fontWeight: 600, color: "#0f172a", textDecoration: "none" }}>
                        {p.nombre}
                      </Link>
                      {p.codigo && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{p.codigo}</div>}
                    </td>
                    <td>
                      <span className="badge" style={{ background: info.color + "15", color: info.color }}>
                        {info.icon} {info.label}
                      </span>
                    </td>
                    <td style={{ color: "#64748b" }}>{p.marca || "—"}</td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, color: stockBajo ? "#ef4444" : "#16a34a" }}>
                        {stockBajo && "⚠️"}{p.stock}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{"$" + Number(p.precio_venta).toLocaleString("es-AR")}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={"/productos/" + p.id} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }}>✏️ Editar</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
`);

// ============================================
// VENTAS
// ============================================
w("src/app/ventas/page.tsx", `import Link from "next/link";
import { supabase } from "@/lib/supabase";

async function getVentas() {
  const { data } = await supabase
    .from("ventas")
    .select("*, cliente:clientes(id, nombre)")
    .order("fecha", { ascending: false })
    .limit(200);
  return data || [];
}

const estadoBadge: Record<string, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "#f59e0b" },
  parcial: { label: "Parcial", color: "#3b82f6" },
  pagada: { label: "Pagada", color: "#16a34a" },
  cuenta_corriente: { label: "Cta. cte.", color: "#ef4444" }
};

export default async function VentasPage() {
  const ventas = await getVentas();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ventas</h1>
          <div className="page-subtitle">{ventas.length} ventas registradas</div>
        </div>
        <Link href="/ventas/nueva" className="btn btn-primary">+ Nueva venta</Link>
      </div>

      {ventas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginBottom: 6 }}>No hay ventas</div>
          <Link href="/ventas/nueva" className="btn btn-primary">+ Nueva venta</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Saldo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v: any) => {
                const anulada = v.notas && v.notas.includes("[ANULADA]");
                const badge = anulada ? { label: "Anulada", color: "#94a3b8" } : estadoBadge[v.estado_pago] || estadoBadge.pendiente;
                return (
                  <tr key={v.id}>
                    <td>
                      <Link href={"/ventas/" + v.id} style={{ fontWeight: 600, color: "#0ea5e9", textDecoration: "none" }}>#{v.numero}</Link>
                    </td>
                    <td style={{ color: "#64748b", fontSize: 13 }}>{new Date(v.fecha).toLocaleDateString("es-AR")}</td>
                    <td>{v.cliente?.nombre || "Consumidor final"}</td>
                    <td style={{ fontWeight: 600 }}>{"$" + Number(v.total).toLocaleString("es-AR")}</td>
                    <td style={{ color: Number(v.saldo) > 0 ? "#ef4444" : "#16a34a" }}>{"$" + Number(v.saldo).toLocaleString("es-AR")}</td>
                    <td>
                      <span className="badge" style={{ background: badge.color + "20", color: badge.color }}>{badge.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
`);

// ============================================
// CUENTA CORRIENTE
// ============================================
w("src/app/cuenta-corriente/page.tsx", `import { supabase } from "@/lib/supabase";

async function getSaldos() {
  const { data } = await supabase.from("v_saldos_clientes").select("*");
  return data || [];
}

export default async function CuentaCorrientePage() {
  const saldos = await getSaldos();
  const conDeuda = saldos.filter((s: any) => Number(s.saldo) > 0);
  const totalDeuda = conDeuda.reduce((sum: number, s: any) => sum + Number(s.saldo), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Cuenta corriente</h1>
          <div className="page-subtitle">Saldos de clientes</div>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: 24, display: "flex", gap: 40 }}>
        <div>
          <div style={{ fontSize: 13, color: "#64748b" }}>Total por cobrar</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>{"$" + totalDeuda.toLocaleString("es-AR")}</div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: "#64748b" }}>Clientes con deuda</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{conDeuda.length}</div>
        </div>
      </div>

      {saldos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#475569" }}>No hay movimientos aún</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Deudas</th>
                <th>Abonos</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {saldos.map((s: any) => {
                const debe = Number(s.saldo) > 0;
                return (
                  <tr key={s.cliente_id}>
                    <td style={{ fontWeight: 500 }}>{s.nombre}</td>
                    <td style={{ color: "#64748b" }}>{s.telefono || "-"}</td>
                    <td>{"$" + Number(s.total_deudas).toLocaleString("es-AR")}</td>
                    <td>{"$" + Number(s.total_abonos).toLocaleString("es-AR")}</td>
                    <td style={{ fontWeight: 700, color: debe ? "#ef4444" : Number(s.saldo) < 0 ? "#16a34a" : "#64748b" }}>
                      {"$" + Number(s.saldo).toLocaleString("es-AR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
`);

// ============================================
// VEHICULOS
// ============================================
w("src/app/vehiculos/page.tsx", `import Link from "next/link";
import { supabase } from "@/lib/supabase";

async function getVehiculos() {
  const { data } = await supabase
    .from("vehiculos")
    .select("*, cliente:clientes(id, nombre, telefono)")
    .eq("activo", true)
    .order("created_at", { ascending: false });
  return data || [];
}

const tipoLabel: Record<string, string> = {
  particular: "🚗 Particular",
  taxi: "🚕 Taxi",
  uber: "🚙 Uber",
  remis: "🚖 Remis",
  flota: "🚐 Flota",
  empresa: "🏢 Empresa",
  moto: "🏍️ Moto",
  otro: "🚗 Otro"
};

export default async function VehiculosPage() {
  const vehiculos = await getVehiculos();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehículos</h1>
          <div className="page-subtitle">
            {vehiculos.length} {vehiculos.length === 1 ? "vehículo" : "vehículos"} registrados
          </div>
        </div>
        <Link href="/vehiculos/nuevo" className="btn btn-primary">+ Nuevo vehículo</Link>
      </div>

      {vehiculos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚗</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginBottom: 6 }}>No hay vehículos</div>
          <Link href="/vehiculos/nuevo" className="btn btn-primary">+ Nuevo vehículo</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Vehículo</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Km</th>
                <th>Próximo cambio</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v: any) => (
                <tr key={v.id}>
                  <td>
                    <Link href={"/vehiculos/" + v.id} style={{ fontWeight: 600, color: "#0f172a", textDecoration: "none" }}>
                      {v.marca} {v.modelo}
                    </Link>
                    {v.placa && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{v.placa}</div>}
                  </td>
                  <td style={{ color: "#64748b" }}>{v.cliente?.nombre || "—"}</td>
                  <td>
                    <span className="badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                      {tipoLabel[v.tipo_uso] || tipoLabel.otro}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{Number(v.km_actual).toLocaleString("es-AR")}</td>
                  <td style={{ color: "#64748b", fontSize: 13 }}>
                    {v.proximo_cambio_fecha ? new Date(v.proximo_cambio_fecha).toLocaleDateString("es-AR") : "—"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link href={"/vehiculos/" + v.id} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }}>✏️ Editar</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
`);

console.log("\\n✅ Paginas convertidas a Supabase directo");
