async function fetchSaldos() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(base + "/api/cuenta-corriente", { cache: "no-store" });
  const json = await res.json();
  return json.data || [];
}

export default async function CuentaCorrientePage() {
  const saldos = await fetchSaldos();
  const conDeuda = saldos.filter((s: any) => Number(s.saldo) > 0);
  const totalDeuda = conDeuda.reduce((sum: number, s: any) => sum + Number(s.saldo), 0);

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>Cuenta corriente</h1>

      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        marginBottom: 24,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        display: "flex",
        gap: 40
      }}>
        <div>
          <div style={{ fontSize: 13, color: "#64748b" }}>Total por cobrar</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>
            {"$" + totalDeuda.toLocaleString("es-AR")}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: "#64748b" }}>Clientes con deuda</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{conDeuda.length}</div>
        </div>
      </div>

      {saldos.length === 0 ? (
        <div style={{
          background: "white",
          padding: 40,
          borderRadius: 10,
          textAlign: "center",
          color: "#64748b"
        }}>
          No hay movimientos aún.
        </div>
      ) : (
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
                  <td style={{
                    fontWeight: 700,
                    color: debe ? "#ef4444" : Number(s.saldo) < 0 ? "#16a34a" : "#64748b"
                  }}>
                    {"$" + Number(s.saldo).toLocaleString("es-AR")}
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
