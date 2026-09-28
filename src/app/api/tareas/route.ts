import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const estado = req.nextUrl.searchParams.get("estado") || "pendiente";
    const desde = req.nextUrl.searchParams.get("desde");
    const hasta = req.nextUrl.searchParams.get("hasta");
    const cliente_id = req.nextUrl.searchParams.get("cliente_id");

    let query = supabase
      .from("tareas")
      .select("*, cliente:clientes(id, nombre, telefono), vehiculo:vehiculos(*)");

    if (estado && estado !== "todas") query = query.eq("estado", estado);
    if (desde) query = query.gte("fecha_vencimiento", desde);
    if (hasta) query = query.lte("fecha_vencimiento", hasta);
    if (cliente_id) query = query.eq("cliente_id", cliente_id);

    const { data, error } = await query.order("fecha_vencimiento");
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { data: tarea, error } = await supabase
      .from("tareas")
      .insert({
        tipo: body.tipo || "otro",
        titulo: body.titulo,
        descripcion: body.descripcion || null,
        cliente_id: body.cliente_id || null,
        vehiculo_id: body.vehiculo_id || null,
        prioridad: body.prioridad || "media",
        fecha_vencimiento: body.fecha_vencimiento
      })
      .select()
      .single();

    if (error) throw error;
    return ok(tarea, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
