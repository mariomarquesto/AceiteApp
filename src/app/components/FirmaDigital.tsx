"use client";

import { useRef, useState, useEffect } from "react";
import SignaturePad from "signature_pad";

export default function FirmaDigital({
  tipo,
  id,
  onGuardado
}: {
  tipo: "orden" | "venta";
  id: string;
  onGuardado?: (url: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [open, setOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d")?.scale(ratio, ratio);

    padRef.current = new SignaturePad(canvas, {
      backgroundColor: "rgb(255, 255, 255)",
      penColor: "rgb(15, 23, 42)",
      minWidth: 1,
      maxWidth: 3
    });

    return () => {
      padRef.current?.off();
    };
  }, [open]);

  function limpiar() {
    padRef.current?.clear();
  }

  async function guardar() {
    if (!padRef.current || padRef.current.isEmpty()) {
      setError("Por favor firmá antes de guardar");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      const dataURL = padRef.current.toDataURL("image/png");
      const base64 = dataURL.split(",")[1];

      const res = await fetch("/api/firmas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, tipo, id })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");

      setExito(true);
      if (onGuardado) onGuardado(json.data.url);

      setTimeout(() => {
        setExito(false);
        setOpen(false);
      }, 1500);
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
        className="btn"
        style={{
          background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
          color: "white",
          fontWeight: 700
        }}
      >
        🖋️ Firmar
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: 20
    }}>
      <div className="form-card" style={{ maxWidth: 600, width: "100%", margin: 0 }}>
        {exito ? (
          <div style={{ textAlign: "center", padding: 40, color: "#166534" }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>¡Firma guardada!</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>🖋️ Firma del cliente</h2>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                  Pedile al cliente que firme con el dedo
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#94a3b8"
                }}
              >
                ✕
              </button>
            </div>

            {error && (
              <div style={{ background: "#fee2e2", color: "#991b1b", padding: 10, borderRadius: 6, marginBottom: 12, fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{
              background: "white",
              borderRadius: 12,
              border: "2px dashed #cbd5e1",
              padding: 4,
              marginBottom: 16
            }}>
              <canvas
                ref={canvasRef}
                style={{
                  width: "100%",
                  height: 250,
                  borderRadius: 8,
                  touchAction: "none",
                  cursor: "crosshair"
                }}
              />
            </div>

            <div style={{
              fontSize: 12,
              color: "#64748b",
              textAlign: "center",
              marginBottom: 16,
              fontStyle: "italic"
            }}>
              Al firmar, el cliente acepta haber recibido el vehículo conforme
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={limpiar}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                🗑️ Limpiar
              </button>
              <button
                onClick={guardar}
                disabled={guardando}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {guardando ? "Guardando..." : "✅ Guardar firma"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}