import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { servicioSchema } from "@/utils/validators";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = servicioSchema.partial().parse(body);

    const { data: s, error } = await supabase
      .from("servicios")
      .update(data)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return ok(s);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase
      .from("servicios")
      .update({ activo: false })
      .eq("id", params.id);

    if (error) throw error;
    return ok({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
