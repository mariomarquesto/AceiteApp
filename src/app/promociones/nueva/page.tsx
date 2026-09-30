"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevaPromocion() {
  const router = useRouter();
  const [productos, setProductos] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const hoy = new Date().toISOString().slice(0, 10);
  const en30dias = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    descuento_porcentaje: 15,
    descuento_monto: 0,
    aplica_a: "todo",
    producto_id: "",
    servicio_id: "",
    requiere_producto_id: "",
    fecha_inicio: hoy,
    fecha_fin: en30dias,
    activa: true
  });

  useEffect(() => {
    fetch("/api/productos").then(r => r.json()).then(j => setProductos(j.data || []));
    fetch("/api/servicios").then(r => r.json()).then(j => setServicios(j.data || []));
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    try {
      const res = await fetch("/api/promociones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          producto_id: form.producto_id || null,
          servicio_id: form.servicio_id || null,
          requiere_producto_id: form.requiere_producto_id || null,
          descuento_porcentaje: form.descuento_porcentaje || null,
          descuento_monto: form.descuento_monto || null
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      router.push("/promociones");
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
          <h1 className="page-title">🎁 Nueva promoción</h1>
          <div className="page-subtitle">El bot la va a ofrecer automáticamente</div>
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
            placeholder="Ej: 15% off en cambio de aceite"
            value={form.titulo}
            onChange={e => setForm({ ...form, titulo: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Descripción (opcional)</label>
          <textarea
            className="input"
            rows={2}
            placeholder="Detalles de la promo..."
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Descuento %</label>
            <input
              type="number"
              className="input"
              value={form.descuento_porcentaje}
              onChange={e => setForm({ ...form, descuento_porcentaje: Number(e.target.value), descuento_monto: 0 })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">O descuento fijo $</label>
            <input
              type="number"
              className="input"
              value={form.descuento_monto}
              onChange={e => setForm({ ...form, descuento_monto: Number(e.target.value), descuento_porcentaje: 0 })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Aplica a</label>
          <select
            className="input"
            value={form.aplica_a}
            onChange={e => setForm({ ...form, aplica_a: e.target.value })}
          >
            <option value="todo">Todo el negocio</option>
            <option value="servicio">Un servicio específico</option>
            <option value="producto">Un producto específico</option>
            <option value="combo">Combo (producto + producto)</option>
          </select>
        </div>

        {form.aplica_a === "servicio" && (
          <div className="form-group">
            <label className="form-label">Servicio</label>
            <select
              className="input"
              value={form.servicio_id}
              onChange={e => setForm({ ...form, servicio_id: e.target.value })}
            >
              <option value="">Seleccioná un servicio</option>
              {servicios.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {form.aplica_a === "producto" && (
          <div className="form-group">
            <label className="form-label">Producto</label>
            <select
              className="input"
              value={form.producto_id}
              onChange={e => setForm({ ...form, producto_id: e.target.value })}
            >
              <option value="">Seleccioná un producto</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre}{p.marca ? ` — ${p.marca}` : ""}{p.medida ? ` (${p.medida})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {form.aplica_a === "combo" && (
          <>
            <div className="form-group">
              <label className="form-label">Producto principal</label>
              <select
                className="input"
                value={form.producto_id}
                onChange={e => setForm({ ...form, producto_id: e.target.value })}
              >
                <option value="">Seleccioná un producto</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}{p.marca ? ` — ${p.marca}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Producto requerido (segundo del combo)</label>
              <select
                className="input"
                value={form.requiere_producto_id}
                onChange={e => setForm({ ...form, requiere_producto_id: e.target.value })}
              >
                <option value="">Seleccioná el producto que debe llevar también</option>
                {productos
                  .filter(p => p.id !== form.producto_id)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}{p.marca ? ` — ${p.marca}` : ""}
                    </option>
                  ))}
              </select>
            </div>
          </>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Fecha inicio</label>
            <input
              type="date"
              className="input"
              value={form.fecha_inicio}
              onChange={e => setForm({ ...form, fecha_inicio: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Fecha fin</label>
            <input
              type="date"
              className="input"
              value={form.fecha_fin}
              onChange={e => setForm({ ...form, fecha_fin: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.activa}
              onChange={e => setForm({ ...form, activa: e.target.checked })}
            />
            <span className="form-label" style={{ margin: 0 }}>Activa (el bot puede ofrecerla)</span>
          </label>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.push("/promociones")}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar promoción"}
          </button>
        </div>
      </form>
    </div>
  );
}