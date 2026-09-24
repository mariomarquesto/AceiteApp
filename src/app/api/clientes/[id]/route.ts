import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok, ApiError } from "@/lib/errors";
import { clienteSchema } from "@/utils/validators";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("clientes")
      .select("*, vehiculos(*)")
      .eq("id", params.id)
      .single();

    if (error) throw error;
    if (!data) throw new ApiError(404, "Cliente no encontrado");
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = clienteSchema.partial().parse(body);

    const { data: cliente, error } = await supabase
      .from("clientes")
      .update(data)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return ok(cliente);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase
      .from("clientes")
      .update({ activo: false })
      .eq("id", params.id);

    if (error) throw error;
    return ok({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
