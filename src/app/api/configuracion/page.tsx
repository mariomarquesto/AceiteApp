"use client";

import { useEffect, useState } from "react";

export default function ConfiguracionPage() {
  const [form, setForm] = useState<any>(null);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/configuracion")
      .then(r => r.json())
      .then(j => setForm(j.data));
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setExito(false);

    try {
      const res = await fetch("/api/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Error al guardar");
      setExito(true);
      setTimeout(() => setExito(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  if (!form) return <div>Cargando...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Configuración</h1>
          <div className="page-subtitle">Reglas de cuenta corriente y mora</div>
        </div>
      </div>

      {exito && (
        <div style={{ background: "#dcfce7", color: "#166534", padding: 12, borderRadius: 8, marginBottom: 18, fontWeight: 500 }}>
          ✅ Configuración guardada
        </div>
      )}

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 18 }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={guardar} className="form-card" style={{ maxWidth: 560 }}>
        <div className="form-group">
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.activar_mora}
              onChange={e => setForm({ ...form, activar_mora: e.target.checked })}
              style={{ width: 18, height: 18, cursor: "pointer" }}
            />
            Activar recargo por mora
          </label>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
            Si está desactivado, no se aplican intereses
          </div>
        </div>

        {form.activar_mora && (
          <>
            <div className="form-group">
              <label className="form-label">Días de vencimiento</label>
              <input
                type="number"
                className="input"
                value={form.dias_vencimiento}
                onChange={e => setForm({ ...form, dias_vencimiento: Number(e.target.value) })}
              />
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                Días desde la venta/orden hasta que vence el pago
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Recargo mensual (%)</label>
              <input
                type="number"
                step="0.1"
                className="input"
                value={form.porcentaje_mora_mensual}
                onChange={e => setForm({ ...form, porcentaje_mora_mensual: Number(e.target.value) })}
              />
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                Porcentaje que se suma por cada mes de atraso
              </div>
            </div>

            <div style={{ background: "#f0f9ff", padding: 16, borderRadius: 10, border: "1px solid #bae6fd", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#0369a1", marginBottom: 8 }}>
                💡 Ejemplo
              </div>
              <div style={{ fontSize: 13, color: "#0c4a6e", lineHeight: 1.6 }}>
                Venta de <strong>$10.000</strong> el 1/9<br />
                Vence el <strong>{new Date(new Date().setDate(new Date().getDate() + form.dias_vencimiento)).toLocaleDateString("es-AR")}</strong><br />
                Si el cliente paga 30 días después del vencimiento:<br />
                Recargo: <strong>${(10000 * form.porcentaje_mora_mensual / 100).toFixed(2)}</strong><br />
                Total: <strong>${(10000 * (1 + form.porcentaje_mora_mensual / 100)).toFixed(2)}</strong>
              </div>
            </div>
          </>
        )}

        <button type="submit" disabled={guardando} className="btn btn-primary">
          {guardando ? "Guardando..." : "Guardar configuración"}
        </button>
      </form>
    </div>
  );
}