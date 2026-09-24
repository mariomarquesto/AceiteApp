import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { z } from "zod";

const schema = z.object({
  tipo: z.enum(["entrada", "salida", "ajuste"]),
  cantidad: z.number().int().positive(),
  motivo: z.string().optional()
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("movimientos_stock")
      .select("*")
      .eq("producto_id", params.id)
      .order("fecha", { ascending: false });

    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const { data: mov, error } = await supabase.rpc("registrar_movimiento_stock", {
      p_producto_id: params.id,
      p_tipo: data.tipo,
      p_cantidad: data.cantidad,
      p_motivo: data.motivo || null,
      p_referencia_id: null,
      p_referencia_tipo: "manual"
    });

    if (error) throw error;
    return ok({ movimiento_id: mov }, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
