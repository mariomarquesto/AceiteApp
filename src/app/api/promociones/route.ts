import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { z } from "zod";

const promoSchema = z.object({
  titulo: z.string().min(1).max(200),
  descripcion: z.string().optional().nullable(),
  descuento_porcentaje: z.number().min(0).max(100).optional().nullable(),
  descuento_monto: z.number().min(0).optional().nullable(),
  aplica_a: z.enum(["servicio", "producto", "combo", "todo"]),
  producto_id: z.string().uuid().optional().nullable(),
  servicio_id: z.string().uuid().optional().nullable(),
  requiere_producto_id: z.string().uuid().optional().nullable(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  activa: z.boolean().default(true)
});

export async function GET(req: NextRequest) {
  try {
    const soloActivas = req.nextUrl.searchParams.get("activas");
    let query = supabase.from("promociones").select("*");

    if (soloActivas === "true") {
      const hoy = new Date().toISOString().slice(0, 10);
      query = query
        .eq("activa", true)
        .lte("fecha_inicio", hoy)
        .gte("fecha_fin", hoy);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = promoSchema.parse(body);

    const { data: promo, error } = await supabase
      .from("promociones")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return ok(promo, 201);
  } catch (e) {
    return handleApiError(e);
  }
}