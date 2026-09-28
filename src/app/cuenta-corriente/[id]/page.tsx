import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PagoACuentaBoton from "@/app/components/PagoACuentaBoton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getCliente(id: string) {
  const { data } = await supabase.from("clientes").select("*").eq("id", id).single();
  return data;
}

async function getCuenta(clienteId: string) {
  const { data: saldo } = await supabase
    .from("v_saldos_clientes")
    .select("*")
    .eq("cliente_id", clienteId)
    .single();

  const { data: ventas } = await supabase
    .from("ventas")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("fecha", { ascending: false });

  const { data: ordenes } = await supabase
    .from("ordenes")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("fecha", { ascending: false });

  const { data: pagos } = await supabase
    .from("pagos")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("fecha", { ascending: false });

  return { saldo, ventas: ventas || [], ordenes: ordenes || [], pagos: pagos || [] };
}

export default async function CuentaCorrienteCliente({ params }: { params: { id: string } }) {
  const [cliente, cuenta] = await Promise.all([
    getCliente(params.id),
    getCuenta(params.id)
  ]);

  if (!cliente) return <div>Cliente no encontrado</div>;

  const saldoTotal = Number(cuenta.saldo?.saldo || 0);

  const movimientos = [
    ...cuenta.ventas.map((v: any) => ({ tipo: "venta", fecha: v.fecha, numero: v.numero, monto: Number(v.total), estado: v.estado_pago, id: v.id })),
    ...cuenta.ordenes.map((o: any) => ({ tipo: "orden", fecha: o.fecha, numero: o.numero, monto: Number(o.total), estado: o.estado_pago, id: o.id })),
    ...cuenta.pagos.map((p: any) => ({ tipo: "pago", fecha: p.fecha, numero: p.numero, monto: Number(p.monto), estado: p.tipo, id: p.id }))
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Cuenta corriente</h1>
          <div className="page-subtitle">
            {cliente.nombre} · {cliente.telefono || "sin teléfono"}
          </div>
        </div>
        <Link href={"/clientes/" + params.id} className="btn btn-secondary">
          ← Ver cliente
        </Link>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">💰 Saldo total</div>
          <div className="card-value" style={{ color: saldoTotal > 0 ? "#ef4444" : "#16a34a" }}>
            {"$" + saldoTotal.toLocaleString("es-AR")}
          </div>
          <div className="card-subtitle">{saldoTotal > 0 ? "Debe" : "Al día"}</div>
        </div>
        <div className="card">
          <div className="card-title">📋 Total deudas</div>
          <div className="card-value">{"$" + Number(cuenta.saldo?.total_deudas || 0).toLocaleString("es-AR")}</div>
        </div>
        <div className="card">
          <div className="card-title">💵 Total abonos</div>
          <div className="card-value">{"$" + Number(cuenta.saldo?.total_abonos || 0).toLocaleString("es-AR")}</div>
        </div>
        <div className="card">
          <div className="card-title">📊 Movimientos</div>
          <div className="card-value">{movimientos.length}</div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <PagoACuentaBoton
          clienteId={cliente.id}
          clienteNombre={cliente.nombre}
          saldoActual={saldoTotal}
        />
      </div>

      <div className="form-card">
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Historial de movimientos</h2>

        {movimientos.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
            Sin movimientos aún
          </div>
        ) : (
          <table className="table" style={{ boxShadow: "none" }}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Nº</th>
                <th style={{ textAlign: "right" }}>Debe</th>
                <th style={{ textAlign: "right" }}>Haber</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m: any, i: number) => {
                const esDeuda = m.tipo === "venta" || m.tipo === "orden";
                return (
                  <tr key={i}>
                    <td style={{ fontSize: 13 }}>{new Date(m.fecha).toLocaleDateString("es-AR")}</td>
                    <td>
                      {m.tipo === "venta" && "🛒 Venta"}
                      {m.tipo === "orden" && "🔧 Orden"}
                      {m.tipo === "pago" && "💵 Pago"}
                    </td>
                    <td style={{ fontWeight: 600 }}>#{m.numero}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: esDeuda ? "#0f172a" : "#cbd5e1" }}>
                      {esDeuda ? "$" + m.monto.toLocaleString("es-AR") : "—"}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: !esDeuda ? "#16a34a" : "#cbd5e1" }}>
                      {!esDeuda ? "$" + m.monto.toLocaleString("es-AR") : "—"}
                    </td>
                    <td>
                      <span className="badge" style={{
                        background: m.estado === "pagada" ? "#dcfce7" : m.estado === "pendiente" ? "#fef3c7" : "#e0f2fe",
                        color: m.estado === "pagada" ? "#16a34a" : m.estado === "pendiente" ? "#78350f" : "#0369a1"
                      }}>
                        {m.estado}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}