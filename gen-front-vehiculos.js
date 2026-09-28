const fs = require("fs");
const path = require("path");

function w(file, content) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content, "utf8");
  console.log("OK:", file);
}

const files = {};

// Listado de vehículos
files["src/app/vehiculos/page.tsx"] = `import Link from "next/link";

async function fetchVehiculos() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(base + "/api/vehiculos", { cache: "no-store" });
  const json = await res.json();
  return json.data || [];
}

const tipoLabel: Record<string, string> = {
  particular: "🚗 Particular",
  taxi: "🚕 Taxi",
  uber: "🚙 Uber",
  remis: "🚖 Remis",
  flota: "🚐 Flota",
  empresa: "🏢 Empresa",
  moto: "🏍️ Moto",
  otro: "🚗 Otro"
};

export default async function VehiculosPage() {
  const vehiculos = await fetchVehiculos();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehículos</h1>
          <div className="page-subtitle">
            {vehiculos.length} {vehiculos.length === 1 ? "vehículo" : "vehículos"} registrados
          </div>
        </div>
        <Link href="/vehiculos/nuevo" className="btn btn-primary">
          + Nuevo vehículo
        </Link>
      </div>

      {vehiculos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚗</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            No hay vehículos aún
          </div>
          <Link href="/vehiculos/nuevo" className="btn btn-primary">
            + Nuevo vehículo
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Vehículo</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Km</th>
                <th>Próximo cambio</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v: any) => (
                <tr key={v.id}>
                  <td>
                    <Link
                      href={"/vehiculos/" + v.id}
                      style={{ fontWeight: 600, color: "#0f172a", textDecoration: "none" }}
                    >
                      {v.marca} {v.modelo}
                    </Link>
                    {v.placa && (
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        {v.placa}
                      </div>
                    )}
                  </td>
                  <td style={{ color: "#64748b" }}>{v.cliente?.nombre || "—"}</td>
                  <td>
                    <span className="badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                      {tipoLabel[v.tipo_uso] || tipoLabel.otro}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{Number(v.km_actual).toLocaleString("es-AR")}</td>
                  <td style={{ color: "#64748b", fontSize: 13 }}>
                    {v.proximo_cambio_fecha
                      ? new Date(v.proximo_cambio_fecha).toLocaleDateString("es-AR")
                      : "—"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link
                      href={"/vehiculos/" + v.id}
                      className="btn btn-secondary"
                      style={{ padding: "6px 12px", fontSize: 13 }}
                    >
                      ✏️ Editar
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
`;

// Formulario nuevo vehículo
files["src/app/vehiculos/nuevo/page.tsx"] = `"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoVehiculo() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [form, setForm] = useState({
    cliente_id: "",
    marca: "",
    modelo: "",
    anio: "",
    placa: "",
    color: "",
    km_actual: 0,
    tipo_uso: "particular",
    intervalo_km: 10000,
    intervalo_meses: 6,
    notas: ""
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/clientes").then(r => r.json()).then(j => setClientes(j.data || []));
  }, []);

  // Cuando cambia el tipo de uso, ajustar intervalos por defecto
  useEffect(() => {
    const defaults: Record<string, { km: number; meses: number }> = {
      particular: { km: 10000, meses: 6 },
      taxi: { km: 8000, meses: 3 },
      uber: { km: 8000, meses: 3 },
      remis: { km: 8000, meses: 3 },
      flota: { km: 10000, meses: 4 },
      empresa: { km: 10000, meses: 4 },
      moto: { km: 5000, meses: 6 }
    };
    const d = defaults[form.tipo_uso];
    if (d) {
      setForm(prev => ({ ...prev, intervalo_km: d.km, intervalo_meses: d.meses }));
    }
  }, [form.tipo_uso]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    try {
      const res = await fetch("/api/vehiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          anio: form.anio ? Number(form.anio) : null,
          km_actual: Number(form.km_actual),
          intervalo_km: Number(form.intervalo_km),
          intervalo_meses: Number(form.intervalo_meses)
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      router.push("/vehiculos");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Nuevo vehículo</h1>
          <div className="page-subtitle">Cargá los datos del vehículo y su tipo de uso</div>
        </div>
      </div>

      <form onSubmit={guardar} className="form-card" style={{ maxWidth: 640 }}>
        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 18 }}>
            ⚠️ {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Cliente *</label>
          <select
            required
            className="input"
            value={form.cliente_id}
            onChange={e => setForm({ ...form, cliente_id: e.target.value })}
          >
            <option value="">Seleccioná un cliente</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre} - {c.telefono || "s/tel"}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Marca</label>
            <input className="input" placeholder="Toyota, Fiat..."
              value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Modelo</label>
            <input className="input" placeholder="Corolla, Cronos..."
              value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Año</label>
            <input type="number" className="input" placeholder="2020"
              value={form.anio} onChange={e => setForm({ ...form, anio: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Patente</label>
            <input className="input" placeholder="AB123CD"
              value={form.placa} onChange={e => setForm({ ...form, placa: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <input className="input" placeholder="Rojo"
              value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Kilometraje actual</label>
          <input type="number" className="input" value={form.km_actual}
            onChange={e => setForm({ ...form, km_actual: Number(e.target.value) })} />
        </div>

        <div style={{ background: "#f0f9ff", padding: 16, borderRadius: 10, marginBottom: 20, border: "1px solid #bae6fd" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0369a1", marginBottom: 10 }}>
            ⚙️ Recordatorios de cambio de aceite
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de uso</label>
            <select className="input" value={form.tipo_uso}
              onChange={e => setForm({ ...form, tipo_uso: e.target.value })}>
              <option value="particular">🚗 Particular</option>
              <option value="taxi">🚕 Taxi</option>
              <option value="uber">🚙 Uber</option>
              <option value="remis">🚖 Remis</option>
              <option value="flota">🚐 Flota</option>
              <option value="empresa">🏢 Empresa</option>
              <option value="moto">🏍️ Moto</option>
              <option value="otro">🚗 Otro</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Cambio cada (km)</label>
              <input type="number" className="input" value={form.intervalo_km}
                onChange={e => setForm({ ...form, intervalo_km: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label">O cada (meses)</label>
              <input type="number" className="input" value={form.intervalo_meses}
                onChange={e => setForm({ ...form, intervalo_meses: Number(e.target.value) })} />
            </div>
          </div>

          <div style={{ fontSize: 12, color: "#0369a1", marginTop: 4 }}>
            💡 Se te va a recordar cuando se cumpla <strong>lo primero</strong>: km o fecha.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? "Guardando..." : "Guardar vehículo"}
          </button>
          <button type="button" onClick={() => router.push("/vehiculos")} className="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
`;

for (const [file, content] of Object.entries(files)) {
  w(file, content);
}

console.log("\n✅ Frontend de vehiculos creado");
