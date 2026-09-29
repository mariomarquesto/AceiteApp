import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { z } from "zod";

const contactoSchema = z.object({
  cliente_id: z.string().uuid(),
  vehiculo_id: z.string().uuid().optional().nullable(),
  tarea_id: z.string().uuid().optional().nullable(),
  tipo: z.enum(["whatsapp", "llamada", "email", "visita", "sms"]).default("whatsapp"),
  motivo: z.string().optional().nullable(),
  resultado: z.enum(["sin_respuesta", "contactado", "interesado", "agendo", "rechazo"]).default("contactado"),
  notas: z.string().optional().nullable()
});

export async function GET(req: NextRequest) {
  try {
    const cliente_id = req.nextUrl.searchParams.get("cliente_id");
    const limit = req.nextUrl.searchParams.get("limit") || "50";

    let query = supabase
      .from("contactos")
      .select("*, cliente:clientes(id, nombre, telefono), vehiculo:vehiculos(marca, modelo, placa)")
      .order("fecha", { ascending: false })
      .limit(Number(limit));

    if (cliente_id) query = query.eq("cliente_id", cliente_id);

    const { data, error } = await query;
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactoSchema.parse(body);

    const { data: contacto, error } = await supabase
      .from("contactos")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return ok(contacto, 201);
  } catch (e) {
    return handleApiError(e);
  }
}