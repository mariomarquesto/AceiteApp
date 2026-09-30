"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const telefono = decodeURIComponent(params.telefono as string);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [mensajes, setMensajes] = useState<any[]>([]);
  const [conv, setConv] = useState<any>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    const [msgRes, convRes] = await Promise.all([
      fetch("/api/whatsapp/mensajes/" + encodeURIComponent(telefono)).then(r => r.json()),
      fetch("/api/whatsapp/conversaciones?q=" + encodeURIComponent(telefono)).then(r => r.json())
    ]);
    setMensajes(msgRes.data || []);
    const found = (convRes.data || []).find((c: any) => c.telefono === telefono);
    setConv(found || null);
    setCargando(false);

    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  }

  useEffect(() => { cargar(); }, [telefono]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);

    try {
      const res = await fetch("/api/whatsapp/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono, mensaje: texto })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al enviar");
      setTexto("");
      await cargar();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setEnviando(false);
    }
  }

  async function toggleBot() {
    if (!conv) return;
    await fetch("/api/whatsapp/bot-toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefono, bot_activo: !conv.bot_activo })
    });
    setConv({ ...conv, bot_activo: !conv.bot_activo });
  }

  if (cargando) return <div style={{ padding: 24 }}>Cargando...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 16,
        borderBottom: "1px solid #e2e8f0",
        background: "var(--card-bg, white)"
      }}>
        <button
          onClick={() => router.push("/whatsapp")}
          className="btn btn-secondary"
          style={{ padding: "6px 12px" }}
        >
          ← Volver
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>
            {conv?.cliente?.nombre || "Sin identificar"}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>
            {telefono}
          </div>
        </div>
        {conv && (
          <button
            onClick={toggleBot}
            className="btn btn-secondary"
            style={{ padding: "6px 12px", fontSize: 12 }}
          >
            {conv.bot_activo ? "⏸️ Pausar bot" : "▶️ Activar bot"}
          </button>
        )}
      </div>

      {/* Mensajes */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          background: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          gap: 8
        }}
      >
        {mensajes.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>
            No hay mensajes aún
          </div>
        ) : (
          mensajes.map(m => {
            const esEntrante = m.direccion === "entrante";
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: esEntrante ? "flex-start" : "flex-end",
                  maxWidth: "70%",
                  background: esEntrante ? "white" : "#dcf8c6",
                  padding: "8px 12px",
                  borderRadius: 12,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                  borderTopLeftRadius: esEntrante ? 2 : 12,
                  borderTopRightRadius: esEntrante ? 12 : 2
                }}
              >
                <div style={{ fontSize: 14, color: "#0f172a", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {m.contenido}
                </div>
                <div style={{
                  fontSize: 10,
                  color: "#64748b",
                  marginTop: 4,
                  textAlign: esEntrante ? "left" : "right"
                }}>
                  {new Date(m.created_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                  {!esEntrante && " ✓✓"}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form onSubmit={enviar} style={{
        display: "flex",
        gap: 8,
        padding: 12,
        borderTop: "1px solid #e2e8f0",
        background: "var(--card-bg, white)"
      }}>
        <input
          className="input"
          placeholder="Escribí un mensaje..."
          value={texto}
          onChange={e => setTexto(e.target.value)}
          disabled={enviando}
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={enviando || !texto.trim()}
        >
          {enviando ? "..." : "Enviar ➤"}
        </button>
      </form>
    </div>
  );
}