import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET() {
  try {
    const { data: ventas } = await supabase
      .from("ventas")
      .select("total, cliente:clientes(id, nombre, telefono)")
      .not("cliente_id", "is", null);

    const { data: ordenes } = await supabase
      .from("ordenes")
      .select("total, cliente:clientes(id, nombre, telefono)");

    const ranking: Record<string, any> = {};

    for (const v of [...(ventas || []), ...(ordenes || [])]) {
      const c = (v as any).cliente;
      if (!c?.id) continue;
      if (!ranking[c.id]) {
        ranking[c.id] = {
          id: c.id,
          nombre: c.nombre,
          telefono: c.telefono || "",
          total: 0,
          operaciones: 0
        };
      }
      ranking[c.id].total += Number(v.total);
      ranking[c.id].operaciones += 1;
    }

    const lista = Object.values(ranking)
      .map((r: any) => ({ ...r, promedio: r.total / r.operaciones }))
      .sort((a: any, b: any) => b.total - a.total);

    return ok(lista);
  } catch (e) {
    return handleApiError(e);
  }
}