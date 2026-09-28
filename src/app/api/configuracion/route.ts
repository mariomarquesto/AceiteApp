import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("configuracion")
      .select("*")
      .eq("id", 1)
      .single();
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from("configuracion")
      .update({
        dias_vencimiento: body.dias_vencimiento,
        porcentaje_mora_mensual: body.porcentaje_mora_mensual,
        activar_mora: body.activar_mora,
        updated_at: new Date().toISOString()
      })
      .eq("id", 1)
      .select()
      .single();
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}