"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoServicio() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: 0
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    try {
      const res = await fetch("/api/servicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          descripcion: form.descripcion || null,
          precio: Number(form.precio)
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      router.push("/servicios");
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
          <h1 className="page-title">Nuevo servicio</h1>
          <div className="page-subtitle">Cargá un servicio de mano de obra</div>
        </div>
      </div>

      <form onSubmit={guardar} className="form-card" style={{ maxWidth: 560 }}>
        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 18, fontWeight: 500 }}>
            ⚠️ {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Nombre del servicio *</label>
          <input
            required
            className="input"
            placeholder="Ej: Cambio de aceite + filtro"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea
            className="input"
            rows={2}
            placeholder="Detalles del servicio..."
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Precio *</label>
          <input
            required
            type="number"
            className="input"
            placeholder="5000"
            value={form.precio}
            onChange={e => setForm({ ...form, precio: Number(e.target.value) })}
          />
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
            Precio de mano de obra sin productos
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? "Guardando..." : "Guardar servicio"}
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
