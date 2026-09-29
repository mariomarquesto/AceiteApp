"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoTurno() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [vehiculos, setVehiculos] = useState<any[]>([]);

  const hoy = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    cliente_id: "",
    vehiculo_id: "",
    fecha: hoy,
    hora: "09:00",
    duracion_minutos: 60,
    servicio: "",
    notas: ""
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/clientes").then(r => r.json()).then(j => setClientes(j.data || []));
  }, []);

  useEffect(() => {
    if (form.cliente_id) {
      fetch("/api/vehiculos?cliente_id=" + form.cliente_id)
        .then(r => r.json())
        .then(j => setVehiculos(j.data || []));
    } else {
      setVehiculos([]);
      setForm(prev => ({ ...prev, vehiculo_id: "" }));
    }
  }, [form.cliente_id]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    try {
      const res = await fetch("/api/turnos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          vehiculo_id: form.vehiculo_id || null,
          servicio: form.servicio || null,
          notas: form.notas || null
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      router.push("/turnos");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📅 Nuevo turno</h1>
          <div className="page-subtitle">Agendá un turno para un cliente</div>
        </div>
      </div>

      <form onSubmit={guardar} className="form-card" style={{ maxWidth: 640 }}>
        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 18 }}>
            ⚠️ {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Cliente *</label>
          <select required className="input" value={form.cliente_id}
            onChange={e => setForm({ ...form, cliente_id: e.target.value })}>
            <option value="">Seleccioná un cliente</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre} - {c.telefono || "s/tel"}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Vehículo (opcional)</label>
          <select className="input" value={form.vehiculo_id}
            onChange={e => setForm({ ...form, vehiculo_id: e.target.value })}
            disabled={!form.cliente_id}>
            <option value="">Sin vehículo</option>
            {vehiculos.map(v => (
              <option key={v.id} value={v.id}>
                {v.marca} {v.modelo} {v.placa && "· " + v.placa}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Fecha *</label>
            <input required type="date" className="input" value={form.fecha}
              onChange={e => setForm({ ...form, fecha: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Hora *</label>
            <input required type="time" className="input" value={form.hora}
              onChange={e => setForm({ ...form, hora: e.target.value })} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Duración (minutos)</label>
          <select className="input" value={form.duracion_minutos}
            onChange={e => setForm({ ...form, duracion_minutos: Number(e.target.value) })}>
            <option value={30}>30 min</option>
            <option value={60}>1 hora</option>
            <option value={90}>1.5 horas</option>
            <option value={120}>2 horas</option>
            <option value={180}>3 horas</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Servicio</label>
          <input className="input" placeholder="Cambio de aceite, filtros, etc."
            value={form.servicio} onChange={e => setForm({ ...form, servicio: e.target.value })} />
        </div>

        <div className="form-group">
          <label className="form-label">Notas</label>
          <textarea className="input" rows={2} value={form.notas}
            onChange={e => setForm({ ...form, notas: e.target.value })}
            placeholder="Detalles del turno..." />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? "Guardando..." : "Agendar turno"}
          </button>
          <button type="button" onClick={() => router.push("/turnos")} className="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}