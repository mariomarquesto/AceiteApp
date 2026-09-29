import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok, ApiError } from "@/lib/errors";
import { z } from "zod";

const schema = z.object({
  km_ingreso: z.number().int().min(0).default(0)
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const { data: ordenId, error } = await supabase.rpc("convertir_presupuesto_a_orden", {
      p_presupuesto_id: params.id,
      p_km_ingreso: data.km_ingreso
    });

    if (error) throw error;

    const { data: orden } = await supabase
      .from("ordenes")
      .select("*")
      .eq("id", ordenId)
      .single();

    return ok({ orden_id: ordenId, orden }, 201);
  } catch (e: any) {
    // Manejar errores específicos de la función SQL
    if (e?.message?.includes("ya fue convertido")) {
      return handleApiError(new ApiError(400, "El presupuesto ya fue convertido"));
    }
    if (e?.message?.includes("necesita un vehículo")) {
      return handleApiError(new ApiError(400, "El presupuesto necesita un vehículo asignado"));
    }
    return handleApiError(e);
  }
}