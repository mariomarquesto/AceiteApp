"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const estados = [
  { value: "pendiente", label: "🟡 Pendiente", color: "#f59e0b" },
  { value: "confirmado", label: "🔵 Confirmado", color: "#0ea5e9" },
  { value: "completado", label: "🟢 Completado", color: "#16a34a" },
  { value: "cancelado", label: "⚫ Cancelado", color: "#94a3b8" },
  { value: "no_asistio", label: "🔴 No asistió", color: "#ef4444" }
];

export default function DetalleTurno() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [turno, setTurno] = useState<any>(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    const res = await fetch("/api/turnos/" + id);
    const json = await res.json();
    setTurno(json.data);
    setForm(json.data);
  }

  useEffect(() => { cargar(); }, [id]);

  async function cambiarEstado(nuevoEstado: string) {
    await fetch("/api/turnos/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado })
    });
    await cargar();
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    try {
      const res = await fetch("/api/turnos/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: form.fecha,
          hora: form.hora,
          duracion_minutos: Number(form.duracion_minutos),
          servicio: form.servicio || null,
          notas: form.notas || null
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
    if (!confirm("¿Eliminar este turno?")) return;
    await fetch("/api/turnos/" + id, { method: "DELETE" });
    router.push("/turnos");
  }

  function enviarWhatsApp() {
    if (!turno.cliente?.telefono) return;
    const tel = turno.cliente.telefono.replace(/[^0-9]/g, "");
    const fecha = new Date(turno.fecha + "T00:00:00").toLocaleDateString("es-AR");
    const mensaje = encodeURIComponent(
      "Hola " + turno.cliente.nombre + "! Te confirmamos el turno en ARN Lubricentro:\n\n" +
      "📅 " + fecha + "\n" +
      "⏰ " + turno.hora.slice(0, 5) + "\n" +
      (turno.vehiculo ? "🚗 " + turno.vehiculo.marca + " " + turno.vehiculo.modelo + "\n" : "") +
      (turno.servicio ? "🔧 " + turno.servicio + "\n" : "") +
      "\n¡Te esperamos!"
    );
    window.open("https://wa.me/54" + tel + "?text=" + mensaje, "_blank");
  }

  if (!turno) return <div>Cargando...</div>;

  const estadoActual = estados.find(e => e.value === turno.estado) || estados[0];

  if (editando) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Editar turno</h1>
        </div>

        <form onSubmit={guardar} className="form-card" style={{ maxWidth: 640 }}>
          {error && (
            <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 18 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input required type="date" className="input" value={form.fecha}
                onChange={e => setForm({ ...form, fecha: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Hora</label>
              <input required type="time" className="input" value={form.hora}
                onChange={e => setForm({ ...form, hora: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Duración</label>
            <select className="input" value={form.duracion_minutos}
              onChange={e => setForm({ ...form, duracion_minutos: e.target.value })}>
              <option value={30}>30 min</option>
              <option value={60}>1 hora</option>
              <option value={90}>1.5 horas</option>
              <option value={120}>2 horas</option>
              <option value={180}>3 horas</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Servicio</label>
            <input className="input" value={form.servicio || ""}
              onChange={e => setForm({ ...form, servicio: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Notas</label>
            <textarea className="input" rows={3} value={form.notas || ""}
              onChange={e => setForm({ ...form, notas: e.target.value })} />
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
          <h1 className="page-title">📅 Turno #{turno.id.slice(0, 6)}</h1>
          <div className="page-subtitle">
            {new Date(turno.fecha + "T00:00:00").toLocaleDateString("es-AR")} a las {turno.hora.slice(0, 5)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/turnos" className="btn btn-secondary">← Volver</Link>
          {turno.cliente?.telefono && (
            <button onClick={enviarWhatsApp} className="btn"
              style={{ background: "linear-gradient(135deg, #25d366, #128c7e)", color: "white", fontWeight: 700 }}>
              📱 WhatsApp
            </button>
          )}
          <button onClick={() => setEditando(true)} className="btn btn-primary">
            ✏️ Editar
          </button>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Estado</div>
          <span className="badge" style={{
            background: estadoActual.color + "20",
            color: estadoActual.color,
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 700
          }}>
            {estadoActual.label}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {estados.filter(e => e.value !== turno.estado).map(e => (
            <button
              key={e.value}
              onClick={() => cambiarEstado(e.value)}
              className="btn btn-secondary"
              style={{ padding: "6px 14px", fontSize: 13 }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="dashboard-columns">
        <div className="form-card">
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Datos del turno</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Fecha</span>
              <span style={{ fontWeight: 600 }}>{new Date(turno.fecha + "T00:00:00").toLocaleDateString("es-AR")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Hora</span>
              <span style={{ fontWeight: 600 }}>{turno.hora.slice(0, 5)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Duración</span>
              <span>{turno.duracion_minutos} min</span>
            </div>
            {turno.servicio && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Servicio</span>
                <span>{turno.servicio}</span>
              </div>
            )}
          </div>
        </div>

        <div className="form-card">
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Cliente y vehículo</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Cliente</span>
              <Link href={"/clientes/" + turno.cliente_id} style={{ color: "#0ea5e9", fontWeight: 600, textDecoration: "none" }}>
                {turno.cliente?.nombre}
              </Link>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Teléfono</span>
              <span>{turno.cliente?.telefono || "—"}</span>
            </div>
            {turno.vehiculo && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Vehículo</span>
                  <Link href={"/vehiculos/" + turno.vehiculo_id} style={{ color: "#0ea5e9", fontWeight: 600, textDecoration: "none" }}>
                    {turno.vehiculo.marca} {turno.vehiculo.modelo}
                  </Link>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Patente</span>
                  <span>{turno.vehiculo.placa || "—"}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {turno.notas && (
        <div className="form-card" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>NOTAS</div>
          <div style={{ whiteSpace: "pre-line" }}>{turno.notas}</div>
        </div>
      )}
    </div>
  );
}