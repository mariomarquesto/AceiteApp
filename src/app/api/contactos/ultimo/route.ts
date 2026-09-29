import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const cliente_id = req.nextUrl.searchParams.get("cliente_id");
    if (!cliente_id) return ok(null);

    const { data, error } = await supabase
      .from("contactos")
      .select("*")
      .eq("cliente_id", cliente_id)
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}