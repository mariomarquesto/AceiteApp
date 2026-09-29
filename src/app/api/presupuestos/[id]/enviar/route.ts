import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("presupuestos")
      .update({
        estado: "enviado",
        enviado_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}