import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
