const fs = require("fs");
const path = require("path");

function w(file, content) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content, "utf8");
  console.log("OK:", file);
}

const files = {};

// ============================================
// ENDPOINT - Listar y crear servicios
// ============================================
files["src/app/api/servicios/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { servicioSchema } from "@/utils/validators";

export async function GET(req: NextRequest) {
  try {
    const incluirInactivos = req.nextUrl.searchParams.get("incluir_inactivos");
    let query = supabase.from("servicios").select("*");
    if (incluirInactivos !== "true") {
      query = query.eq("activo", true);
    }
    const { data, error } = await query.order("nombre");
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = servicioSchema.parse(body);
    const { data: s, error } = await supabase
      .from("servicios")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return ok(s, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// ============================================
// ENDPOINT - Editar y eliminar servicio
// ============================================
files["src/app/api/servicios/[id]/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { servicioSchema } from "@/utils/validators";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("servicios")
      .select("*")
      .eq("id", params.id)
      .single();
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = servicioSchema.partial().parse(body);
    const { data: s, error } = await supabase
      .from("servicios")
      .update(data)
      .eq("id", params.id)
      .select()
      .single();
    if (error) throw error;
    return ok(s);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase
      .from("servicios")
      .update({ activo: false })
      .eq("id", params.id);
    if (error) throw error;
    return ok({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// ============================================
// PÁGINA - Listado de servicios
// ============================================
files["src/app/servicios/page.tsx"] = `import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getServicios() {
  const { data } = await supabase
    .from("servicios")
    .select("*")
    .eq("activo", true)
    .order("nombre");
  return data || [];
}

export default async function ServiciosPage() {
  const servicios = await getServicios();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Servicios</h1>
          <div className="page-subtitle">
            {servicios.length} {servicios.length === 1 ? "servicio" : "servicios"} de mano de obra
          </div>
        </div>
        <Link href="/servicios/nuevo" className="btn btn-primary">
          + Nuevo servicio
        </Link>
      </div>

      {servicios.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔧</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            No hay servicios aún
          </div>
          <Link href="/servicios/nuevo" className="btn btn-primary">
            + Nuevo servicio
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Descripción</th>
                <th style={{ textAlign: "right" }}>Precio</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s: any) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, color: "#0f172a" }}>
                    <Link href={"/servicios/" + s.id} style={{ textDecoration: "none", color: "inherit" }}>
                      {s.nombre}
                    </Link>
                  </td>
                  <td style={{ color: "#64748b" }}>
                    {s.descripcion || "—"}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                    {"$" + Number(s.precio).toLocaleString("es-AR")}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link
                      href={"/servicios/" + s.id}
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

// ============================================
// PÁGINA - Nuevo servicio
// ============================================
files["src/app/servicios/nuevo/page.tsx"] = `"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoServicio() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: 0
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    try {
      const res = await fetch("/api/servicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          descripcion: form.descripcion || null,
          precio: Number(form.precio)
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      router.push("/servicios");
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
          <h1 className="page-title">Nuevo servicio</h1>
          <div className="page-subtitle">Cargá un servicio de mano de obra</div>
        </div>
      </div>

      <form onSubmit={guardar} className="form-card" style={{ maxWidth: 560 }}>
        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 18, fontWeight: 500 }}>
            ⚠️ {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Nombre del servicio *</label>
          <input
            required
            className="input"
            placeholder="Ej: Cambio de aceite + filtro"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea
            className="input"
            rows={2}
            placeholder="Detalles del servicio..."
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Precio *</label>
          <input
            required
            type="number"
            className="input"
            placeholder="5000"
            value={form.precio}
            onChange={e => setForm({ ...form, precio: Number(e.target.value) })}
          />
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
            Precio de mano de obra sin productos
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? "Guardando..." : "Guardar servicio"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/servicios")}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
`;

// ============================================
// PÁGINA - Editar servicio
// ============================================
files["src/app/servicios/[id]/page.tsx"] = `"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditarServicio() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  useEffect(() => {
    fetch("/api/servicios/" + id)
      .then(r => r.json())
      .then(j => {
        setForm(j.data);
        setCargando(false);
      })
      .catch(() => {
        setError("Error al cargar el servicio");
        setCargando(false);
      });
  }, [id]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setExito(false);

    try {
      const res = await fetch("/api/servicios/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          descripcion: form.descripcion || null,
          precio: Number(form.precio)
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      setExito(true);
      setTimeout(() => setExito(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!confirm("¿Eliminar este servicio? No se puede deshacer.")) return;
    setEliminando(true);
    setError("");

    try {
      const res = await fetch("/api/servicios/" + id, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      router.push("/servicios");
    } catch (e: any) {
      setError(e.message);
      setEliminando(false);
    }
  }

  if (cargando) return <div>Cargando...</div>;
  if (!form) return <div>Servicio no encontrado</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Editar servicio</h1>
          <div className="page-subtitle">{form.nombre}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => router.push("/servicios")} className="btn btn-secondary">
            ← Volver
          </button>
          <button onClick={eliminar} disabled={eliminando} className="btn btn-danger">
            {eliminando ? "..." : "🗑️ Eliminar"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 18, fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {exito && (
        <div style={{ background: "#dcfce7", color: "#166534", padding: 12, borderRadius: 8, marginBottom: 18, fontWeight: 500 }}>
          ✅ Cambios guardados correctamente
        </div>
      )}

      <form onSubmit={guardar} className="form-card" style={{ maxWidth: 560 }}>
        <div className="form-group">
          <label className="form-label">Nombre del servicio *</label>
          <input
            required
            className="input"
            value={form.nombre || ""}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea
            className="input"
            rows={2}
            value={form.descripcion || ""}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Precio *</label>
          <input
            required
            type="number"
            className="input"
            value={form.precio || 0}
            onChange={e => setForm({ ...form, precio: e.target.value })}
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/servicios")}
            className="btn btn-secondary"
          >
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

console.log("\n✅ Modulo de servicios creado:", Object.keys(files).length, "archivos");
