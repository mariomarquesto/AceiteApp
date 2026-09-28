const fs = require("fs");
const path = require("path");

function w(file, content) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content, "utf8");
  console.log("OK:", file);
}

const content = `"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Tarea = any;

const prioridadBadge: Record<string, { label: string; color: string }> = {
  urgente: { label: "🔴 Urgente", color: "#dc2626" },
  alta: { label: "🟠 Alta", color: "#ea580c" },
  media: { label: "🟡 Media", color: "#ca8a04" },
  baja: { label: "⚪ Baja", color: "#64748b" }
};

export default function TareasPage() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  const [filtro, setFiltro] = useState("pendiente");
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    const [t, r] = await Promise.all([
      fetch("/api/tareas?estado=" + filtro).then(r => r.json()),
      fetch("/api/tareas/resumen").then(r => r.json())
    ]);
    setTareas(t.data || []);
    setResumen(r.data);
    setCargando(false);
  }

  useEffect(() => { cargar(); }, [filtro]);

  async function marcarContactada(tarea: Tarea) {
    await fetch("/api/tareas/" + tarea.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contacto_realizado: true, medio_contacto: "whatsapp" })
    });
    cargar();
  }

  async function posponer(tarea: Tarea, dias: number) {
    const nuevaFecha = new Date();
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    await fetch("/api/tareas/" + tarea.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha_vencimiento: nuevaFecha.toISOString().slice(0, 10) })
    });
    cargar();
  }

  async function completar(tarea: Tarea) {
    await fetch("/api/tareas/" + tarea.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "completada" })
    });
    cargar();
  }

  function abrirWhatsApp(tarea: Tarea) {
    const tel = (tarea.cliente?.telefono || "").replace(/[^0-9]/g, "");
    const mensaje = encodeURIComponent(
      "Hola " + (tarea.cliente?.nombre || "") + "! Te escribo de ARN Lubricentro. " +
      "Quería recordarte que es momento de hacer el cambio de aceite de tu " +
      (tarea.vehiculo?.marca || "") + " " + (tarea.vehiculo?.modelo || "") + ". " +
      "¿Coordinamos un turno?"
    );
    window.open("https://wa.me/54" + tel + "?text=" + mensaje, "_blank");
    marcarContactada(tarea);
  }

  const hoy = new Date().toISOString().slice(0, 10);
  const vencidas = tareas.filter(t => t.estado === "pendiente" && t.fecha_vencimiento < hoy);
  const hoyTareas = tareas.filter(t => t.estado === "pendiente" && t.fecha_vencimiento === hoy);
  const proximas = tareas.filter(t => t.estado === "pendiente" && t.fecha_vencimiento > hoy);

  function renderGrupo(titulo: string, items: Tarea[], color: string) {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color, marginBottom: 10 }}>
          {titulo} ({items.length})
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map(t => {
            const p = prioridadBadge[t.prioridad] || prioridadBadge.media;
            return (
              <div key={t.id} className="form-card" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.titulo}</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
                      {t.cliente?.telefono || "sin teléfono"} · {t.vehiculo?.placa || "s/placa"}
                    </div>
                    {t.descripcion && (
                      <div style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "pre-line" }}>
                        {t.descripcion}
                      </div>
                    )}
                  </div>
                  <span className="badge" style={{ background: p.color + "20", color: p.color, whiteSpace: "nowrap" }}>
                    {p.label}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {t.cliente?.telefono && (
                    <button onClick={() => abrirWhatsApp(t)} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 13 }}>
                      📱 WhatsApp
                    </button>
                  )}
                  <button onClick={() => completar(t)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }}>
                    ✓ Completada
                  </button>
                  <button onClick={() => posponer(t, 7)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }}>
                    ⏰ +7 días
                  </button>
                  {t.vehiculo_id && (
                    <Link href={"/vehiculos/" + t.vehiculo_id} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }}>
                      🚗 Ver vehículo
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tareas y recordatorios</h1>
          <div className="page-subtitle">CRM de seguimiento a clientes</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select className="input" value={filtro} onChange={e => setFiltro(e.target.value)} style={{ width: "auto" }}>
            <option value="pendiente">Pendientes</option>
            <option value="completada">Completadas</option>
            <option value="todas">Todas</option>
          </select>
        </div>
      </div>

      {resumen && (
        <div className="dashboard-grid" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-title">🔴 Vencidas</div>
            <div className="card-value" style={{ color: "#dc2626" }}>{resumen.vencidas}</div>
            <div className="card-subtitle">Requieren acción</div>
          </div>
          <div className="card">
            <div className="card-title">🟡 Hoy</div>
            <div className="card-value" style={{ color: "#ca8a04" }}>{resumen.hoy}</div>
            <div className="card-subtitle">Para contactar hoy</div>
          </div>
          <div className="card">
            <div className="card-title">📅 Próximos 7 días</div>
            <div className="card-value" style={{ color: "#0ea5e9" }}>{resumen.proximos_7_dias}</div>
            <div className="card-subtitle">Agendadas</div>
          </div>
          <div className="card">
            <div className="card-title">✅ Completadas hoy</div>
            <div className="card-value" style={{ color: "#16a34a" }}>{resumen.completadas_hoy}</div>
            <div className="card-subtitle">¡Bien!</div>
          </div>
        </div>
      )}

      {cargando ? (
        <div>Cargando...</div>
      ) : tareas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            No hay tareas {filtro === "pendiente" ? "pendientes" : ""}
          </div>
          <div style={{ fontSize: 14, color: "#64748b" }}>
            Las tareas se crean automáticamente al completar órdenes
          </div>
        </div>
      ) : (
        <>
          {renderGrupo("🔴 VENCIDAS", vencidas, "#dc2626")}
          {renderGrupo("🟡 HOY", hoyTareas, "#ca8a04")}
          {renderGrupo("📅 PRÓXIMAS", proximas, "#0ea5e9")}
        </>
      )}
    </div>
  );
}
`;

w("src/app/tareas/page.tsx", content);
console.log("✅ Frontend de tareas creado");
