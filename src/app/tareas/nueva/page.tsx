"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevaTarea() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [form, setForm] = useState({
    tipo: "seguimiento",
    titulo: "",
    descripcion: "",
    cliente_id: "",
    vehiculo_id: "",
    prioridad: "media",
    fecha_vencimiento: new Date().toISOString().slice(0, 10)
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
      const res = await fetch("/api/tareas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: form.tipo,
          titulo: form.titulo,
          descripcion: form.descripcion || null,
          cliente_id: form.cliente_id || null,
          vehiculo_id: form.vehiculo_id || null,
          prioridad: form.prioridad,
          fecha_vencimiento: form.fecha_vencimiento
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      router.push("/tareas");
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
          <h1 className="page-title">Nueva tarea</h1>
          <div className="page-subtitle">Creá un recordatorio o seguimiento manual</div>
        </div>
      </div>

      <form onSubmit={guardar} className="form-card" style={{ maxWidth: 640 }}>
        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 18 }}>
            ⚠️ {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Título *</label>
          <input
            required
            className="input"
            placeholder="Ej: Llamar a Juan para recordar cambio"
            value={form.titulo}
            onChange={e => setForm({ ...form, titulo: e.target.value })}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <select
              className="input"
              value={form.tipo}
              onChange={e => setForm({ ...form, tipo: e.target.value })}
            >
              <option value="seguimiento">📞 Seguimiento</option>
              <option value="cobro">💰 Cobro</option>
              <option value="recordatorio_cambio">🔧 Recordatorio cambio</option>
              <option value="otro">📝 Otro</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Prioridad</label>
            <select
              className="input"
              value={form.prioridad}
              onChange={e => setForm({ ...form, prioridad: e.target.value })}
            >
              <option value="baja">⚪ Baja</option>
              <option value="media">🟡 Media</option>
              <option value="alta">🟠 Alta</option>
              <option value="urgente">🔴 Urgente</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Fecha de vencimiento *</label>
          <input
            required
            type="date"
            className="input"
            value={form.fecha_vencimiento}
            onChange={e => setForm({ ...form, fecha_vencimiento: e.target.value })}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Cliente (opcional)</label>
            <select
              className="input"
              value={form.cliente_id}
              onChange={e => setForm({ ...form, cliente_id: e.target.value })}
            >
              <option value="">Sin cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Vehículo (opcional)</label>
            <select
              className="input"
              value={form.vehiculo_id}
              onChange={e => setForm({ ...form, vehiculo_id: e.target.value })}
              disabled={!form.cliente_id}
            >
              <option value="">Sin vehículo</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>
                  {v.marca} {v.modelo} {v.placa && "· " + v.placa}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea
            className="input"
            rows={3}
            placeholder="Detalles, notas..."
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? "Guardando..." : "Crear tarea"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/tareas")}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
