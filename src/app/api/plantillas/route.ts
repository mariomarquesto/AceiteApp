import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("plantillas_recordatorio")
      .select("*")
      .eq("activo", true)
      .order("tipo_uso");

    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, mensaje } = body;

    if (!id || !mensaje) {
      return ok({ error: "Faltan datos" }, 400);
    }

    const { data, error } = await supabase
      .from("plantillas_recordatorio")
      .update({ mensaje })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}
