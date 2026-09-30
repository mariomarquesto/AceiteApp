import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

type Params = { params: { telefono: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const telefono = decodeURIComponent(params.telefono);

    // Marcar como leídos
    await supabase
      .from("whatsapp_conversaciones")
      .update({ no_leidos: 0 })
      .eq("telefono", telefono);

    const { data, error } = await supabase
      .from("whatsapp_mensajes")
      .select("*")
      .eq("telefono", telefono)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}