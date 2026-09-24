import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const desde = req.nextUrl.searchParams.get("desde") || new Date().toISOString().slice(0, 10);
    const hasta = req.nextUrl.searchParams.get("hasta") || desde;

    const { data: pagos, error } = await supabase
      .from("pagos")
      .select("*")
      .gte("fecha", desde)
      .lte("fecha", hasta + "T23:59:59");

    if (error) throw error;

    const efectivo = (pagos || [])
      .filter(p => p.medio === "efectivo")
      .reduce((s, p) => s + Number(p.monto), 0);

    const transferencia = (pagos || [])
      .filter(p => p.medio === "transferencia")
      .reduce((s, p) => s + Number(p.monto), 0);

    return ok({
      rango: { desde, hasta },
      total_cobrado: efectivo + transferencia,
      efectivo,
      transferencia,
      cantidad_pagos: (pagos || []).length,
      detalle: pagos || []
    });
  } catch (e) {
    return handleApiError(e);
  }
}
