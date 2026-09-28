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
      .then(j => {
        if (j.data) {
          setForm(j.data);
        } else {
          setForm({
            dias_vencimiento: 30,
            porcentaje_mora_mensual: 5,
            activar_mora: true
          });
        }
      })
      .catch(() => {
        setForm({
          dias_vencimiento: 30,
          porcentaje_mora_mensual: 5,
          activar_mora: true
        });
      });
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

  if (!form) return <div style={{ padding: 40, textAlign: "center" }}>Cargando...</div>;

  const fechaVencEjemplo = new Date();
  fechaVencEjemplo.setDate(fechaVencEjemplo.getDate() + Number(form.dias_vencimiento));
  const recargoEjemplo = (10000 * Number(form.porcentaje_mora_mensual) / 100).toFixed(0);

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
          ✅ Configuración guardada correctamente
        </div>
      )}

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 18, fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={guardar} className="form-card" style={{ maxWidth: 600 }}>
        <div style={{
          background: "#f8fafc",
          padding: 16,
          borderRadius: 10,
          marginBottom: 20,
          border: "1px solid #e2e8f0"
        }}>
          <label style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 14,
            fontWeight: 600,
            color: "#475569",
            cursor: "pointer"
          }}>
            <input
              type="checkbox"
              checked={form.activar_mora}
              onChange={e => setForm({ ...form, activar_mora: e.target.checked })}
              style={{ width: 18, height: 18, cursor: "pointer" }}
            />
            Activar recargo por mora
          </label>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
            Si está desactivado, no se aplican intereses a las deudas
          </div>
        </div>

        {form.activar_mora && (
          <>
            <div className="form-group">
              <label className="form-label">Días de vencimiento</label>
              <input
                type="number"
                min={0}
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
                min={0}
                className="input"
                value={form.porcentaje_mora_mensual}
                onChange={e => setForm({ ...form, porcentaje_mora_mensual: Number(e.target.value) })}
              />
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                Porcentaje que se suma por cada mes de atraso
              </div>
            </div>

            <div style={{
              background: "#f0f9ff",
              padding: 16,
              borderRadius: 10,
              border: "1px solid #bae6fd",
              marginBottom: 20
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#0369a1", marginBottom: 10 }}>
                💡 Ejemplo
              </div>
              <div style={{ fontSize: 13, color: "#0c4a6e", lineHeight: 1.8 }}>
                Venta de <strong>$10.000</strong> hoy<br />
                Vence el <strong>{fechaVencEjemplo.toLocaleDateString("es-AR")}</strong> ({form.dias_vencimiento} días)<br />
                Si el cliente paga <strong>30 días después</strong> del vencimiento:<br />
                Recargo: <strong style={{ color: "#f97316" }}>${recargoEjemplo}</strong><br />
                Total a pagar: <strong>${(10000 + Number(recargoEjemplo)).toLocaleString("es-AR")}</strong>
              </div>
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </form>
    </div>
  );
}