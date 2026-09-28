import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { z } from "zod";

const itemSchema = z.object({
  producto_id: z.string().uuid().optional().nullable(),
  servicio_id: z.string().uuid().optional().nullable(),
  descripcion: z.string().optional().nullable(),
  cantidad: z.number().positive(),
  precio_unitario: z.number().min(0)
}).refine(i => i.producto_id || i.servicio_id, {
  message: "Debe tener producto o servicio"
});

const crearOrdenSchema = z.object({
  cliente_id: z.string().uuid(),
  vehiculo_id: z.string().uuid(),
  km_ingreso: z.number().int().min(0),
  items: z.array(itemSchema).min(1),
  descuento: z.number().min(0).default(0),
  notas: z.string().optional().nullable(),
  proximo_cambio_km: z.number().int().optional().nullable(),
  proximo_cambio_fecha: z.string().optional().nullable()
});

export async function GET(req: NextRequest) {
  try {
    const estado = req.nextUrl.searchParams.get("estado");
    const cliente_id = req.nextUrl.searchParams.get("cliente_id");

    console.log("[GET /api/ordenes] Params:", { estado, cliente_id });

    const { data, error } = await supabase
      .from("ordenes")
      .select("*")
      .order("fecha", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[GET /api/ordenes] ERROR SIMPLE:", JSON.stringify(error, null, 2));
      throw error;
    }

    console.log("[GET /api/ordenes] OK:", data?.length || 0, "registros");
    return ok(data);
  } catch (e: any) {
    console.error("[GET /api/ordenes] CATCH:", e?.message);
    console.error("[GET /api/ordenes] STACK:", e?.stack);
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = crearOrdenSchema.parse(body);

    const { data: ordenId, error } = await supabase.rpc("crear_orden", {
      p_cliente_id: data.cliente_id,
      p_vehiculo_id: data.vehiculo_id,
      p_km_ingreso: data.km_ingreso,
      p_items: data.items,
      p_descuento: data.descuento,
      p_notas: data.notas || null,
      p_proximo_cambio_km: data.proximo_cambio_km || null,
      p_proximo_cambio_fecha: data.proximo_cambio_fecha || null
    });

    if (error) throw error;

    const { data: orden } = await supabase
      .from("ordenes")
      .select("*, items:orden_items(*)")
      .eq("id", ordenId)
      .single();

    return ok(orden, 201);
  } catch (e) {
    return handleApiError(e);
  }
}