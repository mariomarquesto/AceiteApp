const fs = require("fs");

function w(f, c) { fs.writeFileSync(f, c, "utf8"); console.log("OK:", f); }

w("src/app/components/BusquedaGlobal.tsx", `"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BusquedaGlobal() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<any>({ clientes: [], productos: [], vehiculos: [] });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (q.length < 2) {
      setResultados({ clientes: [], productos: [], vehiculos: [] });
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      fetch("/api/buscar?q=" + encodeURIComponent(q))
        .then(r => r.json())
        .then(j => {
          setResultados(j.data || { clientes: [], productos: [], vehiculos: [] });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [q]);

  const hayResultados =
    resultados.clientes.length > 0 ||
    resultados.productos.length > 0 ||
    resultados.vehiculos.length > 0;

  function cerrar() {
    setQ("");
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, maxWidth: 400, marginLeft: 12 }}>
      <input
        type="text"
        placeholder="🔍 Buscar clientes, productos, vehículos..."
        value={q}
        onChange={e => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        style={{
          width: "100%",
          padding: "9px 14px",
          borderRadius: 10,
          border: "1px solid rgba(148,163,184,0.3)",
          background: "rgba(15,23,42,0.5)",
          color: "#fff",
          fontSize: 13,
          outline: "none"
        }}
      />

      {open && q.length >= 2 && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          left: 0,
          right: 0,
          background: "white",
          borderRadius: 12,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          overflow: "hidden",
          zIndex: 100,
          maxHeight: 420,
          overflowY: "auto"
        }}>
          {loading ? (
            <div style={{ padding: 16, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
              Buscando...
            </div>
          ) : !hayResultados ? (
            <div style={{ padding: 16, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
              Sin resultados para "{q}"
            </div>
          ) : (
            <>
              {resultados.clientes.length > 0 && (
                <div>
                  <div style={{ padding: "8px 14px", fontSize: 11, fontWeight: 700, color: "#64748b", background: "#f8fafc", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    👥 Clientes
                  </div>
                  {resultados.clientes.map((c: any) => (
                    <Link key={c.id} href={"/clientes/" + c.id} onClick={cerrar} style={{ display: "block", padding: "10px 14px", borderBottom: "1px solid #f1f5f9", textDecoration: "none", color: "#0f172a" }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{c.nombre}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{c.telefono || "sin teléfono"}</div>
                    </Link>
                  ))}
                </div>
              )}

              {resultados.productos.length > 0 && (
                <div>
                  <div style={{ padding: "8px 14px", fontSize: 11, fontWeight: 700, color: "#64748b", background: "#f8fafc", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    📦 Productos
                  </div>
                  {resultados.productos.map((p: any) => (
                    <Link key={p.id} href={"/productos/" + p.id} onClick={cerrar} style={{ display: "block", padding: "10px 14px", borderBottom: "1px solid #f1f5f9", textDecoration: "none", color: "#0f172a" }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.nombre}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        {p.codigo} · Stock: {p.stock} · {"$" + Number(p.precio_venta).toLocaleString("es-AR")}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {resultados.vehiculos.length > 0 && (
                <div>
                  <div style={{ padding: "8px 14px", fontSize: 11, fontWeight: 700, color: "#64748b", background: "#f8fafc", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    🚗 Vehículos
                  </div>
                  {resultados.vehiculos.map((v: any) => (
                    <Link key={v.id} href={"/vehiculos/" + v.id} onClick={cerrar} style={{ display: "block", padding: "10px 14px", borderBottom: "1px solid #f1f5f9", textDecoration: "none", color: "#0f172a" }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{v.marca} {v.modelo}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        {v.placa} · {v.cliente?.nombre || "s/cliente"}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
`);
console.log("OK: BusquedaGlobal.tsx");
