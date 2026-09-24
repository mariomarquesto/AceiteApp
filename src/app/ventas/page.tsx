import Link from "next/link";

async function fetchVentas() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(base + "/api/ventas", { cache: "no-store" });
  const json = await res.json();
  return json.data || [];
}

const estadoBadge: Record<string, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "#f59e0b" },
  parcial: { label: "Parcial", color: "#3b82f6" },
  pagada: { label: "Pagada", color: "#16a34a" },
  cuenta_corriente: { label: "Cta. cte.", color: "#ef4444" }
};

export default async function VentasPage() {
  const ventas = await fetchVentas();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 26 }}>Ventas</h1>
        <Link href="/ventas/nueva" className="btn btn-primary">
          + Nueva venta
        </Link>
      </div>

      {ventas.length === 0 ? (
        <div style={{ background: "white", padding: 40, borderRadius: 10, textAlign: "center", color: "#64748b" }}>
          No hay ventas registradas aún.
        </div>
      ) : (
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
              const badge = anulada
                ? { label: "Anulada", color: "#94a3b8" }
                : estadoBadge[v.estado_pago] || estadoBadge.pendiente;
              return (
                <tr key={v.id} style={{ cursor: "pointer" }}>
                  <td>
                    <Link href={"/ventas/" + v.id} style={{ fontWeight: 600, color: "#0ea5e9" }}>
                      #{v.numero}
                    </Link>
                  </td>
                  <td style={{ color: "#64748b", fontSize: 13 }}>
                    {new Date(v.fecha).toLocaleDateString("es-AR")}
                  </td>
                  <td>{v.cliente?.nombre || "Consumidor final"}</td>
                  <td style={{ fontWeight: 600 }}>
                    {"$" + Number(v.total).toLocaleString("es-AR")}
                  </td>
                  <td style={{ color: Number(v.saldo) > 0 ? "#ef4444" : "#16a34a" }}>
                    {"$" + Number(v.saldo).toLocaleString("es-AR")}
                  </td>
                  <td>
                    <span style={{
                      background: badge.color + "20",
                      color: badge.color,
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {badge.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
