"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditarServicio() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  useEffect(() => {
    fetch("/api/servicios/" + id)
      .then(r => r.json())
      .then(j => {
        setForm(j.data);
        setCargando(false);
      })
      .catch(() => {
        setError("Error al cargar el servicio");
        setCargando(false);
      });
  }, [id]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setExito(false);

    try {
      const res = await fetch("/api/servicios/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          descripcion: form.descripcion || null,
          precio: Number(form.precio)
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      setExito(true);
      setTimeout(() => setExito(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!confirm("¿Eliminar este servicio? No se puede deshacer.")) return;
    setEliminando(true);
    setError("");

    try {
      const res = await fetch("/api/servicios/" + id, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      router.push("/servicios");
    } catch (e: any) {
      setError(e.message);
      setEliminando(false);
    }
  }

  if (cargando) return <div>Cargando...</div>;
  if (!form) return <div>Servicio no encontrado</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Editar servicio</h1>
          <div className="page-subtitle">{form.nombre}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => router.push("/servicios")} className="btn btn-secondary">
            ← Volver
          </button>
          <button onClick={eliminar} disabled={eliminando} className="btn btn-danger">
            {eliminando ? "..." : "🗑️ Eliminar"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 18, fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {exito && (
        <div style={{ background: "#dcfce7", color: "#166534", padding: 12, borderRadius: 8, marginBottom: 18, fontWeight: 500 }}>
          ✅ Cambios guardados correctamente
        </div>
      )}

      <form onSubmit={guardar} className="form-card" style={{ maxWidth: 560 }}>
        <div className="form-group">
          <label className="form-label">Nombre del servicio *</label>
          <input
            required
            className="input"
            value={form.nombre || ""}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea
            className="input"
            rows={2}
            value={form.descripcion || ""}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Precio *</label>
          <input
            required
            type="number"
            className="input"
            value={form.precio || 0}
            onChange={e => setForm({ ...form, precio: e.target.value })}
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/servicios")}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
