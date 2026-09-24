import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET(_: NextRequest, { params }: { params: { clienteId: string } }) {
  try {
    const { data: cliente, error: errC } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", params.clienteId)
      .single();

    if (errC) throw errC;

    const { data: saldo } = await supabase
      .from("v_saldos_clientes")
      .select("*")
      .eq("cliente_id", params.clienteId)
      .single();

    const { data: ventas } = await supabase
      .from("ventas")
      .select("id, numero, fecha, total, saldo, estado_pago")
      .eq("cliente_id", params.clienteId)
      .neq("estado_pago", "pagada")
      .order("fecha");

    const { data: ordenes } = await supabase
      .from("ordenes")
      .select("id, numero, fecha, total, saldo, estado_pago")
      .eq("cliente_id", params.clienteId)
      .neq("estado_pago", "pagada")
      .order("fecha");

    const { data: pagos } = await supabase
      .from("pagos")
      .select("*")
      .eq("cliente_id", params.clienteId)
      .order("fecha", { ascending: false });

    return ok({
      cliente,
      saldo: saldo || { saldo: 0, total_deudas: 0, total_abonos: 0 },
      ventas_pendientes: ventas || [],
      ordenes_pendientes: ordenes || [],
      pagos: pagos || []
    });
  } catch (e) {
    return handleApiError(e);
  }
}
