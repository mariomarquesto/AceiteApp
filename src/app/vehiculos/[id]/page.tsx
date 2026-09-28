"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import RecordatorioBoton from "@/app/components/RecordatorioBoton";

export default function DetalleVehiculo() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [vehiculo, setVehiculo] = useState<any>(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    const res = await fetch("/api/vehiculos/" + id);
    const json = await res.json();
    setVehiculo(json.data);
    setForm(json.data);
  }

  useEffect(() => { cargar(); }, [id]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const res = await fetch("/api/vehiculos/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          anio: form.anio ? Number(form.anio) : null,
          km_actual: Number(form.km_actual),
          intervalo_km: Number(form.intervalo_km),
          intervalo_meses: Number(form.intervalo_meses)
        })
      });
      if (!res.ok) throw new Error("Error al guardar");
      setEditando(false);
      await cargar();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!confirm("¿Eliminar este vehículo?")) return;
    await fetch("/api/vehiculos/" + id, { method: "DELETE" });
    router.push("/vehiculos");
  }

  if (!vehiculo) return <div>Cargando...</div>;

  if (editando) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Editar vehículo</h1>
        </div>

        <form onSubmit={guardar} className="form-card" style={{ maxWidth: 640 }}>
          {error && (
            <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 18 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Marca</label>
              <input className="input" value={form.marca || ""} onChange={e => setForm({ ...form, marca: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Modelo</label>
              <input className="input" value={form.modelo || ""} onChange={e => setForm({ ...form, modelo: e.target.value })} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Año</label>
              <input type="number" className="input" value={form.anio || ""} onChange={e => setForm({ ...form, anio: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Patente</label>
              <input className="input" value={form.placa || ""} onChange={e => setForm({ ...form, placa: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <input className="input" value={form.color || ""} onChange={e => setForm({ ...form, color: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Km actual</label>
            <input type="number" className="input" value={form.km_actual || 0} onChange={e => setForm({ ...form, km_actual: e.target.value })} />
          </div>

          <div style={{ background: "#f0f9ff", padding: 16, borderRadius: 10, marginBottom: 20, border: "1px solid #bae6fd" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0369a1", marginBottom: 10 }}>
              ⚙️ Recordatorios de cambio de aceite
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de uso</label>
              <select className="input" value={form.tipo_uso || "particular"} onChange={e => setForm({ ...form, tipo_uso: e.target.value })}>
                <option value="particular">🚗 Particular</option>
                <option value="taxi">🚕 Taxi</option>
                <option value="uber">🚙 Uber</option>
                <option value="remis">🚖 Remis</option>
                <option value="flota">🚐 Flota</option>
                <option value="empresa">🏢 Empresa</option>
                <option value="moto">🏍️ Moto</option>
                <option value="otro">🚗 Otro</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Cambio cada (km)</label>
                <input type="number" className="input" value={form.intervalo_km || 10000} onChange={e => setForm({ ...form, intervalo_km: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">O cada (meses)</label>
                <input type="number" className="input" value={form.intervalo_meses || 6} onChange={e => setForm({ ...form, intervalo_meses: e.target.value })} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={guardando} className="btn btn-primary">
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
            <button type="button" onClick={() => setEditando(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={eliminar} className="btn btn-danger" style={{ marginLeft: "auto" }}>
              🗑️ Eliminar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{vehiculo.marca} {vehiculo.modelo}</h1>
          <div className="page-subtitle">
            {vehiculo.placa} · {vehiculo.cliente?.nombre}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {vehiculo.cliente?.telefono && (
            <RecordatorioBoton vehiculoId={vehiculo.id} />
          )}
          <button onClick={() => setEditando(true)} className="btn btn-primary">
            ✏️ Editar
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }} className="dashboard-columns">
        <div className="form-card">
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Datos del vehículo</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Marca / Modelo</span>
              <span style={{ fontWeight: 500 }}>{vehiculo.marca} {vehiculo.modelo}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Año</span>
              <span style={{ fontWeight: 500 }}>{vehiculo.anio || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Patente</span>
              <span style={{ fontWeight: 500 }}>{vehiculo.placa || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Color</span>
              <span style={{ fontWeight: 500 }}>{vehiculo.color || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Km actual</span>
              <span style={{ fontWeight: 600 }}>{Number(vehiculo.km_actual).toLocaleString("es-AR")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Tipo de uso</span>
              <span className="badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                {vehiculo.tipo_uso || "particular"}
              </span>
            </div>
          </div>
        </div>

        <div className="form-card">
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Próximo cambio</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Próximo km</span>
              <span style={{ fontWeight: 600 }}>
                {vehiculo.proximo_cambio_km ? Number(vehiculo.proximo_cambio_km).toLocaleString("es-AR") : "—"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Próxima fecha</span>
              <span style={{ fontWeight: 600 }}>
                {vehiculo.proximo_cambio_fecha ? new Date(vehiculo.proximo_cambio_fecha).toLocaleDateString("es-AR") : "—"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Intervalo</span>
              <span style={{ fontWeight: 500 }}>
                {vehiculo.intervalo_km || 10000} km / {vehiculo.intervalo_meses || 6} meses
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="form-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Historial de servicios</h2>
          <Link href={"/ordenes/nueva?cliente_id=" + vehiculo.cliente_id + "&vehiculo_id=" + vehiculo.id} className="btn btn-primary" style={{ padding: "8px 14px", fontSize: 13 }}>
            + Nueva orden
          </Link>
        </div>

        {(!vehiculo.historial || vehiculo.historial.length === 0) ? (
          <div style={{ textAlign: "center", padding: 24, color: "#94a3b8" }}>
            Sin servicios registrados aún
          </div>
        ) : (
          <table className="table" style={{ boxShadow: "none" }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Km</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {vehiculo.historial.map((o: any) => (
                <tr key={o.id}>
                  <td>
                    <Link href={"/ordenes/" + o.id} style={{ color: "#0ea5e9", fontWeight: 600, textDecoration: "none" }}>
                      #{o.numero}
                    </Link>
                  </td>
                  <td style={{ fontSize: 13 }}>{new Date(o.fecha).toLocaleDateString("es-AR")}</td>
                  <td>{Number(o.km_ingreso).toLocaleString("es-AR")}</td>
                  <td style={{ fontWeight: 600 }}>{"$" + Number(o.total).toLocaleString("es-AR")}</td>
                  <td>
                    <span className="badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                      {o.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}