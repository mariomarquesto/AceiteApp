import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { servicioSchema } from "@/utils/validators";

export async function GET(req: NextRequest) {
  try {
    const incluirInactivos = req.nextUrl.searchParams.get("incluir_inactivos");
    let query = supabase.from("servicios").select("*");
    if (incluirInactivos !== "true") {
      query = query.eq("activo", true);
    }
    const { data, error } = await query.order("nombre");
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = servicioSchema.parse(body);
    const { data: s, error } = await supabase
      .from("servicios")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return ok(s, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
