import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const desde = req.nextUrl.searchParams.get("desde") || new Date().toISOString().slice(0, 10);
    const hasta = req.nextUrl.searchParams.get("hasta") || new Date().toISOString().slice(0, 10);

    const { data: ventas, error } = await supabase
      .from("ventas")
      .select("id, total, fecha, estado_pago, items:venta_items(cantidad, producto:productos(nombre))")
      .gte("fecha", desde)
      .lte("fecha", hasta + "T23:59:59");

    if (error) throw error;

    const { data: ordenes } = await supabase
      .from("ordenes")
      .select("id, total, fecha, estado_pago, items:orden_items(cantidad, producto:productos(nombre), servicio:servicios(nombre))")
      .gte("fecha", desde)
      .lte("fecha", hasta + "T23:59:59");

    const totalVentas = (ventas || []).reduce((s, v) => s + Number(v.total), 0);
    const totalOrdenes = (ordenes || []).reduce((s, o) => s + Number(o.total), 0);

    return ok({
      rango: { desde, hasta },
      total_ventas_directas: totalVentas,
      total_ordenes: totalOrdenes,
      total_facturado: totalVentas + totalOrdenes,
      cantidad_ventas: (ventas || []).length,
      cantidad_ordenes: (ordenes || []).length,
      ventas: ventas || [],
      ordenes: ordenes || []
    });
  } catch (e) {
    return handleApiError(e);
  }
}
