import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getServicios() {
  const { data } = await supabase
    .from("servicios")
    .select("*")
    .eq("activo", true)
    .order("nombre");
  return data || [];
}

export default async function ServiciosPage() {
  const servicios = await getServicios();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Servicios</h1>
          <div className="page-subtitle">
            {servicios.length} {servicios.length === 1 ? "servicio" : "servicios"} de mano de obra
          </div>
        </div>
        <Link href="/servicios/nuevo" className="btn btn-primary">
          + Nuevo servicio
        </Link>
      </div>

      {servicios.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔧</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            No hay servicios aún
          </div>
          <Link href="/servicios/nuevo" className="btn btn-primary">
            + Nuevo servicio
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Descripción</th>
                <th style={{ textAlign: "right" }}>Precio</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s: any) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, color: "#0f172a" }}>
                    <Link href={"/servicios/" + s.id} style={{ textDecoration: "none", color: "inherit" }}>
                      {s.nombre}
                    </Link>
                  </td>
                  <td style={{ color: "#64748b" }}>
                    {s.descripcion || "—"}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                    {"$" + Number(s.precio).toLocaleString("es-AR")}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link
                      href={"/servicios/" + s.id}
                      className="btn btn-secondary"
                      style={{ padding: "6px 12px", fontSize: 13 }}
                    >
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
