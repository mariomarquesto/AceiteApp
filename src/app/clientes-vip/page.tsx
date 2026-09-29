import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getRanking() {
  const { data: ventas } = await supabase
    .from("ventas")
    .select("total, cliente:clientes(id, nombre, telefono)")
    .not("cliente_id", "is", null);

  const { data: ordenes } = await supabase
    .from("ordenes")
    .select("total, cliente:clientes(id, nombre, telefono)");

  const ranking: Record<string, any> = {};

  for (const v of [...(ventas || []), ...(ordenes || [])]) {
    const c = (v as any).cliente;
    if (!c?.id) continue;
    if (!ranking[c.id]) {
      ranking[c.id] = {
        id: c.id,
        nombre: c.nombre,
        telefono: c.telefono || "",
        total: 0,
        operaciones: 0
      };
    }
    ranking[c.id].total += Number(v.total);
    ranking[c.id].operaciones += 1;
  }

  return Object.values(ranking)
    .map((r: any) => ({ ...r, promedio: r.total / r.operaciones }))
    .sort((a: any, b: any) => b.total - a.total);
}

export default async function ClientesVIPPage() {
  const ranking = await getRanking();
  const medallas = ["🥇", "🥈", "🥉"];
  const colores = ["#f59e0b", "#94a3b8", "#92400e"];
  const totalFacturado = ranking.reduce((s: number, r: any) => s + r.total, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🏆 Ranking de clientes</h1>
          <div className="page-subtitle">Los mejores clientes por facturación</div>
        </div>
      </div>

      {ranking.length >= 3 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          marginBottom: 32,
          alignItems: "flex-end"
        }} className="dashboard-columns">
          <div className="form-card" style={{ textAlign: "center", padding: 24, borderTop: `4px solid ${colores[1]}` }}>
            <div style={{ fontSize: 40 }}>🥈</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}>{ranking[1].nombre}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: colores[1], marginTop: 8 }}>
              {"$" + Math.round(ranking[1].total).toLocaleString("es-AR")}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
              {ranking[1].operaciones} operaciones
            </div>
          </div>

          <div className="form-card" style={{
            textAlign: "center", padding: 32,
            borderTop: `4px solid ${colores[0]}`,
            boxShadow: "0 8px 32px rgba(245,158,11,0.2)",
            transform: "scale(1.05)"
          }}>
            <div style={{ fontSize: 56 }}>🥇</div>
            <div style={{ fontWeight: 900, fontSize: 18, marginTop: 8 }}>{ranking[0].nombre}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: colores[0], marginTop: 8 }}>
              {"$" + Math.round(ranking[0].total).toLocaleString("es-AR")}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
              {ranking[0].operaciones} operaciones
            </div>
          </div>

          <div className="form-card" style={{ textAlign: "center", padding: 24, borderTop: `4px solid ${colores[2]}` }}>
            <div style={{ fontSize: 40 }}>🥉</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}>{ranking[2].nombre}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: colores[2], marginTop: 8 }}>
              {"$" + Math.round(ranking[2].total).toLocaleString("es-AR")}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
              {ranking[2].operaciones} operaciones
            </div>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th style={{ textAlign: "right" }}>Facturado</th>
              <th style={{ textAlign: "right" }}>Operaciones</th>
              <th style={{ textAlign: "right" }}>Promedio</th>
              <th style={{ textAlign: "right" }}>% del total</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((r: any, i: number) => {
              const medalla = medallas[i] || `${i + 1}º`;
              const porcentaje = (r.total / totalFacturado) * 100;
              return (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, fontSize: 16 }}>{medalla}</td>
                  <td>
                    <Link href={"/clientes/" + r.id} style={{ textDecoration: "none", color: "#0ea5e9", fontWeight: 600 }}>
                      {r.nombre}
                    </Link>
                  </td>
                  <td style={{ color: "#64748b" }}>{r.telefono || "—"}</td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "#16a34a" }}>
                    {"$" + Math.round(r.total).toLocaleString("es-AR")}
                  </td>
                  <td style={{ textAlign: "right" }}>{r.operaciones}</td>
                  <td style={{ textAlign: "right", color: "#64748b" }}>
                    {"$" + Math.round(r.promedio).toLocaleString("es-AR")}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 600, color: "#0ea5e9" }}>
                    {porcentaje.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}