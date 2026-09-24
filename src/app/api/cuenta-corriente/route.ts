import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const solo_con_deuda = req.nextUrl.searchParams.get("solo_con_deuda");

    const { data, error } = await supabase
      .from("v_saldos_clientes")
      .select("*");

    if (error) throw error;

    const result = solo_con_deuda === "true"
      ? data.filter((c: any) => Number(c.saldo) > 0)
      : data;

    return ok(result);
  } catch (e) {
    return handleApiError(e);
  }
}
