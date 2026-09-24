"use client";

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
