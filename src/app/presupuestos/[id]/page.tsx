"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const estados = [
  { value: "borrador", label: "📝 Borrador", color: "#64748b" },
  { value: "enviado", label: "📤 Enviado", color: "#0ea5e9" },
  { value: "aceptado", label: "✅ Aceptado", color: "#16a34a" },
  { value: "rechazado", label: "❌ Rechazado", color: "#ef4444" },
  { value: "convertido", label: "🔧 Convertido", color: "#8b5cf6" }
];

export default function DetallePresupuesto() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [presupuesto, setPresupuesto] = useState<any>(null);
  const [accion, setAccion] = useState("");
  const [kmIngreso, setKmIngreso] = useState(0);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  async function cargar() {
    const res = await fetch("/api/presupuestos/" + id);
    const json = await res.json();
    setPresupuesto(json.data);
  }

  useEffect(() => { cargar(); }, [id]);

  async function cambiarEstado(nuevoEstado: string) {
    if (nuevoEstado === "convertido") { setAccion("convertir"); return; }
    setProcesando(true);
    setError("");
    try {
      const res = await fetch("/api/presupuestos/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (!res.ok) throw new Error("Error al actualizar");
      await cargar();
      setExito("Estado actualizado");
      setTimeout(() => setExito(""), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProcesando(false);
    }
  }

  async function enviarPorWhatsApp() {
    await fetch("/api/presupuestos/" + id + "/enviar", { method: "POST" });
    await cargar();

    const tel = (presupuesto.cliente?.telefono || "").replace(/[^0-9]/g, "");
    const itemsTexto = (presupuesto.items || []).map((it: any) => {
      const nombre = it.producto?.nombre || it.servicio?.nombre || it.descripcion || "";
      const subtotal = Number(it.subtotal).toLocaleString("es-AR");
      return `• ${nombre} x${it.cantidad} - $${subtotal}`;
    }).join("\n");

    let mensaje = `Hola ${presupuesto.cliente?.nombre || ""}! 👋\n\n`;
    mensaje += `Te paso el presupuesto de *ARN Lubricentro*:\n\n`;
    mensaje += `📄 *Presupuesto #${presupuesto.numero}*\n`;
    if (presupuesto.vehiculo) {
      mensaje += `🚗 ${presupuesto.vehiculo.marca} ${presupuesto.vehiculo.modelo}`;
      if (presupuesto.vehiculo.placa) mensaje += ` (${presupuesto.vehiculo.placa})`;
      mensaje += `\n`;
    }
    mensaje += `\n${itemsTexto}\n\n`;
    mensaje += `💵 *TOTAL: $${Number(presupuesto.total).toLocaleString("es-AR")}*\n`;
    mensaje += `📅 Válido hasta: ${new Date(presupuesto.fecha_vencimiento).toLocaleDateString("es-AR")}\n`;
    mensaje += `\n¿Lo aprobamos? 🔧\nARN Lubricentro y Repuestos`;

    const url = `https://wa.me/${tel.startsWith("54") ? tel : "54" + tel}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  }

  async function convertirAOrden() {
    setProcesando(true);
    setError("");
    try {
      const res = await fetch("/api/presupuestos/" + id + "/convertir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ km_ingreso: kmIngreso })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al convertir");
      router.push("/ordenes/" + json.data.orden_id);
    } catch (e: any) {
      setError(e.message);
      setProcesando(false);
    }
  }

  async function eliminar() {
    if (!confirm("¿Eliminar este presupuesto?")) return;
    setProcesando(true);
    await fetch("/api/presupuestos/" + id, { method: "DELETE" });
    router.push("/presupuestos");
  }

  if (!presupuesto) return <div>Cargando...</div>;

  const estadoActual = estados.find(e => e.value === presupuesto.estado) || estados[0];
  const esConvertido = presupuesto.estado === "convertido";

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📄 Presupuesto #{presupuesto.numero}</h1>
          <div className="page-subtitle">
            {new Date(presupuesto.created_at).toLocaleDateString("es-AR")}
            {" · "}
            <span className="badge" style={{ background: estadoActual.color + "20", color: estadoActual.color }}>
              {estadoActual.label}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/presupuestos" className="btn btn-secondary">← Volver</Link>
          {presupuesto.cliente?.telefono && !esConvertido && (
            <button onClick={enviarPorWhatsApp} className="btn"
              style={{ background: "linear-gradient(135deg, #25d366, #128c7e)", color: "white", fontWeight: 700 }}>
              📱 Enviar por WhatsApp
            </button>
          )}
          {presupuesto.estado === "enviado" && (
            <button onClick={() => cambiarEstado("aceptado")} disabled={procesando} className="btn btn-primary">
              ✅ Marcar aceptado
            </button>
          )}
          {presupuesto.estado === "aceptado" && (
            <button onClick={() => setAccion("convertir")} className="btn btn-primary">
              🔧 Convertir a orden
            </button>
          )}
          {esConvertido && presupuesto.orden_id && (
            <Link href={"/ordenes/" + presupuesto.orden_id} className="btn btn-primary">
              Ver orden →
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {exito && (
        <div style={{ background: "#dcfce7", color: "#166534", padding: 12, borderRadius: 8, marginBottom: 16 }}>
          ✅ {exito}
        </div>
      )}

      {accion === "convertir" && (
        <div className="form-card" style={{ marginBottom: 16, maxWidth: 480 }}>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Convertir a orden</h3>
          <div className="form-group">
            <label className="form-label">Km de ingreso del vehículo</label>
            <input type="number" className="input" value={kmIngreso}
              onChange={e => setKmIngreso(Number(e.target.value))} autoFocus />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={convertirAOrden} disabled={procesando} className="btn btn-primary" style={{ flex: 1 }}>
              {procesando ? "Convirtiendo..." : "Convertir a orden"}
            </button>
            <button onClick={() => setAccion("")} className="btn btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      <div className="venta-grid">
        <div>
          <div className="form-card" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, marginBottom: 12 }}>Cliente y vehículo</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 14 }}>
              <div>
                <div style={{ color: "#64748b", fontSize: 12 }}>Cliente</div>
                <div style={{ fontWeight: 600 }}>{presupuesto.cliente?.nombre}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{presupuesto.cliente?.telefono || "sin teléfono"}</div>
              </div>
              {presupuesto.vehiculo && (
                <div>
                  <div style={{ color: "#64748b", fontSize: 12 }}>Vehículo</div>
                  <div style={{ fontWeight: 600 }}>{presupuesto.vehiculo.marca} {presupuesto.vehiculo.modelo}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{presupuesto.vehiculo.placa}</div>
                </div>
              )}
            </div>
          </div>

          <div className="form-card">
            <h2 style={{ fontSize: 15, marginBottom: 12 }}>Items</h2>
            <table className="table" style={{ boxShadow: "none" }}>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(presupuesto.items || []).map((it: any) => (
                  <tr key={it.id}>
                    <td>
                      {it.servicio?.nombre || it.producto?.nombre || it.descripcion || "-"}
                    </td>
                    <td>{it.cantidad}</td>
                    <td>{"$" + Number(it.precio_unitario).toLocaleString("es-AR")}</td>
                    <td style={{ fontWeight: 600 }}>{"$" + Number(it.subtotal).toLocaleString("es-AR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="form-card" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span>Subtotal</span>
              <span>{"$" + Number(presupuesto.subtotal).toLocaleString("es-AR")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span>Descuento</span>
              <span>{"$" + Number(presupuesto.descuento).toLocaleString("es-AR")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0", fontSize: 20, fontWeight: 700 }}>
              <span>TOTAL</span>
              <span>{"$" + Number(presupuesto.total).toLocaleString("es-AR")}</span>
            </div>
          </div>

          <div className="form-card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>VALIDEZ</div>
            <div style={{ fontSize: 14 }}>
              Válido hasta: <strong>{new Date(presupuesto.fecha_vencimiento).toLocaleDateString("es-AR")}</strong>
            </div>
          </div>

          {presupuesto.notas && (
            <div className="form-card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>NOTAS</div>
              <div style={{ fontSize: 14, whiteSpace: "pre-line" }}>{presupuesto.notas}</div>
            </div>
          )}

          {!esConvertido && (
            <div className="form-card">
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>CAMBIAR ESTADO</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {estados.filter(e => e.value !== presupuesto.estado && e.value !== "convertido").map(e => (
                  <button key={e.value} onClick={() => cambiarEstado(e.value)} disabled={procesando}
                    className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }}>
                    {e.label}
                  </button>
                ))}
              </div>
              <button onClick={eliminar} className="btn btn-danger" style={{ width: "100%", marginTop: 12 }}>
                🗑️ Eliminar presupuesto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}