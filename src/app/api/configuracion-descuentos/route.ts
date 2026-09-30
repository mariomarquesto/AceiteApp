import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

// Valores por defecto si la fila no existe
const DEFAULTS = {
  id: 1,
  descuento_efectivo: 0,
  descuento_transferencia: 0,
  descuento_cumpleanos: 0,
  descuento_recurrente: 0,
  servicios_para_recurrente: 3,
  mensaje_bienvenida: "¡Hola! 👋 Bienvenido a nuestro servicio de cambio de aceite.",
  mensaje_despedida: "¡Gracias por tu visita! 🚗",
  bot_activo: true
};

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("configuracion_descuentos")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;

    return ok(data || DEFAULTS);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const payload = {
      id: 1,
      descuento_efectivo: body.descuento_efectivo ?? 0,
      descuento_transferencia: body.descuento_transferencia ?? 0,
      descuento_cumpleanos: body.descuento_cumpleanos ?? 0,
      descuento_recurrente: body.descuento_recurrente ?? 0,
      servicios_para_recurrente: body.servicios_para_recurrente ?? 3,
      mensaje_bienvenida: body.mensaje_bienvenida ?? DEFAULTS.mensaje_bienvenida,
      mensaje_despedida: body.mensaje_despedida ?? DEFAULTS.mensaje_despedida,
      bot_activo: body.bot_activo ?? true,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("configuracion_descuentos")
      .upsert(payload)
      .eq("id", 1)
      .select()
      .single();

    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}