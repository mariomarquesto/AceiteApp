"use client";

import { useState } from "react";

export default function RecordatorioBoton({ vehiculoId }: { vehiculoId: string }) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function enviarRecordatorio() {
    setCargando(true);
    setError("");

    try {
      const res = await fetch("/api/vehiculos/" + vehiculoId + "/recordatorio");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al generar recordatorio");

      const { mensaje, telefono } = json.data;
      const url = "https://wa.me/" + telefono + "?text=" + encodeURIComponent(mensaje);
      window.open(url, "_blank");
    } catch (e: any) {
      setError(e.message);
      alert("⚠️ " + e.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <button
      onClick={enviarRecordatorio}
      disabled={cargando}
      className="btn"
      style={{
        background: "linear-gradient(135deg, #25d366, #128c7e)",
        color: "white",
        fontWeight: 700,
        boxShadow: "0 4px 12px rgba(37,211,102,0.3)",
        display: "flex",
        alignItems: "center",
        gap: 6
      }}
    >
      📱 {cargando ? "Generando..." : "Enviar recordatorio"}
    </button>
  );
}
