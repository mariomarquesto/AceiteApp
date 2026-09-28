"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditarTarea() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [clientes, setClientes] = useState<any[]>([]);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/tareas/" + id).then(r => r.json()),
      fetch("/api/clientes").then(r => r.json())
    ]).then(([t, c]) => {
      setForm(t.data);
      setClientes(c.data || []);
      setCargando(false);
      if (t.data?.cliente_id) {
        fetch("/api/vehiculos?cliente_id=" + t.data.cliente_id)
          .then(r => r.json())
          .then(j => setVehiculos(j.data || []));
      }
    }).catch(() => {
      setError("Error al cargar la tarea");
      setCargando(false);
    });
  }, [id]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    try {
      const res = await fetch("/api/tareas/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo,
          descripcion: form.descripcion || null,
          tipo: form.tipo,
          prioridad: form.prioridad,
          fecha_vencimiento: form.fecha_vencimiento,
          estado: form.estado,
          resultado: form.resultado || null
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

  async function eliminar() {
    if (!confirm("¿Eliminar esta tarea? No se puede deshacer.")) return;
    setEliminando(true);
    setError("");

    try {
      const res = await fetch("/api/tareas/" + id, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      router.push("/tareas");
    } catch (e: any) {
      setError(e.message);
      setEliminando(false);
    }
  }

  if (cargando) return <div>Cargando...</div>;
  if (!form) return <div>Tarea no encontrada</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Editar tarea</h1>
          <div className="page-subtitle">{form.titulo}</div>
        </div>
        <button
          onClick={eliminar}
          disabled={eliminando}
          className="btn btn-danger"
        >
          {eliminando ? "Eliminando..." : "🗑️ Eliminar"}
        </button>
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
            value={form.titulo || ""}
            onChange={e => setForm({ ...form, titulo: e.target.value })}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <select
              className="input"
              value={form.tipo || "seguimiento"}
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
              value={form.prioridad || "media"}
              onChange={e => setForm({ ...form, prioridad: e.target.value })}
            >
              <option value="baja">⚪ Baja</option>
              <option value="media">🟡 Media</option>
              <option value="alta">🟠 Alta</option>
              <option value="urgente">🔴 Urgente</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Fecha vencimiento *</label>
            <input
              required
              type="date"
              className="input"
              value={form.fecha_vencimiento || ""}
              onChange={e => setForm({ ...form, fecha_vencimiento: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estado</label>
            <select
              className="input"
              value={form.estado || "pendiente"}
              onChange={e => setForm({ ...form, estado: e.target.value })}
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea
            className="input"
            rows={3}
            value={form.descripcion || ""}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Resultado / Notas</label>
          <textarea
            className="input"
            rows={2}
            placeholder="Qué pasó al contactar al cliente..."
            value={form.resultado || ""}
            onChange={e => setForm({ ...form, resultado: e.target.value })}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? "Guardando..." : "Guardar cambios"}
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
