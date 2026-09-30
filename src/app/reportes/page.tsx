"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function ReportesPage() {
  const [data, setData] = useState<any>(null);
  const [decisiones, setDecisiones] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/reportes/dashboard").then(r => r.json()),
      fetch("/api/reportes/decisiones").then(r => r.json())
    ])
      .then(([dash, dec]) => {
        setData(dash.data);
        setDecisiones(dec.data);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  if (cargando) return <div style={{ padding: 40, textAlign: "center" }}>Cargando reportes...</div>;
  if (!data) return <div style={{ padding: 40, textAlign: "center" }}>Error al cargar reportes</div>;

  const mesesFormateados = data.meses.map((m: any) => {
    const fecha = new Date(m.inicio + "T00:00:00");
    return {
      ...m,
      nombreMes: fecha.toLocaleDateString("es-AR", { month: "short" }).replace(".", ""),
      totalNum: Number(m.total)
    };
  });

  const totalAnual = mesesFormateados.reduce((s: number, m: any) => s + m.totalNum, 0);
  const promedioMes = data.promedio || (totalAnual / 6);
  const mejorMes = mesesFormateados.reduce(
    (max: any, m: any) => m.totalNum > max.totalNum ? m : max,
    mesesFormateados[0] || { totalNum: 0, nombreMes: "-" }
  );

  const comparacion = data.comparacion || { mes_actual: 0, mes_anterior: 0, diferencia: 0, porcentaje: 0 };
  const proyecciones = data.proyecciones || {};
  const tendencia = data.tendencia || 0;
  const finDeMes = data.finDeMes || {};
  const esPrimerMes = comparacion.mes_anterior === 0 && comparacion.mes_actual > 0;

  const primerMes = mesesFormateados[0]?.totalNum || 0;
  const ultimoMes = mesesFormateados[mesesFormateados.length - 1]?.totalNum || 0;
  const crecimientoTotal = primerMes > 0 ? ((ultimoMes - primerMes) / primerMes) * 100 : 0;

  const datosGrafico = [
    ...mesesFormateados.map((m: any) => ({
      nombre: m.nombreMes,
      historico: m.totalNum,
      proyectado: null
    })),
    ...(proyecciones.promedio || []).map((p: any, i: number) => ({
      nombre: `+${i + 1}`,
      historico: null,
      proyectado: p.total
    }))
  ];

  const recs = decisiones?.recomendaciones || [];

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📈 Reportes y Análisis</h1>
          <div className="page-subtitle">
            Datos de los últimos 6 meses · Actualizado {new Date().toLocaleDateString("es-AR")}
          </div>
        </div>
      </div>

      {/* TOMADOR DE DECISIONES */}
      {recs.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 18,
            padding: "16px 20px",
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            borderRadius: 16,
            color: "white",
            flexWrap: "wrap"
          }}>
            <div style={{ fontSize: 32 }}>🧠</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>
                Recomendaciones inteligentes
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
                Análisis automático de tu negocio · {recs.length} {recs.length === 1 ? "recomendación" : "recomendaciones"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {decisiones?.resumen?.urgentes > 0 && (
                <span style={{
                  background: "#ef4444",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  {decisiones.resumen.urgentes} {decisiones.resumen.urgentes === 1 ? "urgente" : "urgentes"}
                </span>
              )}
              {decisiones?.resumen?.oportunidades > 0 && (
                <span style={{
                  background: "#8b5cf6",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  {decisiones.resumen.oportunidades} {decisiones.resumen.oportunidades === 1 ? "oportunidad" : "oportunidades"}
                </span>
              )}
              {decisiones?.resumen?.exitos > 0 && (
                <span style={{
                  background: "#16a34a",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  {decisiones.resumen.exitos} {decisiones.resumen.exitos === 1 ? "éxito" : "éxitos"}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recs.map((rec: any, i: number) => (
              <div
                key={i}
                style={{
                  background: "white",
                  borderRadius: 14,
                  border: `2px solid ${rec.color}30`,
                  borderLeft: `4px solid ${rec.color}`,
                  padding: 18,
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  flexWrap: "wrap",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ fontSize: 32, flexShrink: 0 }}>{rec.icono}</div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#0f172a",
                    marginBottom: 6,
                    letterSpacing: -0.2
                  }}>
                    {rec.titulo}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: "#64748b",
                    lineHeight: 1.5
                  }}>
                    {rec.descripcion}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {rec.acciones.map((accion: any, j: number) => (
                    <a
                      key={j}
                      href={accion.href}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        background: rec.color + "15",
                        color: rec.color,
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        transition: "all 0.15s",
                        border: `1px solid ${rec.color}30`
                      }}
                    >
                      {accion.label} →
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 16,
        marginBottom: 28
      }}>
        <div style={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          borderRadius: 16,
          padding: 20,
          color: "white",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(16,185,129,0.25)"
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, opacity: 0.9 }}>FACTURACIÓN TOTAL</div>
            <div style={{ fontSize: 28 }}>💰</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>
            {"$" + Math.round(totalAnual).toLocaleString("es-AR")}
          </div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 6 }}>Últimos 6 meses</div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
          borderRadius: 16,
          padding: 20,
          color: "white",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(14,165,233,0.25)"
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, opacity: 0.9 }}>PROMEDIO MENSUAL</div>
            <div style={{ fontSize: 28 }}>📊</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>
            {"$" + Math.round(promedioMes).toLocaleString("es-AR")}
          </div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 6 }}>Por mes</div>
        </div>

        <div style={{
          background: esPrimerMes
            ? "linear-gradient(135deg, #8b5cf6, #7c3aed)"
            : comparacion.porcentaje >= 0
              ? "linear-gradient(135deg, #f59e0b, #d97706)"
              : "linear-gradient(135deg, #ef4444, #dc2626)",
          borderRadius: 16,
          padding: 20,
          color: "white",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(139,92,246,0.25)"
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, opacity: 0.9 }}>ESTE MES VS ANTERIOR</div>
            <div style={{ fontSize: 28 }}>
              {esPrimerMes ? "🆕" : comparacion.porcentaje >= 0 ? "📈" : "📉"}
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>
            {esPrimerMes
              ? "Primer mes"
              : `${comparacion.porcentaje >= 0 ? "+" : ""}${comparacion.porcentaje.toFixed(1)}%`}
          </div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 6 }}>
            {esPrimerMes
              ? "Sin datos anteriores"
              : `${comparacion.diferencia >= 0 ? "+" : ""}$${Math.round(comparacion.diferencia).toLocaleString("es-AR")} vs mes anterior`}
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #ec4899, #db2777)",
          borderRadius: 16,
          padding: 20,
          color: "white",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(236,72,153,0.25)"
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, opacity: 0.9 }}>MEJOR MES</div>
            <div style={{ fontSize: 28 }}>🏆</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>
            {"$" + Math.round(mejorMes.totalNum).toLocaleString("es-AR")}
          </div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 6, textTransform: "capitalize" }}>
            {mejorMes.nombreMes}
          </div>
        </div>
      </div>

      {/* PROYECCIÓN DEL MES ACTUAL */}
      {finDeMes.diaActual && (
        <div className="form-card" style={{ marginBottom: 28, padding: 0, overflow: "hidden" }}>
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)"
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0c4a6e", letterSpacing: -0.3 }}>
              📅 Proyección del mes actual
            </h2>
            <div style={{ fontSize: 13, color: "#0369a1", marginTop: 4 }}>
              Día {finDeMes.diaActual} de {finDeMes.diasDelMes} · {Math.round(finDeMes.porcentajeCompletado)}% del mes transcurrido
            </div>
          </div>

          <div style={{ padding: "20px 24px 24px" }}>
            <div style={{
              background: "#f1f5f9",
              borderRadius: 10,
              overflow: "hidden",
              height: 20,
              marginBottom: 24,
              position: "relative"
            }}>
              <div style={{
                background: "linear-gradient(90deg, #0ea5e9, #8b5cf6)",
                height: "100%",
                width: `${finDeMes.porcentajeCompletado}%`,
                transition: "width 0.5s"
              }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <div style={{ padding: 18, background: "#f0fdf4", borderRadius: 12, border: "1px solid #86efac" }}>
                <div style={{ fontSize: 11, color: "#15803d", fontWeight: 700, marginBottom: 6 }}>
                  FACTURADO HASTA AHORA
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#14532d" }}>
                  {"$" + Number(comparacion.mes_actual).toLocaleString("es-AR")}
                </div>
              </div>

              <div style={{ padding: 18, background: "#fef3c7", borderRadius: 12, border: "1px solid #fcd34d" }}>
                <div style={{ fontSize: 11, color: "#92400e", fontWeight: 700, marginBottom: 6 }}>
                  PROYECCIÓN FIN DE MES
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#78350f" }}>
                  {"$" + Math.round(finDeMes.proyeccion).toLocaleString("es-AR")}
                </div>
              </div>

              <div style={{ padding: 18, background: "#ede9fe", borderRadius: 12, border: "1px solid #c4b5fd" }}>
                <div style={{ fontSize: 11, color: "#6d28d9", fontWeight: 700, marginBottom: 6 }}>
                  FALTA PARA CERRAR
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#4c1d95" }}>
                  {"$" + Math.round(finDeMes.faltaParaCerrar).toLocaleString("es-AR")}
                </div>
              </div>

              <div style={{
                padding: 18,
                background: tendencia >= 0 ? "#dcfce7" : "#fee2e2",
                borderRadius: 12,
                border: tendencia >= 0 ? "1px solid #86efac" : "1px solid #fca5a5"
              }}>
                <div style={{ fontSize: 11, color: tendencia >= 0 ? "#15803d" : "#991b1b", fontWeight: 700, marginBottom: 6 }}>
                  TENDENCIA
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: tendencia >= 0 ? "#14532d" : "#7f1d1d" }}>
                  {tendencia >= 0 ? "📈" : "📉"} ${Math.abs(Math.round(tendencia)).toLocaleString("es-AR")}/mes
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GRÁFICO PRINCIPAL */}
      <div className="form-card" style={{ marginBottom: 28, padding: 0, overflow: "hidden" }}>
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: -0.3 }}>
              📈 Evolución y proyección de ventas
            </h2>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
              Últimos 6 meses + proyección próximos 3
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>CRECIMIENTO</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: crecimientoTotal >= 0 ? "#16a34a" : "#ef4444" }}>
                {crecimientoTotal >= 0 ? "↑" : "↓"} {Math.abs(crecimientoTotal).toFixed(1)}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>TENDENCIA</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: tendencia >= 0 ? "#16a34a" : "#ef4444" }}>
                {tendencia >= 0 ? "↑" : "↓"} ${Math.abs(Math.round(tendencia)).toLocaleString("es-AR")}/mes
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: "20px 24px 24px" }}>
          <div style={{ width: "100%", height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosGrafico}>
                <defs>
                  <linearGradient id="colorHistorico" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProyectado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="nombre"
                  stroke="#94a3b8"
                  style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  style={{ fontSize: 12, fontWeight: 600 }}
                  tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(v: any, name: any) => [
                    "$" + Number(v).toLocaleString("es-AR"),
                    name === "historico" ? "Ventas" : "Proyección"
                  ]}
                  contentStyle={{
                    background: "white",
                    border: "none",
                    borderRadius: 12,
                    boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                    padding: "12px 16px"
                  }}
                  labelStyle={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="historico"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  fill="url(#colorHistorico)"
                  dot={{ fill: "#0ea5e9", r: 5, strokeWidth: 2, stroke: "white" }}
                  activeDot={{ r: 8, fill: "#0ea5e9", stroke: "white", strokeWidth: 3 }}
                  connectNulls={false}
                />
                <Area
                  type="monotone"
                  dataKey="proyectado"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  fill="url(#colorProyectado)"
                  dot={{ fill: "#8b5cf6", r: 5, strokeWidth: 2, stroke: "white" }}
                  activeDot={{ r: 8, fill: "#8b5cf6", stroke: "white", strokeWidth: 3 }}
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 12, fontSize: 13 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 24, height: 3, background: "#0ea5e9", borderRadius: 2 }} />
              <span style={{ color: "#64748b", fontWeight: 600 }}>Histórico</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 24, height: 3, background: "#8b5cf6", borderRadius: 2, borderTop: "2px dashed #8b5cf6" }} />
              <span style={{ color: "#64748b", fontWeight: 600 }}>Proyección</span>
            </div>
          </div>
        </div>
      </div>

      {/* ESCENARIOS DE PROYECCIÓN */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16,
        marginBottom: 28
      }}>
        <div className="form-card" style={{ padding: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, letterSpacing: 0.5 }}>
              🎯 CONSERVADOR
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
              Promedio últimos 3 meses
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(proyecciones.promedio || []).map((p: any, i: number) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 12px",
                background: "#f0fdf4",
                borderRadius: 8,
                fontSize: 14
              }}>
                <span style={{ color: "#64748b", fontWeight: 600 }}>{p.mes}</span>
                <span style={{ fontWeight: 800, color: "#15803d" }}>
                  {"$" + Math.round(p.total).toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-card" style={{ padding: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, letterSpacing: 0.5 }}>
              📊 REALISTA
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
              Tendencia lineal
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(proyecciones.lineal || []).map((p: any, i: number) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 12px",
                background: "#f0f9ff",
                borderRadius: 8,
                fontSize: 14
              }}>
                <span style={{ color: "#64748b", fontWeight: 600 }}>{p.mes}</span>
                <span style={{ fontWeight: 800, color: "#0369a1" }}>
                  {"$" + Math.round(p.total).toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-card" style={{ padding: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, letterSpacing: 0.5 }}>
              🚀 OPTIMISTA
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
              Si mantenés el crecimiento
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(proyecciones.crecimiento || []).map((p: any, i: number) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 12px",
                background: "#faf5ff",
                borderRadius: 8,
                fontSize: 14
              }}>
                <span style={{ color: "#64748b", fontWeight: 600 }}>{p.mes}</span>
                <span style={{ fontWeight: 800, color: "#7c3aed" }}>
                  {"$" + Math.round(p.total).toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOP PRODUCTOS Y CLIENTES */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="dashboard-columns">
        <div className="form-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: -0.3 }}>
              📦 Top productos
            </h2>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
              Los 5 más vendidos
            </div>
          </div>
          <div style={{ padding: 20 }}>
            {data.topProductos.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Sin datos aún</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.topProductos.slice(0, 5).map((p: any, i: number) => {
                  const maxTotal = data.topProductos[0].total;
                  const porcentaje = (p.total / maxTotal) * 100;
                  const colores = ["#0ea5e9", "#8b5cf6", "#f97316", "#16a34a", "#ec4899"];
                  const emojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
                  return (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <span style={{ fontSize: 18, flexShrink: 0 }}>{emojis[i]}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.nombre}
                          </span>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: 14, color: colores[i], flexShrink: 0, marginLeft: 8 }}>
                          {"$" + Math.round(p.total).toLocaleString("es-AR")}
                        </span>
                      </div>
                      <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: porcentaje + "%", background: colores[i], borderRadius: 4, transition: "width 0.5s ease" }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                        {p.cantidad} unidades vendidas
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="form-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: -0.3 }}>
              🏆 Top clientes
            </h2>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
              Los que más facturan
            </div>
          </div>
          <div style={{ padding: 20 }}>
            {data.topClientes.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Sin datos aún</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.topClientes.slice(0, 5).map((c: any, i: number) => {
                  const maxTotal = data.topClientes[0].total;
                  const porcentaje = (c.total / maxTotal) * 100;
                  const gradientes = [
                    "linear-gradient(135deg, #f59e0b, #d97706)",
                    "linear-gradient(135deg, #94a3b8, #64748b)",
                    "linear-gradient(135deg, #92400e, #78350f)",
                    "linear-gradient(135deg, #0ea5e9, #0284c7)",
                    "linear-gradient(135deg, #8b5cf6, #7c3aed)"
                  ];
                  const emojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
                  return (
                    <div key={i} style={{
                      padding: 14,
                      background: "#f8fafc",
                      borderRadius: 12,
                      border: "1px solid #e2e8f0"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: gradientes[i],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 18,
                            flexShrink: 0
                          }}>
                            {emojis[i]}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.nombre}
                            </div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>
                              {c.operaciones} {c.operaciones === 1 ? "operación" : "operaciones"}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: "#16a34a", flexShrink: 0, marginLeft: 8 }}>
                          {"$" + Math.round(c.total).toLocaleString("es-AR")}
                        </div>
                      </div>
                      <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: porcentaje + "%", background: "linear-gradient(90deg, #0ea5e9, #8b5cf6)", borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}