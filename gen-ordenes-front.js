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
// ORDENES - listado
// ============================================
files["src/app/ordenes/page.tsx"] = `import Link from "next/link";

async function fetchOrdenes() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(base + "/api/ordenes", { cache: "no-store" });
  const json = await res.json();
  return json.data || [];
}

const estadoBadge: Record<string, { label: string; color: string }> = {
  en_proceso: { label: "En proceso", color: "#f59e0b" },
  completado: { label: "Completado", color: "#0ea5e9" },
  entregado: { label: "Entregado", color: "#16a34a" },
  cancelado: { label: "Cancelado", color: "#94a3b8" }
};

const pagoBadge: Record<string, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "#f59e0b" },
  parcial: { label: "Parcial", color: "#3b82f6" },
  pagada: { label: "Pagada", color: "#16a34a" },
  cuenta_corriente: { label: "Cta. cte.", color: "#ef4444" }
};

export default async function OrdenesPage() {
  const ordenes = await fetchOrdenes();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Órdenes de servicio</h1>
          <div className="page-subtitle">
            {ordenes.length} {ordenes.length === 1 ? "orden" : "órdenes"}
          </div>
        </div>
        <Link href="/ordenes/nueva" className="btn btn-primary">
          + Nueva orden
        </Link>
      </div>

      {ordenes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔧</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            No hay órdenes aún
          </div>
          <Link href="/ordenes/nueva" className="btn btn-primary">
            + Nueva orden
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Cliente / Vehículo</th>
                <th>Km</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Pago</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o: any) => {
                const est = estadoBadge[o.estado] || estadoBadge.en_proceso;
                const pag = pagoBadge[o.estado_pago] || pagoBadge.pendiente;
                return (
                  <tr key={o.id}>
                    <td>
                      <Link href={"/ordenes/" + o.id} style={{ fontWeight: 600, color: "#0ea5e9", textDecoration: "none" }}>
                        #{o.numero}
                      </Link>
                    </td>
                    <td style={{ color: "#64748b", fontSize: 13 }}>
                      {new Date(o.fecha).toLocaleDateString("es-AR")}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{o.cliente?.nombre}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {o.vehiculo?.marca} {o.vehiculo?.modelo} {o.vehiculo?.placa && "· " + o.vehiculo.placa}
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{Number(o.km_ingreso).toLocaleString("es-AR")}</td>
                    <td style={{ fontWeight: 700 }}>{"$" + Number(o.total).toLocaleString("es-AR")}</td>
                    <td>
                      <span className="badge" style={{ background: est.color + "20", color: est.color }}>
                        {est.label}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: pag.color + "20", color: pag.color }}>
                        {pag.label}
                      </span>
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
`;

