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
// VENTAS - NUEVA (cliente component con carrito)
// ============================================
files["src/app/ventas/nueva/page.tsx"] = `"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Cliente = { id: string; nombre: string; permite_cuenta_corriente: boolean };
type Producto = { id: string; nombre: string; codigo: string | null; precio_venta: number; stock: number; tipo: string };
type Item = { producto_id: string; nombre: string; cantidad: number; precio_unitario: number };

export default function NuevaVenta() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/clientes").then(r => r.json()).then(j => setClientes(j.data || []));
    fetch("/api/productos").then(r => r.json()).then(j => setProductos(j.data || []));
  }, []);

  const subtotal = items.reduce((s, i) => s + i.cantidad * i.precio_unitario, 0);
  const total = subtotal - descuento;

  const productosFiltrados = busqueda.length > 0
    ? productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.codigo || "").toLowerCase().includes(busqueda.toLowerCase())
      ).slice(0, 8)
    : [];

  function agregarProducto(p: Producto) {
    const existe = items.find(i => i.producto_id === p.id);
    if (existe) {
      setItems(items.map(i =>
        i.producto_id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i
      ));
    } else {
      setItems([...items, {
        producto_id: p.id,
        nombre: p.nombre,
        cantidad: 1,
        precio_unitario: Number(p.precio_venta)
      }]);
    }
    setBusqueda("");
  }

  function cambiarCantidad(id: string, cantidad: number) {
    if (cantidad <= 0) {
      setItems(items.filter(i => i.producto_id !== id));
    } else {
      setItems(items.map(i => i.producto_id === id ? { ...i, cantidad } : i));
    }
  }

  function cambiarPrecio(id: string, precio: number) {
    setItems(items.map(i => i.producto_id === id ? { ...i, precio_unitario: precio } : i));
  }

  async function guardar() {
    if (items.length === 0) {
      setError("Agregá al menos un producto");
      return;
    }
    setGuardando(true);
    setError("");

    try {
      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: clienteId || null,
          items: items.map(i => ({
            producto_id: i.producto_id,
            cantidad: i.cantidad,
            precio_unitario: i.precio_unitario
          })),
          descuento,
          notas: null
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      router.push("/ventas/" + json.data.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>Nueva venta</h1>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 20 }}>
        <div>
          <div style={{ background: "white", padding: 20, borderRadius: 10, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
              Cliente (opcional)
            </label>
            <select
              className="input"
              value={clienteId}
              onChange={e => setClienteId(e.target.value)}
            >
              <option value="">Consumidor final</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div style={{ background: "white", padding: 20, borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
              Buscar producto
            </label>
            <input
              className="input"
              placeholder="Nombre o código..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              autoFocus
            />

            {productosFiltrados.length > 0 && (
              <div style={{ marginTop: 8, border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden" }}>
                {productosFiltrados.map(p => (
                  <div
                    key={p.id}
                    onClick={() => agregarProducto(p)}
                    style={{
                      padding: 12,
                      cursor: "pointer",
                      borderBottom: "1px solid #f1f5f9",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>{p.nombre}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {p.codigo} · stock {p.stock}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {"$" + Number(p.precio_venta).toLocaleString("es-AR")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ background: "white", padding: 20, borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", height: "fit-content" }}>
          <h2 style={{ fontSize: 16, marginBottom: 14 }}>Carrito</h2>

          {items.length === 0 ? (
            <div style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: 20 }}>
              Buscá productos para agregar
            </div>
          ) : (
            <>
              {items.map(i => (
                <div key={i.producto_id} style={{ borderBottom: "1px solid #f1f5f9", padding: "12px 0" }}>
                  <div style={{ fontWeight: 500, marginBottom: 6 }}>{i.nombre}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                      onClick={() => cambiarCantidad(i.producto_id, i.cantidad - 1)}
                      className="btn btn-secondary"
                      style={{ padding: "4px 10px", minWidth: 32 }}
                    >−</button>
                    <input
                      type="number"
                      value={i.cantidad}
                      onChange={e => cambiarCantidad(i.producto_id, Number(e.target.value))}
                      style={{ width: 50, padding: 6, textAlign: "center", border: "1px solid #cbd5e1", borderRadius: 4 }}
                    />
                    <button
                      onClick={() => cambiarCantidad(i.producto_id, i.cantidad + 1)}
                      className="btn btn-secondary"
                      style={{ padding: "4px 10px", minWidth: 32 }}
                    >+</button>
                    <input
                      type="number"
                      value={i.precio_unitario}
                      onChange={e => cambiarPrecio(i.producto_id, Number(e.target.value))}
                      style={{ flex: 1, padding: 6, textAlign: "right", border: "1px solid #cbd5e1", borderRadius: 4 }}
                    />
                  </div>
                </div>
              ))}
            </>
          )}

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "2px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span>Subtotal</span>
              <span>{"$" + subtotal.toLocaleString("es-AR")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center", fontSize: 14 }}>
              <span>Descuento</span>
              <input
                type="number"
                value={descuento}
                onChange={e => setDescuento(Number(e.target.value))}
                style={{ width: 100, padding: 6, textAlign: "right", border: "1px solid #cbd5e1", borderRadius: 4 }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 20, fontWeight: 700 }}>
              <span>Total</span>
              <span>{"$" + total.toLocaleString("es-AR")}</span>
            </div>

            <button
              onClick={guardar}
              disabled={guardando || items.length === 0}
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 16 }}
            >
              {guardando ? "Guardando..." : "Guardar venta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

// ============================================
// VENTAS - DETALLE
// ============================================
files["src/app/ventas/[id]/page.tsx"] = `"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type Venta = any;

