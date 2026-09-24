import Link from "next/link";

async function fetchClientes() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(base + "/api/clientes", { cache: "no-store" });
  const json = await res.json();
  return json.data || [];
}

export default async function ClientesPage() {
  const clientes = await fetchClientes();

  return (
    <div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24
      }}>
        <h1 style={{ fontSize: 26 }}>Clientes</h1>
        <Link href="/clientes/nuevo" className="btn btn-primary">
          + Nuevo cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <div style={{
          background: "white",
          padding: 40,
          borderRadius: 10,
          textAlign: "center",
          color: "#64748b"
        }}>
          No hay clientes aún. Cargá el primero.
        </div>
      ) : (
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
                <td style={{ fontWeight: 500 }}>{c.nombre}</td>
                <td style={{ color: "#64748b" }}>{c.telefono || "-"}</td>
                <td style={{ color: "#64748b" }}>{c.email || "-"}</td>
                <td>{c.permite_cuenta_corriente ? "✅" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
