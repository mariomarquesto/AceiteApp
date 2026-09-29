"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const HORAS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

export default function TurnosPage() {
  const [turnos, setTurnos] = useState<any[]>([]);
  const [fechaBase, setFechaBase] = useState(new Date());
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    const desde = inicioSemana(fechaBase);
    const hasta = new Date(desde);
    hasta.setDate(hasta.getDate() + 6);
    const res = await fetch(
      "/api/turnos?desde=" + desde.toISOString().slice(0, 10) + "&hasta=" + hasta.toISOString().slice(0, 10)
    );
    const json = await res.json();
    setTurnos(json.data || []);
    setCargando(false);
  }

  useEffect(() => { cargar(); }, [fechaBase]);

  function inicioSemana(d: Date) {
    const dia = new Date(d);
    dia.setDate(dia.getDate() - dia.getDay());
    dia.setHours(0, 0, 0, 0);
    return dia;
  }

  function irSemanaAnterior() {
    const nueva = new Date(fechaBase);
    nueva.setDate(nueva.getDate() - 7);
    setFechaBase(nueva);
  }

  function irSemanaSiguiente() {
    const nueva = new Date(fechaBase);
    nueva.setDate(nueva.getDate() + 7);
    setFechaBase(nueva);
  }

  function irHoy() {
    setFechaBase(new Date());
  }

  const desde = inicioSemana(fechaBase);
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(desde);
    d.setDate(d.getDate() + i);
    return d;
  });

  const hoyStr = new Date().toISOString().slice(0, 10);

  function turnosDeDiaHora(dia: Date, hora: number) {
    const diaStr = dia.toISOString().slice(0, 10);
    return turnos.filter(t => {
      if (t.fecha !== diaStr) return false;
      const h = parseInt(t.hora.split(":")[0]);
      return h === hora;
    });
  }

  const estadoColor: Record<string, string> = {
    pendiente: "#f59e0b",
    confirmado: "#0ea5e9",
    completado: "#16a34a",
    cancelado: "#94a3b8",
    no_asistio: "#ef4444"
  };

  const estadoLabel: Record<string, string> = {
    pendiente: "Pendiente",
    confirmado: "Confirmado",
    completado: "Completado",
    cancelado: "Cancelado",
    no_asistio: "No asistió"
  };

  const totalSemana = turnos.length;
  const pendientes = turnos.filter(t => t.estado === "pendiente").length;
  const confirmados = turnos.filter(t => t.estado === "confirmado").length;
  const completados = turnos.filter(t => t.estado === "completado").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📅 Turnos</h1>
          <div className="page-subtitle">
            Semana del {desde.toLocaleDateString("es-AR")}
          </div>
        </div>
        <Link href="/turnos/nuevo" className="btn btn-primary">
          + Nuevo turno
        </Link>
      </div>

      {/* Cards de resumen */}
      <div className="dashboard-grid" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-title">📅 Total semana</div>
          <div className="card-value">{totalSemana}</div>
          <div className="card-subtitle">Turnos agendados</div>
        </div>
        <div className="card">
          <div className="card-title">🟡 Pendientes</div>
          <div className="card-value" style={{ color: "#f59e0b" }}>{pendientes}</div>
          <div className="card-subtitle">Por confirmar</div>
        </div>
        <div className="card">
          <div className="card-title">🔵 Confirmados</div>
          <div className="card-value" style={{ color: "#0ea5e9" }}>{confirmados}</div>
          <div className="card-subtitle">Agendados</div>
        </div>
        <div className="card">
          <div className="card-title">🟢 Completados</div>
          <div className="card-value" style={{ color: "#16a34a" }}>{completados}</div>
          <div className="card-subtitle">Ya atendidos</div>
        </div>
      </div>

      {/* Navegación */}
      <div style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        marginBottom: 16,
        flexWrap: "wrap"
      }}>
        <button onClick={irSemanaAnterior} className="btn btn-secondary">← Anterior</button>
        <button onClick={irHoy} className="btn btn-secondary">Hoy</button>
        <button onClick={irSemanaSiguiente} className="btn btn-secondary">Siguiente →</button>
      </div>

      {cargando ? (
        <div>Cargando...</div>
      ) : (
        <div className="form-card" style={{ overflow: "auto", padding: 0 }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 900
          }}>
            <thead>
              <tr>
                <th style={{
                  width: 60,
                  padding: 8,
                  background: "#f8fafc",
                  fontSize: 11,
                  color: "#64748b",
                  borderBottom: "1px solid #e2e8f0"
                }}>Hora</th>
                {dias.map(d => {
                  const esHoy = d.toISOString().slice(0, 10) === hoyStr;
                  return (
                    <th key={d.toISOString()} style={{
                      padding: 8,
                      background: esHoy ? "#e0f2fe" : "#f8fafc",
                      fontSize: 12,
                      color: esHoy ? "#0369a1" : "#64748b",
                      borderBottom: "1px solid #e2e8f0",
                      textAlign: "center"
                    }}>
                      <div style={{ fontWeight: 700 }}>{DIAS_SEMANA[d.getDay()]}</div>
                      <div style={{ fontSize: 11 }}>{d.getDate()}/{d.getMonth() + 1}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {HORAS.map(hora => (
                <tr key={hora}>
                  <td style={{
                    padding: 6,
                    fontSize: 11,
                    color: "#94a3b8",
                    textAlign: "right",
                    background: "#fafafa",
                    borderBottom: "1px solid #f1f5f9",
                    fontWeight: 600
                  }}>
                    {String(hora).padStart(2, "0")}:00
                  </td>
                  {dias.map(d => {
                    const items = turnosDeDiaHora(d, hora);
                    const esHoy = d.toISOString().slice(0, 10) === hoyStr;
                    return (
                      <td key={d.toISOString()} style={{
                        padding: 3,
                        borderBottom: "1px solid #f1f5f9",
                        borderLeft: "1px solid #f1f5f9",
                        background: esHoy ? "#f0f9ff" : "white",
                        verticalAlign: "top",
                        minWidth: 130,
                        height: 50
                      }}>
                        {items.map(t => (
                          <Link key={t.id} href={"/turnos/" + t.id} style={{ textDecoration: "none" }}>
                            <div style={{
                              background: (estadoColor[t.estado] || "#64748b") + "20",
                              borderLeft: "3px solid " + (estadoColor[t.estado] || "#64748b"),
                              padding: "4px 6px",
                              borderRadius: 4,
                              marginBottom: 3,
                              fontSize: 11,
                              cursor: "pointer"
                            }}>
                              <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 1 }}>
                                {t.hora.slice(0, 5)}
                              </div>
                              <div style={{ color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {t.cliente?.nombre || "Cliente"}
                              </div>
                              <div style={{ fontSize: 10, color: estadoColor[t.estado], fontWeight: 600 }}>
                                {estadoLabel[t.estado]}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}