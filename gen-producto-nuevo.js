const fs = require("fs");
const path = require("path");

const content = `"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoProducto() {
  const router = useRouter();
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    tipo: "aceite",
    marca: "",
    medida: "",
    descripcion: "",
    precio_costo: 0,
    precio_venta: 0,
    stock: 0,
    stock_minimo: 2
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    try {
      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          codigo: form.codigo || null,
          marca: form.marca || null,
          medida: form.medida || null,
          descripcion: form.descripcion || null
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      router.push("/productos");
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
          <h1 className="page-title">Nuevo producto</h1>
          <div className="page-subtitle">Cargá un producto al inventario</div>
        </div>
      </div>

      <form onSubmit={guardar} className="form-card" style={{ maxWidth: 640 }}>
        {error && (
          <div style={{
            background: "#fee2e2", color: "#991b1b", padding: 12,
            borderRadius: 8, marginBottom: 18, fontSize: 14, fontWeight: 500
          }}>
            ⚠️ {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Nombre del producto *</label>
          <input
            required
            className="input"
            placeholder="Ej: Aceite 10W-40 Sintético 1L"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Código</label>
            <input
              className="input"
              placeholder="ACE-10W40-1L"
              value={form.codigo}
              onChange={e => setForm({ ...form, codigo: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tipo *</label>
            <select
              className="input"
              value={form.tipo}
              onChange={e => setForm({ ...form, tipo: e.target.value })}
            >
              <option value="aceite">🛢️ Aceite</option>
              <option value="filtro">🔧 Filtro</option>
              <option value="repuesto">⚙️ Repuesto</option>
              <option value="insumo">📦 Insumo</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Marca</label>
            <input
              className="input"
              placeholder="Shell, YPF, etc."
              value={form.marca}
              onChange={e => setForm({ ...form, marca: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Medida / Presentación</label>
            <input
              className="input"
              placeholder="10W-40, 4L, etc."
              value={form.medida}
              onChange={e => setForm({ ...form, medida: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea
            className="input"
            rows={2}
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Precio costo</label>
            <input
              type="number"
              className="input"
              value={form.precio_costo}
              onChange={e => setForm({ ...form, precio_costo: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Precio venta *</label>
            <input
              type="number"
              required
              className="input"
              value={form.precio_venta}
              onChange={e => setForm({ ...form, precio_venta: Number(e.target.value) })}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Stock inicial</label>
            <input
              type="number"
              className="input"
              value={form.stock}
              onChange={e => setForm({ ...form, stock: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Stock mínimo</label>
            <input
              type="number"
              className="input"
              value={form.stock_minimo}
              onChange={e => setForm({ ...form, stock_minimo: Number(e.target.value) })}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? "Guardando..." : "Guardar producto"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/productos")}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
`;

const dir = path.dirname("src/app/productos/nuevo/page.tsx");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync("src/app/productos/nuevo/page.tsx", content, "utf8");
console.log("OK: src/app/productos/nuevo/page.tsx");
