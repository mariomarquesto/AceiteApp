"use client";

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
