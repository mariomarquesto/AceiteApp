import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getPresupuestos() {
  const { data } = await supabase
    .from("presupuestos")
    .select("*, cliente:clientes(id, nombre, telefono), vehiculo:vehiculos(marca, modelo, placa), items:presupuesto_items(*)")
    .order("created_at", { ascending: false })
    .limit(100);
  return data || [];
}

const estadoBadge: Record<string, { label: string; color: string }> = {
  borrador: { label: "Borrador", color: "#64748b" },
  enviado: { label: "Enviado", color: "#0ea5e9" },
  aceptado: { label: "Aceptado", color: "#16a34a" },
  rechazado: { label: "Rechazado", color: "#ef4444" },
  convertido: { label: "Convertido", color: "#8b5cf6" },
  vencido: { label: "Vencido", color: "#f59e0b" }
};

export default async function PresupuestosPage() {
  const presupuestos = await getPresupuestos();

  const totales = {
    borrador: presupuestos.filter((p: any) => p.estado === "borrador").length,
    enviado: presupuestos.filter((p: any) => p.estado === "enviado").length,
    aceptado: presupuestos.filter((p: any) => p.estado === "aceptado").length,
    convertido: presupuestos.filter((p: any) => p.estado === "convertido").length
  };

  const montoTotal = presupuestos
    .filter((p: any) => p.estado === "convertido" || p.estado === "aceptado")
    .reduce((s: number, p: any) => s + Number(p.total), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📄 Presupuestos</h1>
          <div className="page-subtitle">Cotizaciones enviadas a clientes</div>
        </div>
        <Link href="/presupuestos/nuevo" className="btn btn-primary">
          + Nuevo presupuesto
        </Link>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">📝 Borradores</div>
          <div className="card-value" style={{ color: "#64748b" }}>{totales.borrador}</div>
          <div className="card-subtitle">Sin enviar</div>
        </div>
        <div className="card">
          <div className="card-title">📤 Enviados</div>
          <div className="card-value" style={{ color: "#0ea5e9" }}>{totales.enviado}</div>
          <div className="card-subtitle">Esperando respuesta</div>
        </div>
        <div className="card">
          <div className="card-title">✅ Aceptados</div>
          <div className="card-value" style={{ color: "#16a34a" }}>{totales.aceptado}</div>
          <div className="card-subtitle">Por convertir</div>
        </div>
        <div className="card">
          <div className="card-title">💰 Facturado</div>
          <div className="card-value" style={{ color: "#8b5cf6", fontSize: 24 }}>
            {"$" + Math.round(montoTotal).toLocaleString("es-AR")}
          </div>
          <div className="card-subtitle">De aceptados y convertidos</div>
        </div>
      </div>

      {presupuestos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            No hay presupuestos aún
          </div>
          <div style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>
            Creá el primero para empezar a cotizar
          </div>
          <Link href="/presupuestos/nuevo" className="btn btn-primary">+ Nuevo presupuesto</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Vehículo</th>
                <th>Vence</th>
                <th style={{ textAlign: "right" }}>Total</th>
                <th>Estado</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {presupuestos.map((p: any) => {
                const badge = estadoBadge[p.estado] || estadoBadge.borrador;
                const vencido = p.fecha_vencimiento && new Date(p.fecha_vencimiento) < new Date() && p.estado !== "convertido" && p.estado !== "aceptado";
                return (
                  <tr key={p.id}>
                    <td>
                      <Link href={"/presupuestos/" + p.id} style={{ fontWeight: 700, color: "#0ea5e9", textDecoration: "none" }}>
                        #{p.numero}
                      </Link>
                    </td>
                    <td style={{ color: "#64748b", fontSize: 13 }}>
                      {new Date(p.created_at).toLocaleDateString("es-AR")}
                    </td>
                    <td style={{ fontWeight: 500 }}>{p.cliente?.nombre || "—"}</td>
                    <td style={{ color: "#64748b", fontSize: 13 }}>
                      {p.vehiculo ? `${p.vehiculo.marca} ${p.vehiculo.modelo}` : "—"}
                    </td>
                    <td style={{ fontSize: 12, color: vencido ? "#ef4444" : "#64748b", fontWeight: vencido ? 600 : 400 }}>
                      {p.fecha_vencimiento ? new Date(p.fecha_vencimiento).toLocaleDateString("es-AR") : "—"}
                      {vencido && " ⚠️"}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                      {"$" + Number(p.total).toLocaleString("es-AR")}
                    </td>
                    <td>
                      <span className="badge" style={{ background: badge.color + "20", color: badge.color }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={"/presupuestos/" + p.id} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }}>
                        Ver
                      </Link>
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