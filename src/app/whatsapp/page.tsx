"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function WhatsAppPage() {
  const [convs, setConvs] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  async function cargar() {
    setCargando(true);
    const res = await fetch("/api/whatsapp/conversaciones");
    const json = await res.json();
    setConvs(json.data || []);
    setCargando(false);
  }

  useEffect(() => { cargar(); }, []);

  const filtradas = convs.filter(c => {
    if (!busqueda) return true;
    const b = busqueda.toLowerCase();
    return (
      c.telefono?.toLowerCase().includes(b) ||
      c.ultimo_mensaje?.toLowerCase().includes(b) ||
      c.cliente?.nombre?.toLowerCase().includes(b)
    );
  });

  function tiempoRelativo(fecha: string) {
    if (!fecha) return "";
    const diff = Date.now() - new Date(fecha).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "ahora";
    if (min < 60) return `${min} min`;
    const hs = Math.floor(min / 60);
    if (hs < 24) return `${hs} h`;
    const dias = Math.floor(hs / 24);
    if (dias < 7) return `${dias} d`;
    return new Date(fecha).toLocaleDateString("es-AR");
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">💬 WhatsApp</h1>
          <div className="page-subtitle">
            Conversaciones del bot con tus clientes
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <input
          className="input"
          placeholder="🔍 Buscar por teléfono, nombre o mensaje..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ maxWidth: 420 }}
        />
      </div>

      {cargando ? (
        <div>Cargando...</div>
      ) : filtradas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            No hay conversaciones
          </div>
          <div style={{ fontSize: 14, color: "#64748b" }}>
            Cuando un cliente escriba, la conversación aparecerá acá
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Último mensaje</th>
                <th>Hora</th>
                <th>Bot</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {c.cliente?.nombre || "Sin identificar"}
                    </div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 13 }}>
                    {c.telefono}
                  </td>
                  <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.ultimo_mensaje || "—"}
                  </td>
                  <td style={{ fontSize: 13, color: "#64748b" }}>
                    {tiempoRelativo(c.ultima_actividad)}
                    {c.no_leidos > 0 && (
                      <span style={{
                        background: "#0ea5e9",
                        color: "white",
                        borderRadius: 10,
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                        marginLeft: 8
                      }}>
                        {c.no_leidos}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: c.bot_activo ? "#dcfce7" : "#f1f5f9",
                      color: c.bot_activo ? "#166534" : "#64748b"
                    }}>
                      {c.bot_activo ? "🤖 Activo" : "⏸️ Pausado"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link
                      href={"/whatsapp/" + encodeURIComponent(c.telefono)}
                      className="btn btn-primary"
                      style={{ padding: "6px 12px", fontSize: 12 }}
                    >
                      Ver chat
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}