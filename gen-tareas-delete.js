const fs = require("fs");
const path = require("path");

function w(file, content) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content, "utf8");
  console.log("OK:", file);
}

// ============================================
// TAREAS - Eliminar (agregar al [id]/route.ts)
// ============================================
w("src/app/api/tareas/[id]/route.ts", `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("tareas")
      .select("*, cliente:clientes(*), vehiculo:vehiculos(*), orden:ordenes(*)")
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
      if (body.estado === "completada") {
        updates.fecha_completada = new Date().toISOString();
      }
    }
    if (body.resultado !== undefined) updates.resultado = body.resultado;
    if (body.contacto_realizado !== undefined) updates.contacto_realizado = body.contacto_realizado;
    if (body.medio_contacto !== undefined) updates.medio_contacto = body.medio_contacto;
    if (body.fecha_vencimiento) updates.fecha_vencimiento = body.fecha_vencimiento;
    if (body.prioridad) updates.prioridad = body.prioridad;
    if (body.titulo) updates.titulo = body.titulo;
    if (body.descripcion !== undefined) updates.descripcion = body.descripcion;
    if (body.tipo) updates.tipo = body.tipo;

    const { data, error } = await supabase
      .from("tareas")
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
    const { error } = await supabase
      .from("tareas")
      .delete()
      .eq("id", params.id);

    if (error) throw error;
    return ok({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
`);

console.log("\\n✅ Endpoint DELETE de tareas creado");
