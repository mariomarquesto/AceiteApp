import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { crearVentaSchema } from "@/utils/validators";

export async function GET(req: NextRequest) {
  try {
    const desde = req.nextUrl.searchParams.get("desde");
    const hasta = req.nextUrl.searchParams.get("hasta");
    const cliente_id = req.nextUrl.searchParams.get("cliente_id");

    let query = supabase
      .from("ventas")
      .select("*, cliente:clientes(id, nombre), items:venta_items(*)");

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
    const data = crearVentaSchema.parse(body);

    const { data: ventaId, error } = await supabase.rpc("crear_venta", {
      p_cliente_id: data.cliente_id || null,
      p_items: data.items,
      p_descuento: data.descuento,
      p_notas: data.notas || null
    });

    if (error) throw error;

    const { data: venta } = await supabase
      .from("ventas")
      .select("*, items:venta_items(*)")
      .eq("id", ventaId)
      .single();

    return ok(venta, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
