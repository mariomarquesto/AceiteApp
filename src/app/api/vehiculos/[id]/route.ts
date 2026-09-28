import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { vehiculoSchema } from "@/utils/validators";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: vehiculo, error } = await supabase
      .from("vehiculos")
      .select("*, cliente:clientes(*)")
      .eq("id", params.id)
      .single();

    if (error) throw error;

    const { data: ordenes } = await supabase
      .from("ordenes")
      .select("*, items:orden_items(*)")
      .eq("vehiculo_id", params.id)
      .order("fecha", { ascending: false });

    return ok({ ...vehiculo, historial: ordenes || [] });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = vehiculoSchema.partial().parse(body);

    const { data: v, error } = await supabase
      .from("vehiculos")
      .update(data)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return ok(v);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase
      .from("vehiculos")
      .update({ activo: false })
      .eq("id", params.id);

    if (error) throw error;
    return ok({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
