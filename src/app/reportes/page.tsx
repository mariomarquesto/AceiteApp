"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
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
  const promedioMes = totalAnual / 6;
  const mejorMes = mesesFormateados.reduce((max: any, m: any) => m.totalNum > max.totalNum ? m : max, mesesFormateados[0] || { totalNum: 0, nombreMes: "-" });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📈 Reportes</h1>
          <div className="page-subtitle">Análisis de tu negocio en los últimos 6 meses</div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">💰 Facturación total</div>
          <div className="card-value" style={{ color: "#16a34a" }}>
            {"$" + Math.round(totalAnual).toLocaleString("es-AR")}
          </div>
          <div className="card-subtitle">Últimos 6 meses</div>
        </div>
        <div className="card">
          <div className="card-title">📊 Promedio mensual</div>
          <div className="card-value">
            {"$" + Math.round(promedioMes).toLocaleString("es-AR")}
          </div>
          <div className="card-subtitle">Por mes</div>
        </div>
        <div className="card">
          <div className="card-title">🏆 Mejor mes</div>
          <div className="card-value" style={{ color: "#0ea5e9" }}>
            {"$" + mejorMes.totalNum.toLocaleString("es-AR")}
          </div>
          <div className="card-subtitle" style={{ textTransform: "capitalize" }}>{mejorMes.nombreMes}</div>
        </div>
        <div className="card">
          <div className="card-title">📦 Productos vendidos</div>
          <div className="card-value">{data.topProductos.length}</div>
          <div className="card-subtitle">En el ranking</div>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>💰 Evolución de ventas</h2>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mesesFormateados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="nombreMes" stroke="#64748b" style={{ fontSize: 12, textTransform: "capitalize" }} />
              <YAxis stroke="#64748b" style={{ fontSize: 12 }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} />
              <Tooltip
                formatter={(v: any) => ["$" + Number(v).toLocaleString("es-AR"), "Ventas"]}
                contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Line type="monotone" dataKey="totalNum" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: "#0ea5e9", r: 5 }} activeDot={{ r: 8, fill: "#8b5cf6" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="dashboard-columns">
        <div className="form-card">
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>📦 Top productos</h2>
          {data.topProductos.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Sin datos aún</div>
          ) : (
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topProductos.slice(0, 5)} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" style={{ fontSize: 11 }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} />
                  <YAxis type="category" dataKey="nombre" stroke="#64748b" style={{ fontSize: 11 }} width={120} tickFormatter={(v) => v.length > 18 ? v.slice(0, 18) + "..." : v} />
                  <Tooltip formatter={(v: any) => ["$" + Number(v).toLocaleString("es-AR"), "Facturado"]} contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }} />
                  <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                    {data.topProductos.slice(0, 5).map((_: any, i: number) => (
                      <Cell key={i} fill={["#0ea5e9", "#8b5cf6", "#f97316", "#16a34a", "#ec4899"][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="form-card">
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>🏆 Top clientes</h2>
          {data.topClientes.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Sin datos aún</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.topClientes.slice(0, 5).map((c: any, i: number) => {
                const maxTotal = data.topClientes[0].total;
                const porcentaje = (c.total / maxTotal) * 100;
                const medallas = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
                return (
                  <div key={i} style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{medallas[i]}</span>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{c.nombre}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: "#16a34a" }}>
                        ${c.total.toLocaleString("es-AR")}
                      </span>
                    </div>
                    <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: porcentaje + "%", background: "linear-gradient(90deg, #0ea5e9, #8b5cf6)" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                      {c.operaciones} {c.operaciones === 1 ? "operación" : "operaciones"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}