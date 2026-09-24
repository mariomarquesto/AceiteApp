import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { vehiculoSchema } from "@/utils/validators";

export async function GET(req: NextRequest) {
  try {
    const cliente_id = req.nextUrl.searchParams.get("cliente_id");
    const placa = req.nextUrl.searchParams.get("placa");

    let query = supabase.from("vehiculos").select("*").eq("activo", true);
    if (cliente_id) query = query.eq("cliente_id", cliente_id);
    if (placa) query = query.ilike("placa", "%" + placa + "%");

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = vehiculoSchema.parse(body);

    const { data: v, error } = await supabase
      .from("vehiculos")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return ok(v, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
