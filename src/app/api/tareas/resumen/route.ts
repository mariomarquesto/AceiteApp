import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET() {
  try {
    const hoy = new Date().toISOString().slice(0, 10);
    const en7dias = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const { data: vencidas } = await supabase
      .from("tareas")
      .select("id")
      .eq("estado", "pendiente")
      .lt("fecha_vencimiento", hoy);

    const { data: hoyData } = await supabase
      .from("tareas")
      .select("id")
      .eq("estado", "pendiente")
      .eq("fecha_vencimiento", hoy);

    const { data: semana } = await supabase
      .from("tareas")
      .select("id")
      .eq("estado", "pendiente")
      .gte("fecha_vencimiento", hoy)
      .lte("fecha_vencimiento", en7dias);

    const { data: completadas } = await supabase
      .from("tareas")
      .select("id")
      .eq("estado", "completada")
      .gte("fecha_completada", hoy);

    return ok({
      vencidas: vencidas?.length || 0,
      hoy: hoyData?.length || 0,
      proximos_7_dias: semana?.length || 0,
      completadas_hoy: completadas?.length || 0
    });
  } catch (e) {
    return handleApiError(e);
  }
}
