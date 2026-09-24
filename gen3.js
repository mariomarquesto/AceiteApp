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
// globals.css - estilos base
// ============================================
files["src/app/globals.css"] = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f5f5f5;
  color: #333;
  line-height: 1.5;
}

a { color: inherit; text-decoration: none; }
button { cursor: pointer; font-family: inherit; }
input, select, textarea { font-family: inherit; font-size: 14px; }

.btn {
  display: inline-block;
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.15s;
}
.btn-primary { background: #0ea5e9; color: white; }
.btn-primary:hover { background: #0284c7; }
.btn-secondary {
  background: transparent;
  color: #64748b;
  border: 1px solid #cbd5e1;
}
.btn-danger { background: #ef4444; color: white; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
}
.input:focus { border-color: #0ea5e9; }

.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.table th {
  text-align: left;
  padding: 12px 16px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}
.table td { padding: 14px 16px; border-top: 1px solid #e2e8f0; }
.table tr:hover td { background: #f8fafc; }
`;

// ============================================
// layout.tsx
// ============================================
files["src/app/layout.tsx"] = `import "./globals.css";
import type { Metadata } from "next";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "Cambio de Aceite",
  description: "Sistema de gestión"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
`;

// ============================================
// components/Navbar.tsx
// ============================================
files["src/app/components/Navbar.tsx"] = `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/clientes", label: "Clientes" },
  { href: "/productos", label: "Productos" },
  { href: "/ventas", label: "Ventas" },
  { href: "/cuenta-corriente", label: "Cuenta corriente" }
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav style={{
      background: "#1e293b",
      color: "white",
      padding: "0 16px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        height: 60,
        gap: 8
      }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginRight: 24 }}>
          🛢️ Aceite App
        </div>
        {links.map(l => {
          const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                background: active ? "#334155" : "transparent",
                transition: "background 0.15s",
                fontSize: 14
              }}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
`;

// ============================================
// components/Card.tsx
// ============================================
files["src/app/components/Card.tsx"] = `export default function Card({
  title,
  value,
  subtitle,
  color = "#1e293b"
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div style={{
      background: "white",
      padding: 20,
      borderRadius: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      borderLeft: "4px solid " + color
    }}>
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#1e293b" }}>{value}</div>
      {subtitle && (
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{subtitle}</div>
      )}
    </div>
  );
}
`;

// ============================================
// page.tsx - Dashboard
// ============================================
files["src/app/page.tsx"] = `import Card from "./components/Card";
import Link from "next/link";

async function fetchJSON(path: string) {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(base + path, { cache: "no-store" });
    if (!res.ok) return { data: [] };
    return res.json();
  } catch {
    return { data: [] };
  }
}

export default async function Home() {
  const [clientes, productos, stockBajo, cierre] = await Promise.all([
    fetchJSON("/api/clientes"),
    fetchJSON("/api/productos"),
    fetchJSON("/api/reportes/stock-bajo"),
    fetchJSON("/api/reportes/cierre-caja")
  ]);

  const totalClientes = (clientes.data || []).length;
  const totalProductos = (productos.data || []).length;
  const productosBajos = stockBajo.data || [];
  const cobradoHoy = cierre.data?.total_cobrado || 0;

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 26 }}>Panel de control</h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
        marginBottom: 32
      }}>
        <Card title="Clientes" value={totalClientes} color="#0ea5e9" />
        <Card title="Productos" value={totalProductos} color="#8b5cf6" />
        <Card
          title="Cobrado hoy"
          value={"$" + Number(cobradoHoy).toLocaleString("es-AR")}
          color="#10b981"
        />
        <Card
          title="Stock bajo"
          value={productosBajos.length}
          subtitle="productos a reponer"
          color="#ef4444"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "white", padding: 20, borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: 18, marginBottom: 14 }}>Accesos rápidos</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/clientes/nuevo" className="btn btn-primary" style={{ textAlign: "center" }}>
              + Nuevo cliente
            </Link>
            <Link href="/productos" className="btn btn-secondary" style={{ textAlign: "center" }}>
              Ver inventario
            </Link>
            <Link href="/ventas" className="btn btn-secondary" style={{ textAlign: "center" }}>
              Ver ventas
            </Link>
          </div>
        </div>

        {productosBajos.length > 0 && (
          <div style={{ background: "white", padding: 20, borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: 18, marginBottom: 14 }}>⚠️ Stock bajo</h2>
            <table className="table" style={{ boxShadow: "none" }}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {productosBajos.slice(0, 5).map((p: any) => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td style={{ color: "#ef4444", fontWeight: 600 }}>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
`;

// ============================================
// clientes/page.tsx
// ============================================
files["src/app/clientes/page.tsx"] = `import Link from "next/link";

async function fetchClientes() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(base + "/api/clientes", { cache: "no-store" });
  const json = await res.json();
  return json.data || [];
}

export default async function ClientesPage() {
  const clientes = await fetchClientes();

  return (
    <div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24
      }}>
        <h1 style={{ fontSize: 26 }}>Clientes</h1>
        <Link href="/clientes/nuevo" className="btn btn-primary">
          + Nuevo cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <div style={{
          background: "white",
          padding: 40,
          borderRadius: 10,
          textAlign: "center",
          color: "#64748b"
        }}>
          No hay clientes aún. Cargá el primero.
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Cuenta cte.</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c: any) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 500 }}>{c.nombre}</td>
                <td style={{ color: "#64748b" }}>{c.telefono || "-"}</td>
                <td style={{ color: "#64748b" }}>{c.email || "-"}</td>
                <td>{c.permite_cuenta_corriente ? "✅" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
`;

// ============================================
// clientes/nuevo/page.tsx
// ============================================
files["src/app/clientes/nuevo/page.tsx"] = `"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoCliente() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    permite_cuenta_corriente: false,
    limite_credito: 0
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
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

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>Nuevo cliente</h1>

      <form onSubmit={guardar} style={{
        background: "white",
        padding: 24,
        borderRadius: 10,
        maxWidth: 500,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
      }}>
        {error && (
          <div style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: 12,
            borderRadius: 6,
            marginBottom: 16,
            fontSize: 14
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
            Nombre *
          </label>
          <input
            required
            className="input"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
            Teléfono
          </label>
          <input
            className="input"
            value={form.telefono}
            onChange={e => setForm({ ...form, telefono: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
            Email
          </label>
          <input
            type="email"
            className="input"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={form.permite_cuenta_corriente}
              onChange={e => setForm({ ...form, permite_cuenta_corriente: e.target.checked })}
            />
            Permite cuenta corriente
          </label>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? "Guardando..." : "Guardar"}
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
    </div>
  );
}
`;

// ============================================
// productos/page.tsx
// ============================================
files["src/app/productos/page.tsx"] = `async function fetchProductos() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(base + "/api/productos", { cache: "no-store" });
  const json = await res.json();
  return json.data || [];
}

const tipoLabel: Record<string, string> = {
  aceite: "🛢️ Aceite",
  filtro: "🔧 Filtro",
  repuesto: "⚙️ Repuesto",
  insumo: "📦 Insumo"
};

export default async function ProductosPage() {
  const productos = await fetchProductos();

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>Productos</h1>

      <table className="table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Marca</th>
            <th>Stock</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p: any) => {
            const stockBajo = p.stock <= p.stock_minimo;
            return (
              <tr key={p.id}>
                <td style={{ color: "#64748b", fontSize: 13 }}>{p.codigo || "-"}</td>
                <td style={{ fontWeight: 500 }}>{p.nombre}</td>
                <td>{tipoLabel[p.tipo] || p.tipo}</td>
                <td style={{ color: "#64748b" }}>{p.marca || "-"}</td>
                <td style={{ fontWeight: 600, color: stockBajo ? "#ef4444" : "#16a34a" }}>
                  {p.stock}
                </td>
                <td style={{ fontWeight: 500 }}>
                  {"$" + Number(p.precio_venta).toLocaleString("es-AR")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
`;

// ============================================
// ventas/page.tsx
// ============================================
files["src/app/ventas/page.tsx"] = `async function fetchVentas() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(base + "/api/ventas", { cache: "no-store" });
  const json = await res.json();
  return json.data || [];
}

const estadoBadge: Record<string, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "#f59e0b" },
  parcial: { label: "Parcial", color: "#3b82f6" },
  pagada: { label: "Pagada", color: "#16a34a" },
  cuenta_corriente: { label: "Cta. cte.", color: "#ef4444" }
};

export default async function VentasPage() {
  const ventas = await fetchVentas();

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>Ventas</h1>

      {ventas.length === 0 ? (
        <div style={{
          background: "white",
          padding: 40,
          borderRadius: 10,
          textAlign: "center",
          color: "#64748b"
        }}>
          No hay ventas registradas aún.
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v: any) => {
              const badge = estadoBadge[v.estado_pago] || estadoBadge.pendiente;
              return (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600 }}>#{v.numero}</td>
                  <td style={{ color: "#64748b", fontSize: 13 }}>
                    {new Date(v.fecha).toLocaleDateString("es-AR")}
                  </td>
                  <td>{v.cliente?.nombre || "Consumidor final"}</td>
                  <td style={{ fontWeight: 600 }}>
                    {"$" + Number(v.total).toLocaleString("es-AR")}
                  </td>
                  <td>
                    <span style={{
                      background: badge.color + "20",
                      color: badge.color,
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {badge.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
`;

// ============================================
// cuenta-corriente/page.tsx
// ============================================
files["src/app/cuenta-corriente/page.tsx"] = `async function fetchSaldos() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(base + "/api/cuenta-corriente", { cache: "no-store" });
  const json = await res.json();
  return json.data || [];
}

export default async function CuentaCorrientePage() {
  const saldos = await fetchSaldos();
  const conDeuda = saldos.filter((s: any) => Number(s.saldo) > 0);
  const totalDeuda = conDeuda.reduce((sum: number, s: any) => sum + Number(s.saldo), 0);

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>Cuenta corriente</h1>

      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        marginBottom: 24,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        display: "flex",
        gap: 40
      }}>
        <div>
          <div style={{ fontSize: 13, color: "#64748b" }}>Total por cobrar</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>
            {"$" + totalDeuda.toLocaleString("es-AR")}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: "#64748b" }}>Clientes con deuda</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{conDeuda.length}</div>
        </div>
      </div>

      {saldos.length === 0 ? (
        <div style={{
          background: "white",
          padding: 40,
          borderRadius: 10,
          textAlign: "center",
          color: "#64748b"
        }}>
          No hay movimientos aún.
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Deudas</th>
              <th>Abonos</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {saldos.map((s: any) => {
              const debe = Number(s.saldo) > 0;
              return (
                <tr key={s.cliente_id}>
                  <td style={{ fontWeight: 500 }}>{s.nombre}</td>
                  <td style={{ color: "#64748b" }}>{s.telefono || "-"}</td>
                  <td>{"$" + Number(s.total_deudas).toLocaleString("es-AR")}</td>
                  <td>{"$" + Number(s.total_abonos).toLocaleString("es-AR")}</td>
                  <td style={{
                    fontWeight: 700,
                    color: debe ? "#ef4444" : Number(s.saldo) < 0 ? "#16a34a" : "#64748b"
                  }}>
                    {"$" + Number(s.saldo).toLocaleString("es-AR")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
`;

// ESCRIBIR TODOS
for (const [file, content] of Object.entries(files)) {
  w(file, content);
}

console.log("\n✅ Frontend creado:", Object.keys(files).length, "archivos");
