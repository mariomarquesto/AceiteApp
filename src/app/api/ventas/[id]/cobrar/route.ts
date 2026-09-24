import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok, ApiError } from "@/lib/errors";
import { z } from "zod";

const schema = z.object({
  monto: z.number().positive(),
  medio: z.enum(["efectivo", "transferencia", "otro"]),
  notas: z.string().optional().nullable()
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const { data: venta, error: errV } = await supabase
      .from("ventas")
      .select("cliente_id, saldo")
      .eq("id", params.id)
      .single();

    if (errV) throw errV;
    if (!venta) throw new ApiError(404, "Venta no encontrada");
    if (!venta.cliente_id) throw new ApiError(400, "La venta no tiene cliente asignado");

    if (data.monto > venta.saldo) {
      throw new ApiError(400, "El monto excede el saldo pendiente: " + venta.saldo);
    }

    const { data: pagoId, error } = await supabase.rpc("registrar_pago", {
      p_cliente_id: venta.cliente_id,
      p_monto: data.monto,
      p_medio: data.medio,
      p_tipo: "cobro",
      p_venta_id: params.id,
      p_orden_id: null,
      p_notas: data.notas || null,
      p_referencia_externa: null
    });

    if (error) throw error;

    const { data: ventaActualizada } = await supabase
      .from("ventas")
      .select("*")
      .eq("id", params.id)
      .single();

    return ok({ pago_id: pagoId, venta: ventaActualizada }, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
