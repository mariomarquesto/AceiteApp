import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getPortalData(token: string) {
  // Buscar cliente por token
  const { data: cliente, error: errC } = await supabase
    .from("clientes")
    .select("id, nombre, telefono, email")
    .eq("portal_token", token)
    .eq("portal_activo", true)
    .single();

  if (errC || !cliente) return null;

  // Obtener datos en paralelo
  const [vehiculos, ordenes, ventas, saldo, turnos] = await Promise.all([
    supabase
      .from("vehiculos")
      .select("*")
      .eq("cliente_id", cliente.id)
      .eq("activo", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("ordenes")
      .select("*, vehiculo:vehiculos(marca, modelo, placa)")
      .eq("cliente_id", cliente.id)
      .order("fecha", { ascending: false })
      .limit(20),
    supabase
      .from("ventas")
      .select("*")
      .eq("cliente_id", cliente.id)
      .order("fecha", { ascending: false })
      .limit(20),
    supabase
      .from("v_saldos_clientes")
      .select("*")
      .eq("cliente_id", cliente.id)
      .maybeSingle(),
    supabase
      .from("turnos")
      .select("*")
      .eq("cliente_id", cliente.id)
      .gte("fecha", new Date().toISOString().slice(0, 10))
      .order("fecha")
      .limit(5)
  ]);

  return {
    cliente,
    vehiculos: vehiculos.data || [],
    ordenes: ordenes.data || [],
    ventas: ventas.data || [],
    saldo: saldo.data || { saldo: 0, total_deudas: 0, total_abonos: 0 },
    turnos: turnos.data || []
  };
}

export default async function PortalPage({ params }: { params: { token: string } }) {
  const data = await getPortalData(params.token);

  if (!data) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div className="form-card" style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Portal no disponible</h1>
          <p style={{ color: "#64748b", marginBottom: 20 }}>
            El link no es válido o el portal está desactivado.
          </p>
          <Link href="/" className="btn btn-primary">Ir al inicio</Link>
        </div>
      </div>
    );
  }

  const { cliente, vehiculos, ordenes, ventas, saldo, turnos } = data;
  const saldoTotal = Number(saldo.saldo || 0);

  const historial = [
    ...ordenes.map((o: any) => ({
      tipo: "orden",
      fecha: o.fecha,
      numero: o.numero,
      total: Number(o.total),
      estado_pago: o.estado_pago,
      vehiculo: o.vehiculo
    })),
    ...ventas.map((v: any) => ({
      tipo: "venta",
      fecha: v.fecha,
      numero: v.numero,
      total: Number(v.total),
      estado_pago: v.estado_pago,
      vehiculo: null
    }))
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        marginBottom: 24,
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        color: "white",
        padding: 24,
        borderRadius: 14
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 900, color: "white", flexShrink: 0
          }}>
            {cliente.nombre.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, letterSpacing: 1 }}>PORTAL DEL CLIENTE</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{cliente.nombre}</div>
            <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 4 }}>
              {cliente.telefono || "sin teléfono"}
            </div>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">💰 Saldo</div>
          <div className="card-value" style={{ color: saldoTotal > 0 ? "#ef4444" : "#16a34a" }}>
            {"$" + saldoTotal.toLocaleString("es-AR")}
          </div>
          <div className="card-subtitle">{saldoTotal > 0 ? "Pendiente" : "Al día"}</div>
        </div>
        <div className="card">
          <div className="card-title">🚗 Vehículos</div>
          <div className="card-value">{vehiculos.length}</div>
        </div>
        <div className="card">
          <div className="card-title">🔧 Services</div>
          <div className="card-value">{ordenes.length}</div>
        </div>
        <div className="card">
          <div className="card-title">📅 Turnos</div>
          <div className="card-value">{turnos.length}</div>
        </div>
      </div>

      {/* Próximos turnos */}
      {turnos.length > 0 && (
        <div className="form-card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📅 Próximos turnos</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {turnos.map((t: any) => (
              <div key={t.id} style={{
                padding: 14, background: "#f0f9ff", borderRadius: 10, borderLeft: "3px solid #0ea5e9"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, textTransform: "capitalize" }}>
                      {new Date(t.fecha + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>
                      ⏰ {t.hora.slice(0, 5)} · {t.servicio || "Turno"}
                    </div>
                  </div>
                  <span className="badge" style={{
                    background: t.estado === "confirmado" ? "#dcfce7" : "#fef3c7",
                    color: t.estado === "confirmado" ? "#16a34a" : "#78350f"
                  }}>
                    {t.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehículos */}
      {vehiculos.length > 0 && (
        <div className="form-card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🚗 Mis vehículos</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {vehiculos.map((v: any) => {
              const proximoKm = Number(v.proximo_cambio_km || 0);
              const kmActual = Number(v.km_actual || 0);
              const faltanKm = proximoKm - kmActual;
              const proximaFecha = v.proximo_cambio_fecha ? new Date(v.proximo_cambio_fecha) : null;
              const diasRestantes = proximaFecha ? Math.ceil((proximaFecha.getTime() - Date.now()) / 86400000) : null;

              return (
                <div key={v.id} style={{
                  padding: 14, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0"
                }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                    {v.marca} {v.modelo}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
                    {v.placa && <>{v.placa} · </>}
                    {kmActual.toLocaleString("es-AR")} km
                  </div>

                  {proximoKm > 0 && (
                    <div style={{ fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "#94a3b8" }}>Próximo cambio:</span>{" "}
                      <strong style={{ color: faltanKm < 1000 ? "#ef4444" : "#0f172a" }}>
                        {faltanKm > 0 ? `faltan ${faltanKm.toLocaleString("es-AR")} km` : "¡ya toca!"}
                      </strong>
                    </div>
                  )}

                  {proximaFecha && (
                    <div style={{ fontSize: 12 }}>
                      <span style={{ color: "#94a3b8" }}>O antes del:</span>{" "}
                      <strong style={{ color: diasRestantes && diasRestantes < 30 ? "#ef4444" : "#0f172a" }}>
                        {proximaFecha.toLocaleDateString("es-AR")}
                      </strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Historial */}
      <div className="form-card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📋 Historial</h2>

        {historial.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
            Sin movimientos registrados aún
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {historial.map((item: any, i: number) => (
              <div key={i} style={{
                padding: 14, background: "#f8fafc", borderRadius: 10, borderLeft: "3px solid #0ea5e9"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {item.tipo === "orden" ? "🔧 Orden" : "🛒 Venta"} #{item.numero}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {new Date(item.fecha).toLocaleDateString("es-AR")}
                      {item.vehiculo && ` · ${item.vehiculo.marca} ${item.vehiculo.modelo}`}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                      {"$" + item.total.toLocaleString("es-AR")}
                    </div>
                    <span className="badge" style={{
                      background: item.estado_pago === "pagada" ? "#dcfce7" : "#fef3c7",
                      color: item.estado_pago === "pagada" ? "#16a34a" : "#78350f",
                      fontSize: 10, marginTop: 4
                    }}>
                      {item.estado_pago === "pagada" ? "✓ Pagada" : "Pendiente"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA WhatsApp */}
      <div className="form-card" style={{
        textAlign: "center",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        color: "white",
        border: "none"
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
          ¿Necesitás agendar un turno?
        </div>
        <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 16 }}>
          Escribinos por WhatsApp y te confirmamos
        </div>
        <a
          href="https://wa.me/5491133334444?text=Hola!%20Quiero%20agendar%20un%20turno"
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{
            background: "linear-gradient(135deg, #25d366, #128c7e)",
            color: "white",
            fontWeight: 700,
            display: "inline-flex"
          }}
        >
          📱 WhatsApp
        </a>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "24px 0", fontSize: 12, color: "#94a3b8" }}>
        <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
          ARN Lubricentro y Repuestos
        </div>
        <div>Portal del cliente · Actualizado en tiempo real</div>
      </div>
    </div>
  );
}