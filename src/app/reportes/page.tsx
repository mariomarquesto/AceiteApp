"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";

export default function ReportesPage() {
  const [data, setData] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/reportes/dashboard")
      .then(r => r.json())
      .then(j => { setData(j.data); setCargando(false); })
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
  const proyeccion = data.proyeccion || [];
  const tendencia = data.tendencia || 0;
  const esPrimerMes = comparacion.mes_anterior === 0 && comparacion.mes_actual > 0;

  // Crecimiento total del período
  const primerMes = mesesFormateados[0]?.totalNum || 0;
  const ultimoMes = mesesFormateados[mesesFormateados.length - 1]?.totalNum || 0;
  const crecimientoTotal = primerMes > 0 ? ((ultimoMes - primerMes) / primerMes) * 100 : 0;

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

      {/* KPIs PRINCIPALES */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 16,
        marginBottom: 28
      }}>
        {/* Facturación total */}
        <div style={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          borderRadius: 16,
          padding: 20,
          color: "white",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(16,185,129,0.25)"
        }}>
          <div style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)"
          }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, opacity: 0.9 }}>FACTURACIÓN TOTAL</div>
            <div style={{ fontSize: 28 }}>💰</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>
            {"$" + Math.round(totalAnual).toLocaleString("es-AR")}
          </div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 6 }}>
            Últimos 6 meses
          </div>
        </div>

        {/* Promedio mensual */}
        <div style={{
          background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
          borderRadius: 16,
          padding: 20,
          color: "white",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(14,165,233,0.25)"
        }}>
          <div style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)"
          }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, opacity: 0.9 }}>PROMEDIO MENSUAL</div>
            <div style={{ fontSize: 28 }}>📊</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>
            {"$" + Math.round(promedioMes).toLocaleString("es-AR")}
          </div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 6 }}>
            Por mes
          </div>
        </div>

        {/* Comparación */}
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
          boxShadow: esPrimerMes
            ? "0 8px 24px rgba(139,92,246,0.25)"
            : comparacion.porcentaje >= 0
              ? "0 8px 24px rgba(245,158,11,0.25)"
              : "0 8px 24px rgba(239,68,68,0.25)"
        }}>
          <div style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)"
          }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, opacity: 0.9 }}>
              ESTE MES VS ANTERIOR
            </div>
            <div style={{ fontSize: 28 }}>
              {esPrimerMes ? "🆕" : comparacion.porcentaje >= 0 ? "📈" : "📉"}
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>
            {esPrimerMes
              ? "Primer mes"
              : `${comparacion.porcentaje >= 0 ? "+" : ""}${comparacion.porcentaje.toFixed(1)}%`
            }
          </div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 6 }}>
            {esPrimerMes
              ? "Sin datos anteriores"
              : `${comparacion.diferencia >= 0 ? "+" : ""}$${Math.round(comparacion.diferencia).toLocaleString("es-AR")} vs mes anterior`
            }
          </div>
        </div>

        {/* Mejor mes */}
        <div style={{
          background: "linear-gradient(135deg, #ec4899, #db2777)",
          borderRadius: 16,
          padding: 20,
          color: "white",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(236,72,153,0.25)"
        }}>
          <div style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)"
          }} />
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

      {/* GRÁFICO DE EVOLUCIÓN */}
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
              💰 Evolución de ventas
            </h2>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
              Últimos 6 meses de facturación
            </div>
          </div>
          <div style={{
            display: "flex",
            gap: 16,
            fontSize: 13
          }}>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>CRECIMIENTO</div>
              <div style={{
                fontWeight: 800,
                fontSize: 15,
                color: crecimientoTotal >= 0 ? "#16a34a" : "#ef4444"
              }}>
                {crecimientoTotal >= 0 ? "↑" : "↓"} {Math.abs(crecimientoTotal).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: "20px 24px 24px" }}>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mesesFormateados}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="nombreMes"
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
                  formatter={(v: any) => ["$" + Number(v).toLocaleString("es-AR"), "Ventas"]}
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
                  dataKey="totalNum"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  fill="url(#colorVentas)"
                  dot={{ fill: "#0ea5e9", r: 5, strokeWidth: 2, stroke: "white" }}
                  activeDot={{ r: 8, fill: "#8b5cf6", stroke: "white", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PROYECCIÓN */}
      {proyeccion.length > 0 && (
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
                🔮 Proyección de ventas
              </h2>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                Basado en la tendencia de los últimos 6 meses
              </div>
            </div>
            <div style={{
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              background: tendencia > 0 ? "#dcfce7" : tendencia < 0 ? "#fee2e2" : "#f1f5f9",
              color: tendencia > 0 ? "#16a34a" : tendencia < 0 ? "#dc2626" : "#64748b",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              {tendencia > 0 ? "📈 Crecimiento" : tendencia < 0 ? "📉 Descenso" : "➡️ Estable"}
            </div>
          </div>
          <div style={{ padding: "20px 24px 24px" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 14
            }}>
              {proyeccion.map((p: any, i: number) => (
                <div key={i} style={{
                  padding: 18,
                  background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
                  borderRadius: 12,
                  border: "2px solid #bae6fd",
                  textAlign: "center",
                  position: "relative",
                  transition: "all 0.2s"
                }}>
                  <div style={{
                    position: "absolute",
                    top: -8,
                    right: 12,
                    background: "#0ea5e9",
                    color: "white",
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 10,
                    letterSpacing: 0.5
                  }}>
                    {p.mes}
                  </div>
                  <div style={{ fontSize: 11, color: "#0369a1", fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 }}>
                    MES {i + 1}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#0c4a6e", letterSpacing: -0.5 }}>
                    {"$" + Math.round(p.total).toLocaleString("es-AR")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOP PRODUCTOS Y CLIENTES */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20
      }} className="dashboard-columns">
        {/* Top productos */}
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
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <span style={{ fontSize: 18, flexShrink: 0 }}>{emojis[i]}</span>
                          <span style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0f172a",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}>
                            {p.nombre}
                          </span>
                        </div>
                        <span style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color: colores[i],
                          flexShrink: 0,
                          marginLeft: 8
                        }}>
                          {"$" + Math.round(p.total).toLocaleString("es-AR")}
                        </span>
                      </div>
                      <div style={{
                        height: 8,
                        background: "#f1f5f9",
                        borderRadius: 4,
                        overflow: "hidden"
                      }}>
                        <div style={{
                          height: "100%",
                          width: porcentaje + "%",
                          background: colores[i],
                          borderRadius: 4,
                          transition: "width 0.5s ease"
                        }} />
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

        {/* Top clientes */}
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
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10
                      }}>
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
                            <div style={{
                              fontWeight: 700,
                              fontSize: 14,
                              color: "#0f172a",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap"
                            }}>
                              {c.nombre}
                            </div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>
                              {c.operaciones} {c.operaciones === 1 ? "operación" : "operaciones"}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          fontWeight: 800,
                          fontSize: 15,
                          color: "#16a34a",
                          flexShrink: 0,
                          marginLeft: 8
                        }}>
                          {"$" + Math.round(c.total).toLocaleString("es-AR")}
                        </div>
                      </div>
                      <div style={{
                        height: 6,
                        background: "#e2e8f0",
                        borderRadius: 3,
                        overflow: "hidden"
                      }}>
                        <div style={{
                          height: "100%",
                          width: porcentaje + "%",
                          background: "linear-gradient(90deg, #0ea5e9, #8b5cf6)",
                          borderRadius: 3,
                          transition: "width 0.5s ease"
                        }} />
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