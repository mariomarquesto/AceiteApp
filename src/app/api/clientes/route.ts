import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { clienteSchema } from "@/utils/validators";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q");
    const cc = req.nextUrl.searchParams.get("cuenta_corriente");

    let query = supabase.from("clientes").select("*").eq("activo", true);
    if (q) query = query.or("nombre.ilike.%" + q + "%,telefono.ilike.%" + q + "%");
    if (cc === "true") query = query.eq("permite_cuenta_corriente", true);

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
    const data = clienteSchema.parse(body);

    const { data: cliente, error } = await supabase
      .from("clientes")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return ok(cliente, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
