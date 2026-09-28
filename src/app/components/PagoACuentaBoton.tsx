"use client";

import { useState } from "react";

export default function PagoACuentaBoton({ clienteId, clienteNombre, saldoActual }: { clienteId: string; clienteNombre: string; saldoActual: number }) {
  const [open, setOpen] = useState(false);
  const [monto, setMonto] = useState(0);
  const [medio, setMedio] = useState<"efectivo" | "transferencia" | "otro">("efectivo");
  const [notas, setNotas] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  async function registrar() {
    if (monto <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }

    setProcesando(true);
    setError("");

    try {
      const res = await fetch("/api/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: clienteId,
          monto,
          medio,
          tipo: "abono",
          notas: notas || null
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al registrar pago");

      setExito(true);
      setMonto(0);
      setNotas("");
      setTimeout(() => {
        setExito(false);
        setOpen(false);
        window.location.reload();
      }, 1500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProcesando(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn"
        style={{
          background: "linear-gradient(135deg, #16a34a, #15803d)",
          color: "white",
          fontWeight: 700,
          boxShadow: "0 4px 12px rgba(22,163,74,0.3)"
        }}
      >
        💵 Registrar pago a cuenta
      </button>
    );
  }

  return (
    <div className="form-card" style={{ maxWidth: 420 }}>
      {exito ? (
        <div style={{ textAlign: "center", padding: 20, color: "#166534" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>¡Pago registrado!</div>
        </div>
      ) : (
        <>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>
            Registrar pago a cuenta
          </div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
            {clienteNombre} · Saldo actual:{" "}
            <strong style={{ color: saldoActual > 0 ? "#ef4444" : "#16a34a" }}>
              ${Number(saldoActual).toLocaleString("es-AR")}
            </strong>
          </div>

          {error && (
            <div style={{ background: "#fee2e2", color: "#991b1b", padding: 10, borderRadius: 6, marginBottom: 12, fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Monto</label>
            <input
              type="number"
              className="input"
              value={monto}
              onChange={e => setMonto(Number(e.target.value))}
              placeholder="0"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Medio</label>
            <select className="input" value={medio} onChange={e => setMedio(e.target.value as any)}>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notas (opcional)</label>
            <input
              className="input"
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Ej: Pago parcial"
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={registrar}
              disabled={procesando}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {procesando ? "Registrando..." : "Registrar pago"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </>
      )}
    </div>
  );
}