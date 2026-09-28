import Link from "next/link";
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
