import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("ordenes")
      .select("*, cliente:clientes(*), vehiculo:vehiculos(*), items:orden_items(*, producto:productos(*), servicio:servicios(*)), pagos(*)")
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

    if (body.estado) {
      updates.estado = body.estado;
      if (body.estado === "completado") {
        updates.fecha_completado = new Date().toISOString();
      }
      if (body.estado === "entregado") {
        updates.fecha_entrega = new Date().toISOString();
      }
    }
    if (body.notas !== undefined) updates.notas = body.notas;
    if (body.km_ingreso !== undefined) updates.km_ingreso = body.km_ingreso;

    const { data, error } = await supabase
      .from("ordenes")
      .update(updates)
      .eq("id", params.id)
      .select("*, cliente:clientes(id, nombre, telefono), vehiculo:vehiculos(marca, modelo, placa)")
      .single();

    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase
      .from("ordenes")
      .update({ estado: "cancelado" })
      .eq("id", params.id);

    if (error) throw error;
    return ok({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}