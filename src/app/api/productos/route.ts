import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { productoSchema } from "@/utils/validators";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q");
    const tipo = req.nextUrl.searchParams.get("tipo");

    let query = supabase.from("productos").select("*").eq("activo", true);
    if (q) query = query.or("nombre.ilike.%" + q + "%,codigo.ilike.%" + q + "%,marca.ilike.%" + q + "%");
    if (tipo) query = query.eq("tipo", tipo);

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
    const data = productoSchema.parse(body);

    const { data: p, error } = await supabase
      .from("productos")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return ok(p, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
