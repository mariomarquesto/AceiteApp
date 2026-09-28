const fs = require("fs");
const path = require("path");

function w(f, c) {
  const d = path.dirname(f);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(f, c, "utf8");
  console.log("OK:", f);
}

w("src/app/components/Ticket.tsx", `"use client";

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
  medio
}: any) {
  function imprimir() {
    const contenido = document.getElementById("ticket-print");
    if (!contenido) return;
    
    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) return;
    
    win.document.write(\`
      <html>
      <head>
        <title>Ticket \${numero}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; width: 80mm; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-top: 1px dashed #000; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; margin: 2px 0; }
          .big { font-size: 16px; font-weight: bold; }
          h1 { font-size: 16px; margin-bottom: 4px; }
          h2 { font-size: 11px; font-weight: normal; color: #333; margin-bottom: 8px; }
          .item { margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="center">
          <h1>ARN LUBRICENTRO Y REPUESTOS</h1>
          <h2>Sistema de gestión automotor</h2>
        </div>
        <div class="line"></div>
        <div class="row">
          <span>Fecha:</span>
          <span>\${new Date(fecha).toLocaleString("es-AR")}</span>
        </div>
        <div class="row">
          <span>\${tipo} #:</span>
          <span class="bold">\${numero}</span>
        </div>
        \${cliente ? \`
          <div class="line"></div>
          <div class="row"><span>Cliente:</span><span>\${cliente.nombre}</span></div>
          \${cliente.telefono ? \`<div class="row"><span>Tel:</span><span>\${cliente.telefono}</span></div>\` : ""}
        \` : ""}
        \${vehiculo ? \`
          <div class="row"><span>Vehículo:</span><span>\${vehiculo.marca} \${vehiculo.modelo}</span></div>
          \${vehiculo.placa ? \`<div class="row"><span>Patente:</span><span>\${vehiculo.placa}</span></div>\` : ""}
        \` : ""}
        <div class="line"></div>
        \${items.map((it: any) => \`
          <div class="item">
            <div>\${it.descripcion || it.producto?.nombre || it.servicio?.nombre}</div>
            <div class="row">
              <span>\${it.cantidad} x \$\${Number(it.precio_unitario).toLocaleString("es-AR")}</span>
              <span class="bold">\$\${Number(it.subtotal).toLocaleString("es-AR")}</span>
            </div>
          </div>
        \`).join("")}
        <div class="line"></div>
        <div class="row"><span>Subtotal:</span><span>\$\${Number(subtotal).toLocaleString("es-AR")}</span></div>
        \${Number(descuento) > 0 ? \`<div class="row"><span>Descuento:</span><span>-\$\${Number(descuento).toLocaleString("es-AR")}</span></div>\` : ""}
        <div class="row big"><span>TOTAL:</span><span>\$\${Number(total).toLocaleString("es-AR")}</span></div>
        \${pagado !== undefined ? \`
          <div class="line"></div>
          <div class="row"><span>Pagado:</span><span>\$\${Number(pagado).toLocaleString("es-AR")}</span></div>
          \${Number(saldo) > 0 ? \`<div class="row bold"><span>SALDO:</span><span>\$\${Number(saldo).toLocaleString("es-AR")}</span></div>\` : ""}
          \${medio ? \`<div class="row"><span>Medio:</span><span>\${medio}</span></div>\` : ""}
        \` : ""}
        <div class="line"></div>
        <div class="center" style="margin-top: 12px; font-size: 10px;">
          ¡Gracias por su visita!<br>
          Próximo cambio de aceite en 6 meses o 10.000 km
        </div>
      </body>
      </html>
    \`);
    win.document.close();
    setTimeout(() => { win.print(); }, 250);
  }

  return (
    <>
      <div id="ticket-print" style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        fontFamily: "'Courier New', monospace",
        fontSize: 13,
        border: "1px solid #e2e8f0",
        maxWidth: 320
      }}>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <div style={{ fontWeight: 900, fontSize: 15 }}>ARN LUBRICENTRO</div>
          <div style={{ fontSize: 10, color: "#64748b" }}>Y REPUESTOS</div>
        </div>

        <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
          <span>Fecha:</span>
          <span>{new Date(fecha).toLocaleString("es-AR")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
          <span>{tipo} #:</span>
          <span style={{ fontWeight: 700 }}>{numero}</span>
        </div>

        {cliente && (
          <>
            <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span>Cliente:</span>
              <span>{cliente.nombre}</span>
            </div>
            {cliente.telefono && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span>Tel:</span>
                <span>{cliente.telefono}</span>
              </div>
            )}
          </>
        )}

        {vehiculo && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span>Vehículo:</span>
              <span>{vehiculo.marca} {vehiculo.modelo}</span>
            </div>
            {vehiculo.placa && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span>Patente:</span>
                <span>{vehiculo.placa}</span>
              </div>
            )}
          </>
        )}

        <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

        {items.map((it: any, i: number) => (
          <div key={i} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 11 }}>{it.descripcion || it.producto?.nombre || it.servicio?.nombre}</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span>{it.cantidad} x ${Number(it.precio_unitario).toLocaleString("es-AR")}</span>
              <span style={{ fontWeight: 700 }}>${Number(it.subtotal).toLocaleString("es-AR")}</span>
            </div>
          </div>
        ))}

        <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
          <span>Subtotal:</span>
          <span>${Number(subtotal).toLocaleString("es-AR")}</span>
        </div>

        {Number(descuento) > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
            <span>Descuento:</span>
            <span>-${Number(descuento).toLocaleString("es-AR")}</span>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 900, marginTop: 6 }}>
          <span>TOTAL:</span>
          <span>${Number(total).toLocaleString("es-AR")}</span>
        </div>

        {pagado !== undefined && (
          <>
            <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span>Pagado:</span>
              <span>${Number(pagado).toLocaleString("es-AR")}</span>
            </div>
            {Number(saldo) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700 }}>
                <span>SALDO:</span>
                <span>${Number(saldo).toLocaleString("es-AR")}</span>
              </div>
            )}
            {medio && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span>Medio:</span>
                <span>{medio}</span>
              </div>
            )}
          </>
        )}

        <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

        <div style={{ textAlign: "center", fontSize: 10, color: "#64748b", marginTop: 8 }}>
          ¡Gracias por su visita!<br />
          Próximo cambio: 6 meses o 10.000 km
        </div>
      </div>

      <button onClick={imprimir} className="btn btn-primary" style={{ marginTop: 12, width: "100%" }}>
        🖨️ Imprimir ticket
      </button>
    </>
  );
}
`);
console.log("OK: Ticket.tsx");
