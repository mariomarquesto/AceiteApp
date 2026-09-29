"use client";

import { useState } from "react";

export default function ContactoBoton({
  clienteId,
  vehiculoId,
  tareaId,
  clienteNombre,
  motivo
}: {
  clienteId: string;
  vehiculoId?: string;
  tareaId?: string;
  clienteNombre?: string;
  motivo?: string;
}) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<"whatsapp" | "llamada" | "email" | "visita" | "sms">("whatsapp");
  const [resultado, setResultado] = useState<"sin_respuesta" | "contactado" | "interesado" | "agendo" | "rechazo">("contactado");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setExito(false);

    try {
      const res = await fetch("/api/contactos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: clienteId,
          vehiculo_id: vehiculoId || null,
          tarea_id: tareaId || null,
          tipo,
          motivo: motivo || null,
          resultado,
          notas: notas || null
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      setExito(true);
      setNotas("");
      setTimeout(() => {
        setExito(false);
        setOpen(false);
        window.location.reload();
      }, 1200);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn btn-secondary"
        style={{ padding: "6px 12px", fontSize: 13 }}
      >
        📝 Registrar contacto
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: 20
    }}>
      <div className="form-card" style={{ maxWidth: 480, width: "100%", margin: 0 }}>
        {exito ? (
          <div style={{ textAlign: "center", padding: 20, color: "#166534" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>¡Contacto registrado!</div>
          </div>
        ) : (
          <form onSubmit={guardar}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
              📝 Registrar contacto
            </div>
            {clienteNombre && (
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                {clienteNombre}
              </div>
            )}

            {error && (
              <div style={{ background: "#fee2e2", color: "#991b1b", padding: 10, borderRadius: 6, marginBottom: 12, fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Tipo de contacto</label>
              <select className="input" value={tipo} onChange={e => setTipo(e.target.value as any)}>
                <option value="whatsapp">📱 WhatsApp</option>
                <option value="llamada">📞 Llamada</option>
                <option value="email">📧 Email</option>
                <option value="visita">🚗 Visita</option>
                <option value="sms">💬 SMS</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Resultado</label>
              <select className="input" value={resultado} onChange={e => setResultado(e.target.value as any)}>
                <option value="sin_respuesta">❌ Sin respuesta</option>
                <option value="contactado">✓ Contactado</option>
                <option value="interesado">⭐ Interesado</option>
                <option value="agendo">📅 Agendó turno</option>
                <option value="rechazo">🚫 Rechazó</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Notas (opcional)</label>
              <textarea
                className="input"
                rows={2}
                value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Ej: Dijo que viene la próxima semana"
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" disabled={guardando} className="btn btn-primary" style={{ flex: 1 }}>
                {guardando ? "Guardando..." : "Guardar contacto"}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}