import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok, ApiError } from "@/lib/errors";

export async function GET(_: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { data: cliente, error } = await supabase
      .from("clientes")
      .select("id, nombre, telefono, email")
      .eq("portal_token", params.token)
      .eq("portal_activo", true)
      .single();

    if (error || !cliente) {
      throw new ApiError(404, "Cliente no encontrado o portal inactivo");
    }

    const [vehiculos, ordenes, ventas, saldo, turnos] = await Promise.all([
      supabase
        .from("vehiculos")
        .select("*")
        .eq("cliente_id", cliente.id)
        .eq("activo", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("ordenes")
        .select("*, vehiculo:vehiculos(marca, modelo, placa)")
        .eq("cliente_id", cliente.id)
        .order("fecha", { ascending: false })
        .limit(20),
      supabase
        .from("ventas")
        .select("*")
        .eq("cliente_id", cliente.id)
        .order("fecha", { ascending: false })
        .limit(20),
      supabase
        .from("v_saldos_clientes")
        .select("*")
        .eq("cliente_id", cliente.id)
        .maybeSingle(),
      supabase
        .from("turnos")
        .select("*")
        .eq("cliente_id", cliente.id)
        .gte("fecha", new Date().toISOString().slice(0, 10))
        .order("fecha")
        .limit(5)
    ]);

    return ok({
      cliente,
      vehiculos: vehiculos.data || [],
      ordenes: ordenes.data || [],
      ventas: ventas.data || [],
      saldo: saldo.data || { saldo: 0, total_deudas: 0, total_abonos: 0 },
      turnos: turnos.data || []
    });
  } catch (e) {
    return handleApiError(e);
  }
}