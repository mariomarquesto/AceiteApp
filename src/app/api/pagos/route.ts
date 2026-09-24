import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { registrarPagoSchema } from "@/utils/validators";

export async function GET(req: NextRequest) {
  try {
    const cliente_id = req.nextUrl.searchParams.get("cliente_id");
    const desde = req.nextUrl.searchParams.get("desde");
    const hasta = req.nextUrl.searchParams.get("hasta");

    let query = supabase
      .from("pagos")
      .select("*, cliente:clientes(id, nombre)");

    if (cliente_id) query = query.eq("cliente_id", cliente_id);
    if (desde) query = query.gte("fecha", desde);
    if (hasta) query = query.lte("fecha", hasta);

    const { data, error } = await query.order("fecha", { ascending: false }).limit(200);
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registrarPagoSchema.parse(body);

    const { data: pagoId, error } = await supabase.rpc("registrar_pago", {
      p_cliente_id: data.cliente_id,
      p_monto: data.monto,
      p_medio: data.medio,
      p_tipo: data.tipo,
      p_venta_id: data.venta_id || null,
      p_orden_id: data.orden_id || null,
      p_notas: data.notas || null,
      p_referencia_externa: data.referencia_externa || null
    });

    if (error) throw error;

    const { data: pago } = await supabase
      .from("pagos")
      .select("*")
      .eq("id", pagoId)
      .single();

    return ok(pago, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