export default function DetalleVenta() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [venta, setVenta] = useState<Venta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [accion, setAccion] = useState("");
  const [montoCobro, setMontoCobro] = useState(0);
  const [medio, setMedio] = useState<"efectivo" | "transferencia" | "otro">("efectivo");
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);

  async function cargar() {
    setCargando(true);
    const res = await fetch("/api/ventas/" + id);
    const json = await res.json();
    setVenta(json.data);
    setMontoCobro(json.data?.saldo || 0);
    setCargando(false);
  }

  useEffect(() => { cargar(); }, [id]);

  async function cobrar() {
    setProcesando(true);
    setError("");
    try {
      const res = await fetch("/api/ventas/" + id + "/cobrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monto: montoCobro, medio, notas: null })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al cobrar");
      await cargar();
      setAccion("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProcesando(false);
    }
  }

  async function anular() {
    if (!confirm("¿Anular esta venta? Se devolverá el stock.")) return;
    setProcesando(true);
    setError("");
    try {
      const res = await fetch("/api/ventas/" + id + "/anular", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al anular");
      await cargar();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProcesando(false);
    }
  }

  async function eliminar() {
    if (!confirm("¿Eliminar esta venta? Esto no se puede deshacer.")) return;
    setProcesando(true);
    setError("");
    try {
      const res = await fetch("/api/ventas/" + id, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al eliminar");
      router.push("/ventas");
    } catch (e: any) {
      setError(e.message);
      setProcesando(false);
    }
  }

  if (cargando) return <div>Cargando...</div>;
  if (!venta) return <div>Venta no encontrada</div>;

  const anulada = venta.notas && venta.notas.includes("[ANULADA]");
  const saldo = Number(venta.saldo);
  const puedeCobrar = !anulada && saldo > 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>Venta #{venta.numero}</h1>
          <div style={{ color: "#64748b", fontSize: 14 }}>
            {new Date(venta.fecha).toLocaleString("es-AR")}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => router.push("/ventas")} className="btn btn-secondary">
            Volver
          </button>
          {puedeCobrar && (
            <button onClick={() => setAccion("cobrar")} className="btn btn-primary">
              Cobrar
            </button>
          )}
          {!anulada && venta.estado_pago !== "pagada" && (
            <button onClick={anular} disabled={procesando} className="btn btn-danger">
              Anular
            </button>
          )}
          {!anulada && venta.estado_pago !== "pagada" && (
            <button onClick={eliminar} disabled={procesando} className="btn btn-danger">
              Eliminar
            </button>
          )}
        </div>
      </div>

      {anulada && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 6, marginBottom: 16 }}>
          ⚠️ Esta venta fue ANULADA
        </div>
      )}

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        <div style={{ background: "white", padding: 20, borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: 16, marginBottom: 14 }}>Items</h2>
          <table className="table" style={{ boxShadow: "none" }}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(venta.items || []).map((it: any) => (
                <tr key={it.id}>
                  <td>{it.producto?.nombre || it.descripcion || "-"}</td>
                  <td>{it.cantidad}</td>
                  <td>{"$" + Number(it.precio_unitario).toLocaleString("es-AR")}</td>
                  <td style={{ fontWeight: 600 }}>{"$" + Number(it.subtotal).toLocaleString("es-AR")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {venta.notas && !anulada && (
            <div style={{ marginTop: 16, padding: 12, background: "#f8fafc", borderRadius: 6, fontSize: 14 }}>
              <strong>Notas:</strong> {venta.notas}
            </div>
          )}
        </div>

        <div>
          <div style={{ background: "white", padding: 20, borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span>Subtotal</span>
              <span>{"$" + Number(venta.subtotal).toLocaleString("es-AR")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span>Descuento</span>
              <span>{"$" + Number(venta.descuento).toLocaleString("es-AR")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0", fontSize: 18, fontWeight: 700 }}>
              <span>Total</span>
              <span>{"$" + Number(venta.total).toLocaleString("es-AR")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 14 }}>
              <span>Pagado</span>
              <span style={{ color: "#16a34a" }}>
                {"$" + (Number(venta.total) - saldo).toLocaleString("es-AR")}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 14 }}>
              <span>Saldo</span>
              <span style={{ color: saldo > 0 ? "#ef4444" : "#16a34a", fontWeight: 600 }}>
                {"$" + saldo.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          {accion === "cobrar" && (
            <div style={{ background: "white", padding: 20, borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <h3 style={{ fontSize: 15, marginBottom: 14 }}>Registrar cobro</h3>

              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Monto</label>
              <input
                type="number"
                className="input"
                value={montoCobro}
                onChange={e => setMontoCobro(Number(e.target.value))}
                style={{ marginBottom: 12 }}
              />

              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Medio</label>
              <select
                className="input"
                value={medio}
                onChange={e => setMedio(e.target.value as any)}
                style={{ marginBottom: 12 }}
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="otro">Otro</option>
              </select>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={cobrar} disabled={procesando} className="btn btn-primary" style={{ flex: 1 }}>
                  {procesando ? "..." : "Cobrar"}
                </button>
                <button onClick={() => setAccion("")} className="btn btn-secondary">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;

for (const [file, content] of Object.entries(files)) {
  w(file, content);
}

console.log("\n✅ Pantallas de ventas creadas:", Object.keys(files).length);
