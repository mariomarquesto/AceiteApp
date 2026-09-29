import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("presupuestos")
      .select("*, cliente:clientes(*), vehiculo:vehiculos(*), items:presupuesto_items(*, producto:productos(*), servicio:servicios(*)), orden:ordenes(numero)")
      .eq("id", params.id)
      .single();

    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updates: any = {};

    if (body.estado) updates.estado = body.estado;
    if (body.notas !== undefined) updates.notas = body.notas;
    if (body.descuento !== undefined) updates.descuento = body.descuento;
    
    if (body.estado === "enviado") updates.enviado_at = new Date().toISOString();
    if (body.estado === "aceptado") updates.aceptado_at = new Date().toISOString();
    if (body.estado === "rechazado") updates.rechazado_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("presupuestos")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: presupuesto } = await supabase
      .from("presupuestos")
      .select("estado")
      .eq("id", params.id)
      .single();

    if (presupuesto?.estado === "convertido") {
      return ok({ error: "No se puede eliminar un presupuesto ya convertido" }, 400);
    }

    const { error } = await supabase
      .from("presupuestos")
      .delete()
      .eq("id", params.id);

    if (error) throw error;
    return ok({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}