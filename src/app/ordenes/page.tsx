import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchOrdenes() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(base + "/api/ordenes", { cache: "no-store" });
  const json = await res.json();
  return json.data || [];
}

const estadoBadge: Record<string, { label: string; color: string }> = {
  en_proceso: { label: "En proceso", color: "#f59e0b" },
  completado: { label: "Completado", color: "#0ea5e9" },
  entregado: { label: "Entregado", color: "#16a34a" },
  cancelado: { label: "Cancelado", color: "#94a3b8" }
};

const pagoBadge: Record<string, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "#f59e0b" },
  parcial: { label: "Parcial", color: "#3b82f6" },
  pagada: { label: "Pagada", color: "#16a34a" },
  cuenta_corriente: { label: "Cta. cte.", color: "#ef4444" }
};

export default async function OrdenesPage() {
  const ordenes = await fetchOrdenes();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Órdenes de servicio</h1>
          <div className="page-subtitle">
            {ordenes.length} {ordenes.length === 1 ? "orden" : "órdenes"}
          </div>
        </div>
        <Link href="/ordenes/nueva" className="btn btn-primary">
          + Nueva orden
        </Link>
      </div>

      {ordenes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔧</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            No hay órdenes aún
          </div>
          <Link href="/ordenes/nueva" className="btn btn-primary">
            + Nueva orden
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Cliente / Vehículo</th>
                <th>Km</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Pago</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o: any) => {
                const est = estadoBadge[o.estado] || estadoBadge.en_proceso;
                const pag = pagoBadge[o.estado_pago] || pagoBadge.pendiente;
                return (
                  <tr key={o.id}>
                    <td>
                      <Link href={"/ordenes/" + o.id} style={{ fontWeight: 600, color: "#0ea5e9", textDecoration: "none" }}>
                        #{o.numero}
                      </Link>
                    </td>
                    <td style={{ color: "#64748b", fontSize: 13 }}>
                      {new Date(o.fecha).toLocaleDateString("es-AR")}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{o.cliente?.nombre}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {o.vehiculo?.marca} {o.vehiculo?.modelo} {o.vehiculo?.placa && "· " + o.vehiculo.placa}
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{Number(o.km_ingreso).toLocaleString("es-AR")}</td>
                    <td style={{ fontWeight: 700 }}>{"$" + Number(o.total).toLocaleString("es-AR")}</td>
                    <td>
                      <span className="badge" style={{ background: est.color + "20", color: est.color }}>
                        {est.label}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: pag.color + "20", color: pag.color }}>
                        {pag.label}
                      </span>
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
