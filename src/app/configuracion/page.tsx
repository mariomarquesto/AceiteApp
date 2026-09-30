import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("q");

    let query = supabase
      .from("whatsapp_conversaciones")
      .select(`
        *,
        cliente:cliente_id (id, nombre, telefono)
      `)
      .order("ultima_actividad", { ascending: false });

    if (search) {
      query = query.or(`telefono.ilike.%${search}%,ultimo_mensaje.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}