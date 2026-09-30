"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PromocionesPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    const res = await fetch("/api/promociones");
    const json = await res.json();
    setPromos(json.data || []);
    setCargando(false);
  }

  useEffect(() => { cargar(); }, []);

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar esta promoción?")) return;
    await fetch("/api/promociones/" + id, { method: "DELETE" });
    cargar();
  }

  async function toggleActiva(id: string, activa: boolean) {
    await fetch("/api/promociones/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activa: !activa })
    });
    cargar();
  }

  const hoy = new Date().toISOString().slice(0, 10);

  const activas = promos.filter(p => p.activa && p.fecha_inicio <= hoy && p.fecha_fin >= hoy);
  const programadas = promos.filter(p => p.activa && p.fecha_inicio > hoy);
  const vencidas = promos.filter(p => p.activa && p.fecha_fin < hoy);
  const inactivas = promos.filter(p => !p.activa);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🎁 Promociones</h1>
          <div className="page-subtitle">
            Gestioná las promos que el bot ofrece a los clientes
          </div>
        </div>
        <Link href="/promociones/nueva" className="btn btn-primary">
          + Nueva promoción
        </Link>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">🟢 Activas</div>
          <div className="card-value" style={{ color: "#16a34a" }}>{activas.length}</div>
        </div>
        <div className="card">
          <div className="card-title">📅 Programadas</div>
          <div className="card-value" style={{ color: "#0ea5e9" }}>{programadas.length}</div>
        </div>
        <div className="card">
          <div className="card-title">⏰ Vencidas</div>
          <div className="card-value" style={{ color: "#f59e0b" }}>{vencidas.length}</div>
        </div>
        <div className="card">
          <div className="card-title">⚪ Inactivas</div>
          <div className="card-value" style={{ color: "#94a3b8" }}>{inactivas.length}</div>
        </div>
      </div>

      {cargando ? (
        <div>Cargando...</div>
      ) : promos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎁</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            No hay promociones
          </div>
          <div style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>
            Creá la primera promo para que el bot la ofrezca
          </div>
          <Link href="/promociones/nueva" className="btn btn-primary">+ Nueva promoción</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Título</th>
                <th>Descuento</th>
                <th>Vigencia</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {promos.map(p => {
                const esActiva = p.activa && p.fecha_inicio <= hoy && p.fecha_fin >= hoy;
                const esProgramada = p.activa && p.fecha_inicio > hoy;
                const esVencida = p.activa && p.fecha_fin < hoy;

                let badge = { label: "Inactiva", color: "#94a3b8" };
                if (esActiva) badge = { label: "🟢 Activa", color: "#16a34a" };
                if (esProgramada) badge = { label: "📅 Programada", color: "#0ea5e9" };
                if (esVencida) badge = { label: "⏰ Vencida", color: "#f59e0b" };

                const descuento = p.descuento_porcentaje
                  ? `${p.descuento_porcentaje}%`
                  : p.descuento_monto
                    ? `$${p.descuento_monto}`
                    : "—";

                return (
                  <tr key={p.id}>
                    <td>
                      <span className="badge" style={{ background: badge.color + "20", color: badge.color }}>
                        {badge.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.titulo}</div>
                      {p.descripcion && (
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                          {p.descripcion}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 700, color: "#8b5cf6" }}>{descuento}</td>
                    <td style={{ fontSize: 13, color: "#64748b" }}>
                      {new Date(p.fecha_inicio).toLocaleDateString("es-AR")} → {new Date(p.fecha_fin).toLocaleDateString("es-AR")}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => toggleActiva(p.id, p.activa)}
                          className="btn btn-secondary"
                          style={{ padding: "6px 10px", fontSize: 12 }}
                        >
                          {p.activa ? "⏸️" : "▶️"}
                        </button>
                        <Link
                          href={"/promociones/" + p.id}
                          className="btn btn-secondary"
                          style={{ padding: "6px 10px", fontSize: 12 }}
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => eliminar(p.id)}
                          className="btn btn-danger"
                          style={{ padding: "6px 10px", fontSize: 12 }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}