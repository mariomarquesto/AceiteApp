import { supabase } from "@/lib/supabase";

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
