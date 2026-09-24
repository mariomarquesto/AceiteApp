import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok, ApiError } from "@/lib/errors";
import { z } from "zod";

const updateSchema = z.object({
  notas: z.string().optional().nullable(),
  descuento: z.number().min(0).optional()
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("ventas")
      .select("*, cliente:clientes(*), items:venta_items(*, producto:productos(*))")
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
    const data = updateSchema.parse(body);

    const { data: ventaActual } = await supabase
      .from("ventas")
      .select("subtotal, estado_pago")
      .eq("id", params.id)
      .single();

    if (!ventaActual) throw new ApiError(404, "Venta no encontrada");
    if (ventaActual.estado_pago === "pagada") {
      throw new ApiError(400, "No se puede editar una venta ya pagada");
    }

    const updates: any = {};
    if (data.notas !== undefined) updates.notas = data.notas;
    if (data.descuento !== undefined) {
      updates.descuento = data.descuento;
      updates.total = Number(ventaActual.subtotal) - data.descuento;
      updates.saldo = Number(ventaActual.subtotal) - data.descuento;
    }

    const { data: venta, error } = await supabase
      .from("ventas")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return ok(venta);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: venta } = await supabase
      .from("ventas")
      .select("estado_pago")
      .eq("id", params.id)
      .single();

    if (!venta) throw new ApiError(404, "Venta no encontrada");
    if (venta.estado_pago === "pagada") {
      throw new ApiError(400, "No se puede eliminar una venta pagada. Usá /anular");
    }

    // Si no está pagada, permitir eliminación física
    const { error } = await supabase
      .from("ventas")
      .delete()
      .eq("id", params.id);

    if (error) throw error;
    return ok({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
