import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { z } from "zod";

const turnoSchema = z.object({
  cliente_id: z.string().uuid(),
  vehiculo_id: z.string().uuid().optional().nullable(),
  fecha: z.string(),
  hora: z.string(),
  duracion_minutos: z.number().int().min(15).default(60),
  servicio: z.string().optional().nullable(),
  notas: z.string().optional().nullable()
});

export async function GET(req: NextRequest) {
  try {
    const desde = req.nextUrl.searchParams.get("desde");
    const hasta = req.nextUrl.searchParams.get("hasta");
    const estado = req.nextUrl.searchParams.get("estado");

    let query = supabase
      .from("turnos")
      .select("*, cliente:clientes(id, nombre, telefono), vehiculo:vehiculos(marca, modelo, placa)");

    if (desde) query = query.gte("fecha", desde);
    if (hasta) query = query.lte("fecha", hasta);
    if (estado) query = query.eq("estado", estado);

    const { data, error } = await query
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = turnoSchema.parse(body);

    const { data: turno, error } = await supabase
      .from("turnos")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return ok(turno, 201);
  } catch (e) {
    return handleApiError(e);
  }
}