// ============================================
// ORDENES - nueva
// ============================================
files["src/app/ordenes/nueva/page.tsx"] = `"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  producto_id?: string | null;
  servicio_id?: string | null;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
};

export default function NuevaOrden() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [vehiculoId, setVehiculoId] = useState("");
  const [kmIngreso, setKmIngreso] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [descuento, setDescuento] = useState(0);
  const [notas, setNotas] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/clientes").then(r => r.json()).then(j => setClientes(j.data || []));
    fetch("/api/productos").then(r => r.json()).then(j => setProductos(j.data || []));
    fetch("/api/servicios").then(r => r.json()).then(j => setServicios(j.data || []));
  }, []);

  useEffect(() => {
    if (clienteId) {
      fetch("/api/vehiculos?cliente_id=" + clienteId)
        .then(r => r.json())
        .then(j => setVehiculos(j.data || []));
      setVehiculoId("");
    } else {
      setVehiculos([]);
    }
  }, [clienteId]);

  const subtotal = items.reduce((s, i) => s + i.cantidad * i.precio_unitario, 0);
  const total = subtotal - descuento;

  const sugerencias = busqueda.length > 0
    ? [
        ...servicios.filter(s => s.nombre.toLowerCase().includes(busqueda.toLowerCase()))
          .map(s => ({ tipo: "servicio", data: s })),
        ...productos.filter(p =>
          p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          (p.codigo || "").toLowerCase().includes(busqueda.toLowerCase())
        ).map(p => ({ tipo: "producto", data: p }))
      ].slice(0, 8)
    : [];

  function agregarServicio(s: any) {
    const existe = items.find(i => i.servicio_id === s.id);
    if (existe) {
      setItems(items.map(i => i.servicio_id === s.id ? { ...i, cantidad: i.cantidad + 1 } : i));
    } else {
      setItems([...items, {
        servicio_id: s.id,
        producto_id: null,
        nombre: s.nombre,
        cantidad: 1,
        precio_unitario: Number(s.precio)
      }]);
    }
    setBusqueda("");
  }

  function agregarProducto(p: any) {
    const existe = items.find(i => i.producto_id === p.id);
    if (existe) {
      setItems(items.map(i => i.producto_id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i));
    } else {
      setItems([...items, {
        producto_id: p.id,
        servicio_id: null,
        nombre: p.nombre,
        cantidad: 1,
        precio_unitario: Number(p.precio_venta)
      }]);
    }
    setBusqueda("");
  }

  function cambiarCantidad(idx: number, cantidad: number) {
    if (cantidad <= 0) {
      setItems(items.filter((_, i) => i !== idx));
    } else {
      setItems(items.map((it, i) => i === idx ? { ...it, cantidad } : it));
    }
  }

  function cambiarPrecio(idx: number, precio: number) {
    setItems(items.map((it, i) => i === idx ? { ...it, precio_unitario: precio } : it));
  }

  async function guardar() {
    if (!clienteId || !vehiculoId) { setError("Elegí cliente y vehículo"); return; }
    if (items.length === 0) { setError("Agregá al menos un item"); return; }

    setGuardando(true);
    setError("");

    try {
      const res = await fetch("/api/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: clienteId,
          vehiculo_id: vehiculoId,
          km_ingreso: kmIngreso,
          items: items.map(i => ({
            producto_id: i.producto_id || null,
            servicio_id: i.servicio_id || null,
            cantidad: i.cantidad,
            precio_unitario: i.precio_unitario
          })),
          descuento,
          notas: notas || null
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      router.push("/ordenes/" + json.data.id);
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
          <h1 className="page-title">Nueva orden de servicio</h1>
          <div className="page-subtitle">Cargá el vehículo, los servicios y el kilometraje</div>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 18 }}>
          ⚠️ {error}
        </div>
      )}

      <div className="venta-grid">
        <div>
          <div className="form-card" style={{ marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Cliente *</label>
                <select className="input" value={clienteId} onChange={e => setClienteId(e.target.value)}>
                  <option value="">Elegí un cliente</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Vehículo *</label>
                <select
                  className="input"
                  value={vehiculoId}
                  onChange={e => setVehiculoId(e.target.value)}
                  disabled={!clienteId}
                >
                  <option value="">Elegí un vehículo</option>
                  {vehiculos.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.marca} {v.modelo} {v.placa && "· " + v.placa}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">Kilometraje de ingreso</label>
              <input type="number" className="input" value={kmIngreso}
                onChange={e => setKmIngreso(Number(e.target.value))} />
            </div>
          </div>

          <div className="form-card">
            <label className="form-label">Buscar servicio o producto</label>
            <input className="input" placeholder="Cambio de aceite, filtro, etc..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />

            {sugerencias.length > 0 && (
              <div style={{ marginTop: 8, border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                {sugerencias.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => s.tipo === "servicio" ? agregarServicio(s.data) : agregarProducto(s.data)}
                    style={{
                      padding: 12, cursor: "pointer", borderBottom: "1px solid #f1f5f9",
                      display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {s.tipo === "servicio" ? "🔧 " : "📦 "}{s.data.nombre}
                      </div>
                      {s.tipo === "producto" && (
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {s.data.codigo} · stock {s.data.stock}
                        </div>
                      )}
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {"$" + Number(s.tipo === "servicio" ? s.data.precio : s.data.precio_venta).toLocaleString("es-AR")}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">Notas</label>
              <textarea className="input" rows={2} value={notas} onChange={e => setNotas(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-card" style={{ height: "fit-content" }}>
          <h2 style={{ fontSize: 16, marginBottom: 14 }}>Items de la orden</h2>

          {items.length === 0 ? (
            <div style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: 20 }}>
              Buscá servicios o productos
            </div>
          ) : (
            items.map((it, idx) => (
              <div key={idx} style={{ borderBottom: "1px solid #f1f5f9", padding: "12px 0" }}>
                <div style={{ fontWeight: 500, marginBottom: 6 }}>{it.nombre}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => cambiarCantidad(idx, it.cantidad - 1)}
                    className="btn btn-secondary" style={{ padding: "4px 10px", minWidth: 32 }}>−</button>
                  <input type="number" value={it.cantidad}
                    onChange={e => cambiarCantidad(idx, Number(e.target.value))}
                    style={{ width: 50, padding: 6, textAlign: "center", border: "1px solid #cbd5e1", borderRadius: 4 }} />
                  <button onClick={() => cambiarCantidad(idx, it.cantidad + 1)}
                    className="btn btn-secondary" style={{ padding: "4px 10px", minWidth: 32 }}>+</button>
                  <input type="number" value={it.precio_unitario}
                    onChange={e => cambiarPrecio(idx, Number(e.target.value))}
                    style={{ flex: 1, padding: 6, textAlign: "right", border: "1px solid #cbd5e1", borderRadius: 4 }} />
                </div>
              </div>
            ))
          )}

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "2px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span>Subtotal</span>
              <span>{"$" + subtotal.toLocaleString("es-AR")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center", fontSize: 14 }}>
              <span>Descuento</span>
              <input type="number" value={descuento} onChange={e => setDescuento(Number(e.target.value))}
                style={{ width: 100, padding: 6, textAlign: "right", border: "1px solid #cbd5e1", borderRadius: 4 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 20, fontWeight: 700 }}>
              <span>Total</span>
              <span>{"$" + total.toLocaleString("es-AR")}</span>
            </div>

            <button onClick={guardar} disabled={guardando || items.length === 0}
              className="btn btn-primary" style={{ width: "100%", marginTop: 16 }}>
              {guardando ? "Guardando..." : "Crear orden"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

for (const [file, content] of Object.entries(files)) {
  w(file, content);
}

console.log("\n✅ Frontend de ordenes creado");
