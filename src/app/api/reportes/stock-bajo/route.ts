import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("v_stock_bajo")
      .select("*");

    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}
