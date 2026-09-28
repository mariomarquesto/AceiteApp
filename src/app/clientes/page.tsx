import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c: any) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: "#0f172a" }}>
                    <Link href={"/clientes/" + c.id} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                        {c.nombre.charAt(0).toUpperCase()}
                      </div>
                      {c.nombre}
                    </Link>
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
                  <td style={{ textAlign: "right" }}>
                    <Link href={"/clientes/" + c.id} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }}>
                      ✏️ Editar
                    </Link>
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
