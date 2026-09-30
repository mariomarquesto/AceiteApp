"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import FirmaDigital from "@/app/components/FirmaDigital";
import Ticket from "@/app/components/Ticket";

export default function DetalleOrden() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [orden, setOrden] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [accion, setAccion] = useState("");
  const [montoCobro, setMontoCobro] = useState(0);
  const [medio, setMedio] = useState<"efectivo" | "transferencia" | "otro">("efectivo");
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [firmaBase64, setFirmaBase64] = useState<string>("");

  async function cargar() {
    setCargando(true);
    const res = await fetch("/api/ordenes/" + id);
    const json = await res.json();
    setOrden(json.data);
    setMontoCobro(Number(json.data?.saldo) || 0);
    setCargando(false);
  }

  useEffect(() => { cargar(); }, [id]);

  // Cargar la firma como base64 cuando cambia la URL
  useEffect(() => {
    if (!orden?.firma_url) {
      setFirmaBase64("");
      return;
    }

    console.log("Cargando firma desde:", orden.firma_url);

    fetch(orden.firma_url)
      .then(r => {
        console.log("Status:", r.status);
        return r.blob();
      })
      .then(blob => {
        console.log("Blob:", blob.size, blob.type);
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          console.log("Base64 cargado, largo:", result.length);
          setFirmaBase64(result);
        };
        reader.readAsDataURL(blob);
      })
      .catch((e) => {
        console.error("Error cargando firma:", e);
        setFirmaBase64("");
      });
  }, [orden?.firma_url]);

  async function cambiarEstado(nuevoEstado: string) {
    setProcesando(true);
    setError("");

    let ordenActualizada: any = null;

    try {
      const res = await fetch("/api/ordenes/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (!res.ok) throw new Error("Error al cambiar estado");

      const json = await res.json();
      ordenActualizada = json.data;

      await cargar();
    } catch (e: any) {
      setError(e.message);
      setProcesando(false);
      return;
    }

    setProcesando(false);

    if (nuevoEstado === "entregado" && ordenActualizada?.cliente?.telefono) {
      setTimeout(() => {
        abrirWhatsAppOrdenLista(ordenActualizada);
      }, 500);
    }
  }

  function abrirWhatsAppOrdenLista(orden: any) {
    const tel = (orden.cliente?.telefono || "").replace(/[^0-9]/g, "");
    const saludo = orden.cliente?.nombre ? `Hola ${orden.cliente.nombre}!` : "Hola!";

    const vehiculoInfo = orden.vehiculo
      ? `${orden.vehiculo.marca || ""} ${orden.vehiculo.modelo || ""}`.trim()
      : "tu vehículo";

    let mensaje = `${saludo} 👋\n\n`;
    mensaje += `Tu *${vehiculoInfo}* ya está listo para retirar en *ARN Lubricentro*. 🔧\n\n`;
    mensaje += `📋 *Orden #${orden.numero}*\n`;
    mensaje += `📅 Listo el ${new Date().toLocaleDateString("es-AR")}\n`;
    mensaje += `💵 *Total: $${Number(orden.total).toLocaleString("es-AR")}*\n`;

    if (Number(orden.saldo) > 0) {
      mensaje += `⚠️ Saldo pendiente: $${Number(orden.saldo).toLocaleString("es-AR")}\n`;
    } else {
      mensaje += `✅ *PAGADO*\n`;
    }

    mensaje += `\n📍 Paraguay 4395\n`;
    mensaje += `⏰ Lunes a viernes 9-18, sábados 9-13\n\n`;
    mensaje += `¡Te esperamos! 🚗`;

    const url = `https://wa.me/${tel.startsWith("54") ? tel : "54" + tel}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  }

  async function cobrar() {
    setProcesando(true);
    setError("");
    try {
      const res = await fetch("/api/ordenes/" + id + "/cobrar", {
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

  if (cargando) return <div>Cargando...</div>;
  if (!orden) return <div>Orden no encontrada</div>;

  const saldo = Number(orden.saldo);
  const puedeCobrar = saldo > 0 && orden.estado !== "cancelado";

  const estadoBadge: Record<string, { label: string; color: string }> = {
    en_proceso: { label: "En proceso", color: "#f59e0b" },
    completado: { label: "Completado", color: "#0ea5e9" },
    entregado: { label: "Entregado", color: "#16a34a" },
    cancelado: { label: "Cancelado", color: "#94a3b8" }
  };

  const badge = estadoBadge[orden.estado] || estadoBadge.en_proceso;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orden #{orden.numero}</h1>
          <div className="page-subtitle">
            {new Date(orden.fecha).toLocaleString("es-AR")}
            {" · "}
            <span className="badge" style={{ background: badge.color + "20", color: badge.color }}>
              {badge.label}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => router.push("/ordenes")} className="btn btn-secondary">
            Volver
          </button>
          <button onClick={() => setAccion(accion === "ticket" ? "" : "ticket")} className="btn btn-secondary">
            🖨️ {accion === "ticket" ? "Ocultar" : "Ver"} ticket
          </button>
          {orden.estado === "en_proceso" && (
            <button onClick={() => cambiarEstado("completado")} disabled={procesando} className="btn btn-primary">
              ✓ Marcar completado
            </button>
          )}
          {orden.estado === "completado" && (
            <button
              onClick={() => cambiarEstado("entregado")}
              disabled={procesando}
              className="btn"
              style={{
                background: "linear-gradient(135deg, #25d366, #128c7e)",
                color: "white",
                fontWeight: 700
              }}
            >
              🚗 Marcar entregado + Avisar
            </button>
          )}
          {orden.estado !== "cancelado" && !orden.firma_url && (
            <FirmaDigital
              tipo="orden"
              id={orden.id}
              onGuardado={() => cargar()}
            />
          )}
          {puedeCobrar && (
            <button onClick={() => setAccion(accion === "cobrar" ? "" : "cobrar")} className="btn btn-primary">
              💰 Cobrar
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {accion === "ticket" && (
        <div style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "center",
          padding: 20,
          background: "#f8fafc",
          borderRadius: 12
        }}>
          <Ticket
            tipo="Orden"
            numero={orden.numero}
            fecha={orden.fecha}
            cliente={orden.cliente}
            vehiculo={orden.vehiculo}
            items={orden.items || []}
            subtotal={orden.subtotal}
            descuento={orden.descuento}
            total={orden.total}
            pagado={Number(orden.total) - saldo}
            saldo={saldo}
            firmaBase64={firmaBase64}
            firmaUrl={orden.firma_url}
          />
        </div>
      )}

      <div className="venta-grid">
        <div>
          <div className="form-card" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, marginBottom: 12 }}>Cliente y vehículo</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 14 }}>
              <div>
                <div style={{ color: "#64748b", fontSize: 12 }}>Cliente</div>
                <div style={{ fontWeight: 600 }}>{orden.cliente?.nombre}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{orden.cliente?.telefono}</div>
              </div>
              <div>
                <div style={{ color: "#64748b", fontSize: 12 }}>Vehículo</div>
                <div style={{ fontWeight: 600 }}>
                  {orden.vehiculo?.marca} {orden.vehiculo?.modelo}
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {orden.vehiculo?.placa} · {Number(orden.km_ingreso).toLocaleString("es-AR")} km
                </div>
              </div>
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
                {(orden.items || []).map((it: any) => (
                  <tr key={it.id}>
                    <td>
                      {it.servicio?.nombre || it.producto?.nombre || it.descripcion || "-"}
                      {it.servicio && <span style={{ marginLeft: 6, fontSize: 11, color: "#64748b" }}>(servicio)</span>}
                      {it.producto && <span style={{ marginLeft: 6, fontSize: 11, color: "#64748b" }}>(producto)</span>}
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
              <span>{"$" + Number(orden.subtotal).toLocaleString("es-AR")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span>Descuento</span>
              <span>{"$" + Number(orden.descuento).toLocaleString("es-AR")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0", fontSize: 18, fontWeight: 700 }}>
              <span>Total</span>
              <span>{"$" + Number(orden.total).toLocaleString("es-AR")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 14 }}>
              <span>Pagado</span>
              <span style={{ color: "#16a34a" }}>
                {"$" + (Number(orden.total) - saldo).toLocaleString("es-AR")}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 14 }}>
              <span>Saldo</span>
              <span style={{ color: saldo > 0 ? "#ef4444" : "#16a34a", fontWeight: 700 }}>
                {"$" + saldo.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          {accion === "cobrar" && (
            <div className="form-card">
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Registrar cobro</h3>
              <div className="form-group">
                <label className="form-label">Monto</label>
                <input type="number" className="input" value={montoCobro}
                  onChange={e => setMontoCobro(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Medio</label>
                <select className="input" value={medio} onChange={e => setMedio(e.target.value as any)}>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
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

          {orden.firma_url && (
            <div className="form-card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                🖋️ FIRMA DEL CLIENTE
              </div>
              <img
                src={orden.firma_url}
                alt="Firma del cliente"
                style={{
                  width: "100%",
                  maxWidth: 300,
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  background: "white"
                }}
              />
              {orden.firma_fecha && (
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
                  Firmado el {new Date(orden.firma_fecha).toLocaleString("es-AR")}
                </div>
              )}
            </div>
          )}

          {orden.notas && (
            <div className="form-card">
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Notas</div>
              <div style={{ fontSize: 14 }}>{orden.notas}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}