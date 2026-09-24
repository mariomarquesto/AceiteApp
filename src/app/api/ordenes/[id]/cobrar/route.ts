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

    const { data: orden, error: errO } = await supabase
      .from("ordenes")
      .select("cliente_id, saldo")
      .eq("id", params.id)
      .single();

    if (errO) throw errO;
    if (!orden) throw new ApiError(404, "Orden no encontrada");

    if (data.monto > orden.saldo) {
      throw new ApiError(400, "El monto excede el saldo pendiente: " + orden.saldo);
    }

    const { data: pagoId, error } = await supabase.rpc("registrar_pago", {
      p_cliente_id: orden.cliente_id,
      p_monto: data.monto,
      p_medio: data.medio,
      p_tipo: "cobro",
      p_venta_id: null,
      p_orden_id: params.id,
      p_notas: data.notas || null,
      p_referencia_externa: null
    });

    if (error) throw error;

    const { data: ordenActualizada } = await supabase
      .from("ordenes")
      .select("*")
      .eq("id", params.id)
      .single();

    return ok({ pago_id: pagoId, orden: ordenActualizada }, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
