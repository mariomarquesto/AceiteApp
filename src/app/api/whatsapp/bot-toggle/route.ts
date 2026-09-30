import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const { telefono, bot_activo } = await req.json();

    if (!telefono) throw new Error("Falta el teléfono");

    const { data, error } = await supabase
      .from("whatsapp_conversaciones")
      .update({ bot_activo })
      .eq("telefono", telefono)
      .select()
      .single();

    if (error) throw error;

    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}