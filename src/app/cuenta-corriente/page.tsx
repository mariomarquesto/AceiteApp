import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getSaldos() {
  const { data } = await supabase.from("v_saldos_clientes").select("*");
  return data || [];
}

async function getConfig() {
  const { data } = await supabase.from("configuracion").select("*").eq("id", 1).single();
  return data;
}

export default async function CuentaCorrientePage() {
  const [saldos, config] = await Promise.all([getSaldos(), getConfig()]);

  const conDeuda = saldos.filter((s: any) => Number(s.saldo) > 0);
  const totalDeuda = conDeuda.reduce((sum: number, s: any) => sum + Number(s.saldo || 0), 0);
  const totalMora = saldos.reduce((sum: number, s: any) => sum + Number(s.total_mora || 0), 0);
  const totalBase = totalDeuda - totalMora;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">💳 Cuenta corriente</h1>
          <div className="page-subtitle">Saldos de clientes</div>
        </div>
        <Link href="/configuracion" className="btn btn-secondary">
          ⚙️ Configuración
        </Link>
      </div>

      {/* Cards de resumen */}
      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">💰 Total por cobrar</div>
          <div className="card-value" style={{ color: "#ef4444" }}>
            {"$" + totalDeuda.toLocaleString("es-AR")}
          </div>
          <div className="card-subtitle">Incluye mora</div>
        </div>
        <div className="card">
          <div className="card-title">📋 Deuda original</div>
          <div className="card-value">
            {"$" + totalBase.toLocaleString("es-AR")}
          </div>
          <div className="card-subtitle">Sin recargos</div>
        </div>
        <div className="card">
          <div className="card-title">⏰ Mora acumulada</div>
          <div className="card-value" style={{ color: "#f97316" }}>
            {"$" + totalMora.toLocaleString("es-AR")}
          </div>
          <div className="card-subtitle">
            {config?.activar_mora ? `${config.porcentaje_mora_mensual}% mensual` : "Desactivada"}
          </div>
        </div>
        <div className="card">
          <div className="card-title">👥 Clientes con deuda</div>
          <div className="card-value">{conDeuda.length}</div>
          <div className="card-subtitle">Requieren cobro</div>
        </div>
      </div>

      {config?.activar_mora && (
        <div style={{
          background: "#fef3c7",
          border: "1px solid #fcd34d",
          borderRadius: 10,
          padding: 14,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 13,
          color: "#78350f"
        }}>
          <span style={{ fontSize: 22 }}>⏰</span>
          <div>
            <strong>Mora activa:</strong> se aplica un recargo del {config.porcentaje_mora_mensual}% mensual
            {" "}después de {config.dias_vencimiento} días desde la emisión.
          </div>
        </div>
      )}

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
                <th style={{ textAlign: "right" }}>Deuda</th>
                <th style={{ textAlign: "right" }}>Mora</th>
                <th style={{ textAlign: "right" }}>Abonos</th>
                <th style={{ textAlign: "right" }}>Saldo</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {saldos.map((s: any) => {
                const debe = Number(s.saldo) > 0;
                const tieneMora = Number(s.total_mora || 0) > 0;
                return (
                  <tr key={s.cliente_id}>
                    <td>
                      <Link
                        href={"/cuenta-corriente/" + s.cliente_id}
                        style={{ textDecoration: "none", color: "#0ea5e9", fontWeight: 600 }}
                      >
                        {s.nombre}
                      </Link>
                    </td>
                    <td style={{ color: "#64748b" }}>{s.telefono || "-"}</td>
                    <td style={{ textAlign: "right" }}>
                      {"$" + Number(s.total_deudas - (s.total_mora || 0)).toLocaleString("es-AR")}
                    </td>
                    <td style={{ textAlign: "right", color: tieneMora ? "#f97316" : "#cbd5e1", fontWeight: tieneMora ? 600 : 400 }}>
                      {tieneMora ? "$" + Number(s.total_mora).toLocaleString("es-AR") : "—"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {"$" + Number(s.total_abonos).toLocaleString("es-AR")}
                    </td>
                    <td style={{
                      textAlign: "right",
                      fontWeight: 700,
                      color: debe ? "#ef4444" : Number(s.saldo) < 0 ? "#16a34a" : "#64748b"
                    }}>
                      {"$" + Number(s.saldo).toLocaleString("es-AR")}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={"/cuenta-corriente/" + s.cliente_id}
                        className="btn btn-secondary"
                        style={{ padding: "6px 12px", fontSize: 13 }}
                      >
                        Ver detalle
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