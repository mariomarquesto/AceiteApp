"use client";

import { jsPDF } from "jspdf";
import { useEffect, useState } from "react";

export default function Ticket({
  tipo,
  numero,
  fecha,
  cliente,
  vehiculo,
  items,
  subtotal,
  descuento,
  total,
  pagado,
  saldo,
  medio,
  firmaBase64: firmaBase64Prop,
  firmaUrl
}: any) {
  const [firmaBase64, setFirmaBase64] = useState<string>(firmaBase64Prop || "");

  // Cargar firma si no viene como prop pero hay URL
  useEffect(() => {
    if (firmaBase64Prop) {
      setFirmaBase64(firmaBase64Prop);
      return;
    }
    if (!firmaUrl) {
      setFirmaBase64("");
      return;
    }

    let cancelado = false;

    fetch(firmaUrl)
      .then(r => r.blob())
      .then(blob => {
        if (cancelado) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          if (!cancelado) {
            setFirmaBase64(reader.result as string);
          }
        };
        reader.readAsDataURL(blob);
      })
      .catch(e => {
        console.error("Error cargando firma en Ticket:", e);
        if (!cancelado) setFirmaBase64("");
      });

    return () => { cancelado = true; };
  }, [firmaBase64Prop, firmaUrl]);

  function generarPDF() {
    const ancho = 226;
    const margen = 12;
    const anchoUtil = ancho - margen * 2;

    const altoItems = items.reduce((s: number, it: any) => {
      const nombre = it.descripcion || it.producto?.nombre || it.servicio?.nombre || "";
      return s + (nombre.length > 30 ? 60 : 48);
    }, 0);
    const altoCliente = cliente ? 45 : 0;
    const altoVehiculo = vehiculo ? 45 : 0;
    const altoFirma = firmaBase64 ? 100 : 0;
    const alto = 260 + altoItems + altoCliente + altoVehiculo + altoFirma;

    const doc = new jsPDF({
      unit: "pt",
      format: [ancho, alto]
    });

    const AZUL = [15, 23, 42];
    const AZUL_CLARO = [14, 165, 233];
    const NARANJA = [249, 115, 22];
    const GRIS = [100, 116, 139];
    const GRIS_CLARO = [241, 245, 249];
    const NEGRO = [15, 23, 42];

    let y = 0;

    // ENCABEZADO
    doc.setFillColor(AZUL[0], AZUL[1], AZUL[2]);
    doc.rect(0, 0, ancho, 60, "F");

    doc.setFillColor(NARANJA[0], NARANJA[1], NARANJA[2]);
    doc.circle(28, 30, 12, "F");

    doc.setFillColor(AZUL_CLARO[0], AZUL_CLARO[1], AZUL_CLARO[2]);
    doc.circle(28, 30, 8, "F");

    doc.setFillColor(255, 255, 255);
    doc.triangle(24, 28, 32, 28, 28, 36, "F");
    doc.circle(28, 30, 5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("ARN", 50, 27);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(200, 220, 240);
    doc.text("LUBRICENTRO Y REPUESTOS", 50, 40);

    y = 75;

    // TIPO Y NÚMERO
    doc.setFillColor(GRIS_CLARO[0], GRIS_CLARO[1], GRIS_CLARO[2]);
    doc.roundedRect(margen, y - 10, anchoUtil, 24, 4, 4, "F");

    doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(tipo.toUpperCase() + " #" + numero, margen + 8, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
    const fechaStr = new Date(fecha).toLocaleDateString("es-AR");
    const horaStr = new Date(fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    doc.text(fechaStr + " " + horaStr, ancho - margen - 8, y + 5, { align: "right" });

    y += 25;

    // CLIENTE Y VEHÍCULO
    if (cliente || vehiculo) {
      let lineasCliente = 0;
      if (cliente) lineasCliente += cliente.telefono ? 2 : 1;
      if (vehiculo) lineasCliente += vehiculo.placa ? 2 : 1;

      const altoCaja = 20 + lineasCliente * 12;

      doc.setDrawColor(200, 210, 220);
      doc.setLineWidth(0.5);
      doc.roundedRect(margen, y - 8, anchoUtil, altoCaja, 4, 4, "S");

      let yCaja = y + 8;

      if (cliente) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
        doc.text("CLIENTE", margen + 8, yCaja);
        yCaja += 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
        doc.text(cliente.nombre || "", margen + 8, yCaja);
        yCaja += 10;

        if (cliente.telefono) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
          doc.text(cliente.telefono, margen + 8, yCaja);
          yCaja += 10;
        }
      }

      if (vehiculo) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
        doc.text("VEHÍCULO", margen + 8, yCaja);
        yCaja += 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
        doc.text((vehiculo.marca || "") + " " + (vehiculo.modelo || ""), margen + 8, yCaja);
        yCaja += 10;

        if (vehiculo.placa) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
          doc.text("Patente: " + vehiculo.placa, margen + 8, yCaja);
          yCaja += 10;
        }
      }

      y += altoCaja + 10;
    }

    // HEADER ITEMS
    doc.setFillColor(AZUL[0], AZUL[1], AZUL[2]);
    doc.rect(margen, y, anchoUtil, 16, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("DESCRIPCIÓN", margen + 8, y + 11);
    doc.text("IMPORTE", ancho - margen - 8, y + 11, { align: "right" });

    y += 38;

    // ITEMS
    for (const it of items) {
      const nombre = it.descripcion || it.producto?.nombre || it.servicio?.nombre || "";

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);

      const lineas = doc.splitTextToSize(nombre, anchoUtil - 60);
      for (const linea of lineas) {
        doc.text(linea, margen + 8, y);
        y += 11;
      }

      y += 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
      doc.text(it.cantidad + " x $" + Number(it.precio_unitario).toLocaleString("es-AR"), margen + 8, y);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
      doc.text("$" + Number(it.subtotal).toLocaleString("es-AR"), ancho - margen - 8, y, { align: "right" });

      y += 8;

      doc.setDrawColor(230, 235, 240);
      doc.setLineWidth(0.3);
      doc.line(margen + 8, y, ancho - margen - 8, y);
      y += 18;
    }

    // TOTALES
    y += 4;

    if (Number(descuento) > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
      doc.text("Subtotal:", margen + 8, y);
      doc.text("$" + Number(subtotal).toLocaleString("es-AR"), ancho - margen - 8, y, { align: "right" });
      y += 12;

      doc.setTextColor(NARANJA[0], NARANJA[1], NARANJA[2]);
      doc.text("Descuento:", margen + 8, y);
      doc.text("-$" + Number(descuento).toLocaleString("es-AR"), ancho - margen - 8, y, { align: "right" });
      y += 16;
    }

    doc.setFillColor(AZUL[0], AZUL[1], AZUL[2]);
    doc.roundedRect(margen, y - 10, anchoUtil, 28, 4, 4, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("TOTAL", margen + 12, y + 8);

    doc.setFontSize(14);
    doc.text("$" + Number(total).toLocaleString("es-AR"), ancho - margen - 12, y + 8, { align: "right" });

    y += 30;

    // PAGO
    if (pagado !== undefined) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);

      doc.text("Pagado:", margen + 8, y);
      doc.setTextColor(22, 163, 74);
      doc.setFont("helvetica", "bold");
      doc.text("$" + Number(pagado).toLocaleString("es-AR"), ancho - margen - 8, y, { align: "right" });
      y += 12;

      if (Number(saldo) > 0) {
        doc.setTextColor(239, 68, 68);
        doc.text("SALDO PENDIENTE:", margen + 8, y);
        doc.text("$" + Number(saldo).toLocaleString("es-AR"), ancho - margen - 8, y, { align: "right" });
        y += 12;
      }

      if (medio) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
        const medioTexto = medio.charAt(0).toUpperCase() + medio.slice(1);
        doc.text("Medio de pago: " + medioTexto, margen + 8, y);
        y += 12;
      }

      y += 4;
    }

    // FIRMA DEL CLIENTE
    if (firmaBase64 && firmaBase64.length > 100) {
      doc.setDrawColor(200, 210, 220);
      doc.setLineWidth(0.5);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(margen, y + 8, ancho - margen, y + 8);
      doc.setLineDashPattern([], 0);

      y += 20;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
      doc.text("FIRMA DEL CLIENTE", margen + 8, y);
      y += 10;

      try {
        const imgWidth = anchoUtil - 20;
        const imgHeight = imgWidth * 0.35;

        doc.addImage(firmaBase64, "PNG", margen + 10, y, imgWidth, imgHeight);
        y += imgHeight + 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
        doc.text("Firmado digitalmente por el cliente", margen + 10, y);
        y += 12;
      } catch (e) {
        console.error("Error agregando firma:", e);
        doc.setFontSize(7);
        doc.setTextColor(239, 68, 68);
        doc.text("Firma no disponible", margen + 8, y);
        y += 14;
      }
    }

    // PIE DE PÁGINA
    doc.setFillColor(NARANJA[0], NARANJA[1], NARANJA[2]);
    doc.rect(margen, y, anchoUtil, 2, "F");
    y += 14;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
    doc.text("¡Gracias por su visita!", ancho / 2, y, { align: "center" });
    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
    doc.text("Próximo cambio de aceite:", ancho / 2, y, { align: "center" });
    y += 9;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(AZUL_CLARO[0], AZUL_CLARO[1], AZUL_CLARO[2]);
    doc.text("6 MESES O 10.000 KM", ancho / 2, y, { align: "center" });
    y += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
    doc.text("www.arnlubricentro.com.ar", ancho / 2, y, { align: "center" });

    return { doc, alto: y + 20 };
  }

  function imprimir() {
    const { doc } = generarPDF();
    doc.autoPrint();
    const url = doc.output("bloburl");
    window.open(url, "_blank");
  }

  function descargarPDF() {
    const { doc } = generarPDF();
    doc.save(`ARN-${tipo}-${numero}-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  function enviarWhatsApp() {
    const tel = (cliente?.telefono || "").replace(/[^0-9]/g, "");

    const itemsTexto = items.map((it: any) => {
      const nombre = it.descripcion || it.producto?.nombre || it.servicio?.nombre || "";
      const subtotalItem = Number(it.subtotal).toLocaleString("es-AR");
      return `• ${nombre} x${it.cantidad} - $${subtotalItem}`;
    }).join("\n");

    const saludo = cliente?.nombre ? `Hola ${cliente.nombre}!` : "Hola!";

    let mensaje = `${saludo} 👋\n\n`;
    mensaje += `Te paso el detalle de tu ${tipo.toLowerCase()} en *ARN Lubricentro*:\n\n`;
    mensaje += `📋 *${tipo} #${numero}*\n`;
    mensaje += `📅 ${new Date(fecha).toLocaleDateString("es-AR")}\n`;
    if (vehiculo) {
      mensaje += `🚗 ${vehiculo.marca} ${vehiculo.modelo}`;
      if (vehiculo.placa) mensaje += ` (${vehiculo.placa})`;
      mensaje += `\n`;
    }
    mensaje += `\n${itemsTexto}\n\n`;
    mensaje += `💵 *TOTAL: $${Number(total).toLocaleString("es-AR")}*\n`;
    if (Number(saldo) > 0) {
      mensaje += `⚠️ Saldo pendiente: $${Number(saldo).toLocaleString("es-AR")}\n`;
    } else if (pagado !== undefined) {
      mensaje += `✅ *PAGADO*\n`;
    }
    mensaje += `\n¡Gracias por confiar en nosotros! 🔧\n`;
    mensaje += `ARN Lubricentro y Repuestos`;

    const url = `https://wa.me/${tel.startsWith("54") ? tel : "54" + tel}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  }

  return (
    <>
      {/* PREVIEW EN PANTALLA */}
      <div style={{
        background: "white",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        maxWidth: 320,
        margin: "0 auto",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
      }}>
        <div style={{
          background: "linear-gradient(135deg, #0f172a, #1e293b)",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16
          }}>
            🛢️
          </div>
          <div>
            <div style={{ fontWeight: 900, color: "#fff", fontSize: 14, letterSpacing: 0.5 }}>ARN</div>
            <div style={{ fontSize: 8, color: "#94a3b8", letterSpacing: 1, fontWeight: 600 }}>LUBRICENTRO Y REPUESTOS</div>
          </div>
        </div>

        <div style={{
          background: "#f1f5f9",
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e2e8f0"
        }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: "#0f172a", textTransform: "uppercase" }}>
            {tipo} #{numero}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            {new Date(fecha).toLocaleDateString("es-AR")} {new Date(fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>

        {(cliente || vehiculo) && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
            {cliente && (
              <div style={{ marginBottom: vehiculo ? 8 : 0 }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.5, marginBottom: 2 }}>CLIENTE</div>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#0f172a" }}>{cliente.nombre}</div>
                {cliente.telefono && (
                  <div style={{ fontSize: 11, color: "#64748b" }}>{cliente.telefono}</div>
                )}
              </div>
            )}
            {vehiculo && (
              <div>
                <div style={{ fontSize: 8, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.5, marginBottom: 2 }}>VEHÍCULO</div>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#0f172a" }}>
                  {vehiculo.marca} {vehiculo.modelo}
                </div>
                {vehiculo.placa && (
                  <div style={{ fontSize: 11, color: "#64748b" }}>Patente: {vehiculo.placa}</div>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{
          background: "#0f172a",
          padding: "6px 16px",
          display: "flex",
          justifyContent: "space-between",
          color: "#fff",
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: 0.5
        }}>
          <span>DESCRIPCIÓN</span>
          <span>IMPORTE</span>
        </div>

        <div style={{ padding: "20px 0" }}>
          {items.map((it: any, i: number) => (
            <div key={i} style={{ padding: "14px 16px", borderBottom: i < items.length - 1 ? "1px solid #f1f5f9" : "none" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>
                {it.descripcion || it.producto?.nombre || it.servicio?.nombre}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: "#94a3b8" }}>
                  {it.cantidad} x ${Number(it.precio_unitario).toLocaleString("es-AR")}
                </span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>
                  ${Number(it.subtotal).toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "12px 16px", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
          {Number(descuento) > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                <span>Subtotal:</span>
                <span>${Number(subtotal).toLocaleString("es-AR")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#f97316", marginBottom: 8, fontWeight: 600 }}>
                <span>Descuento:</span>
                <span>-${Number(descuento).toLocaleString("es-AR")}</span>
              </div>
            </>
          )}

          <div style={{
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            borderRadius: 8,
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>TOTAL</span>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 900 }}>
              ${Number(total).toLocaleString("es-AR")}
            </span>
          </div>
        </div>

        {pagado !== undefined && (
          <div style={{ padding: "10px 16px", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
              <span style={{ color: "#64748b" }}>Pagado:</span>
              <span style={{ color: "#16a34a", fontWeight: 700 }}>${Number(pagado).toLocaleString("es-AR")}</span>
            </div>
            {Number(saldo) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: "#ef4444", fontWeight: 700 }}>Saldo pendiente:</span>
                <span style={{ color: "#ef4444", fontWeight: 700 }}>${Number(saldo).toLocaleString("es-AR")}</span>
              </div>
            )}
            {medio && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: "#64748b" }}>Medio de pago:</span>
                <span style={{ color: "#0f172a", fontWeight: 600, textTransform: "capitalize" }}>{medio}</span>
              </div>
            )}
          </div>
        )}

        {firmaBase64 && (
          <div style={{ padding: "12px 16px", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.5, marginBottom: 6 }}>
              FIRMA DEL CLIENTE
            </div>
            <img
              src={firmaBase64}
              alt="Firma"
              style={{ width: "100%", background: "white", border: "1px solid #e2e8f0", borderRadius: 4 }}
            />
          </div>
        )}

        <div style={{ borderTop: "3px solid #f97316", padding: "12px 16px", textAlign: "center", background: "white" }}>
          <div style={{ fontWeight: 800, fontSize: 11, color: "#0f172a", marginBottom: 6 }}>
            ¡Gracias por su visita!
          </div>
          <div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 4 }}>
            Próximo cambio de aceite:
          </div>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#0ea5e9", letterSpacing: 0.5 }}>
            6 MESES O 10.000 KM
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", justifyContent: "center", maxWidth: 320, margin: "16px auto 0" }}>
        <button onClick={imprimir} className="btn btn-primary" style={{ flex: 1, minWidth: 90, fontSize: 13 }}>
          🖨️ Imprimir
        </button>
        <button onClick={descargarPDF} className="btn btn-secondary" style={{ flex: 1, minWidth: 90, fontSize: 13 }}>
          📥 PDF
        </button>
        {cliente?.telefono && (
          <button
            onClick={enviarWhatsApp}
            className="btn"
            style={{
              flex: 1,
              minWidth: 90,
              fontSize: 13,
              background: "linear-gradient(135deg, #25d366, #128c7e)",
              color: "white",
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(37,211,102,0.3)"
            }}
          >
            📱 WA
          </button>
        )}
      </div>
    </>
  );
}