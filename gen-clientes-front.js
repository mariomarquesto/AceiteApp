const fs = require("fs");
const path = require("path");

function w(file, content) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content, "utf8");
  console.log("OK:", file);
}

// ============================================
// CLIENTE - Editar
// ============================================
w("src/app/clientes/[id]/page.tsx", `"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditarCliente() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/clientes/" + id)
      .then(r => r.json())
      .then(j => {
        setForm(j.data);
        setVehiculos(j.data?.vehiculos || []);
        setCargando(false);
      })
      .catch(() => {
        setError("Error al cargar el cliente");
        setCargando(false);
      });
  }, [id]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    try {
      const res = await fetch("/api/clientes/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          telefono: form.telefono || null,
          email: form.email || null,
          direccion: form.direccion || null,
          notas: form.notas || null,
          permite_cuenta_corriente: form.permite_cuenta_corriente,
          limite_credito: Number(form.limite_credito) || 0
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      router.push("/clientes");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!confirm("¿Eliminar este cliente? No se puede deshacer.")) return;
    setEliminando(true);
    setError("");

    try {
      const res = await fetch("/api/clientes/" + id, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      router.push("/clientes");
    } catch (e: any) {
      setError(e.message);
      setEliminando(false);
    }
  }

  if (cargando) return <div>Cargando...</div>;
  if (!form) return <div>Cliente no encontrado</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Editar cliente</h1>
          <div className="page-subtitle">{form.nombre}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={"/clientes/" + id + "/nuevo-vehiculo"} className="btn btn-primary">
            + Nuevo vehículo
          </Link>
          <button onClick={eliminar} disabled={eliminando} className="btn btn-danger">
            {eliminando ? "Eliminando..." : "🗑️ Eliminar"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 18 }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={guardar} className="form-card" style={{ maxWidth: 640, marginBottom: 24 }}>
        <div className="form-group">
          <label className="form-label">Nombre completo *</label>
          <input
            required
            className="input"
            value={form.nombre || ""}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input
              className="input"
              value={form.telefono || ""}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="input"
              value={form.email || ""}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Dirección</label>
          <input
            className="input"
            value={form.direccion || ""}
            onChange={e => setForm({ ...form, direccion: e.target.value })}
          />
        </div>

        <div style={{ background: "#f8fafc", padding: 16, borderRadius: 10, marginBottom: 20, border: "1px solid #e2e8f0" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.permite_cuenta_corriente}
              onChange={e => setForm({ ...form, permite_cuenta_corriente: e.target.checked })}
              style={{ width: 18, height: 18, cursor: "pointer" }}
            />
            Habilitar cuenta corriente
          </label>

          {form.permite_cuenta_corriente && (
            <div style={{ marginTop: 14 }}>
              <label className="form-label">Límite de crédito</label>
              <input
                type="number"
                className="input"
                value={form.limite_credito || 0}
                onChange={e => setForm({ ...form, limite_credito: e.target.value })}
              />
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/clientes")}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>

      {vehiculos.length > 0 && (
        <div className="form-card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            🚗 Vehículos del cliente ({vehiculos.length})
          </h2>
          <table className="table" style={{ boxShadow: "none" }}>
            <thead>
              <tr>
                <th>Vehículo</th>
                <th>Patente</th>
                <th>Km actual</th>
                <th>Tipo de uso</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v: any) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600 }}>{v.marca} {v.modelo}</td>
                  <td style={{ color: "#64748b" }}>{v.placa || "—"}</td>
                  <td>{Number(v.km_actual).toLocaleString("es-AR")}</td>
                  <td>
                    <span className="badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                      {v.tipo_uso || "particular"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link href={"/vehiculos/" + v.id} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }}>
                      Ver
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
`);

// ============================================
// CLIENTES - Listado con botón de editar
// ============================================
w("src/app/clientes/page.tsx", `import Link from "next/link";
import { supabase } from "@/lib/supabase";

async function getClientes() {
  const { data } = await supabase
    .from("clientes")
    .select("*")
    .eq("activo", true)
    .order("nombre");
  return data || [];
}

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <div className="page-subtitle">
            {clientes.length} {clientes.length === 1 ? "cliente registrado" : "clientes registrados"}
          </div>
        </div>
        <Link href="/clientes/nuevo" className="btn btn-primary">+ Nuevo cliente</Link>
      </div>

      {clientes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginBottom: 6 }}>No hay clientes aún</div>
          <Link href="/clientes/nuevo" className="btn btn-primary">+ Nuevo cliente</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Cuenta cte.</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c: any) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: "#0f172a" }}>
                    <Link href={"/clientes/" + c.id} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                        {c.nombre.charAt(0).toUpperCase()}
                      </div>
                      {c.nombre}
                    </Link>
                  </td>
                  <td style={{ color: "#64748b" }}>{c.telefono || "—"}</td>
                  <td style={{ color: "#64748b" }}>{c.email || "—"}</td>
                  <td>
                    {c.permite_cuenta_corriente ? (
                      <span className="badge" style={{ background: "#dcfce7", color: "#16a34a" }}>✓ Habilitada</span>
                    ) : (
                      <span style={{ color: "#cbd5e1" }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link href={"/clientes/" + c.id} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }}>
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
`);

console.log("\\n✅ Frontend de clientes creado");
