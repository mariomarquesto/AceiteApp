import Link from "next/link";
import { supabase } from "@/lib/supabase";

async function getVehiculos() {
  const { data } = await supabase
    .from("vehiculos")
    .select("*, cliente:clientes(id, nombre, telefono)")
    .eq("activo", true)
    .order("created_at", { ascending: false });
  return data || [];
}

const tipoLabel: Record<string, string> = {
  particular: "🚗 Particular",
  taxi: "🚕 Taxi",
  uber: "🚙 Uber",
  remis: "🚖 Remis",
  flota: "🚐 Flota",
  empresa: "🏢 Empresa",
  moto: "🏍️ Moto",
  otro: "🚗 Otro"
};

export default async function VehiculosPage() {
  const vehiculos = await getVehiculos();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehículos</h1>
          <div className="page-subtitle">
            {vehiculos.length} {vehiculos.length === 1 ? "vehículo" : "vehículos"} registrados
          </div>
        </div>
        <Link href="/vehiculos/nuevo" className="btn btn-primary">+ Nuevo vehículo</Link>
      </div>

      {vehiculos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚗</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginBottom: 6 }}>No hay vehículos</div>
          <Link href="/vehiculos/nuevo" className="btn btn-primary">+ Nuevo vehículo</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Vehículo</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Km</th>
                <th>Próximo cambio</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v: any) => (
                <tr key={v.id}>
                  <td>
                    <Link href={"/vehiculos/" + v.id} style={{ fontWeight: 600, color: "#0f172a", textDecoration: "none" }}>
                      {v.marca} {v.modelo}
                    </Link>
                    {v.placa && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{v.placa}</div>}
                  </td>
                  <td style={{ color: "#64748b" }}>{v.cliente?.nombre || "—"}</td>
                  <td>
                    <span className="badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                      {tipoLabel[v.tipo_uso] || tipoLabel.otro}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{Number(v.km_actual).toLocaleString("es-AR")}</td>
                  <td style={{ color: "#64748b", fontSize: 13 }}>
                    {v.proximo_cambio_fecha ? new Date(v.proximo_cambio_fecha).toLocaleDateString("es-AR") : "—"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link href={"/vehiculos/" + v.id} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }}>✏️ Editar</Link>
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
