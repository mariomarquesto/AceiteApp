const fs = require("fs");
const path = require("path");

function w(file, content) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content, "utf8");
  console.log("OK:", file);
}

const files = {};

// ============================================
// VEHICULOS - listar y crear
// ============================================
files["src/app/api/vehiculos/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { vehiculoSchema } from "@/utils/validators";

export async function GET(req: NextRequest) {
  try {
    const cliente_id = req.nextUrl.searchParams.get("cliente_id");
    const placa = req.nextUrl.searchParams.get("placa");
    const tipo_uso = req.nextUrl.searchParams.get("tipo_uso");

    let query = supabase
      .from("vehiculos")
      .select("*, cliente:clientes(id, nombre, telefono)")
      .eq("activo", true);

    if (cliente_id) query = query.eq("cliente_id", cliente_id);
    if (placa) query = query.ilike("placa", "%" + placa + "%");
    if (tipo_uso) query = query.eq("tipo_uso", tipo_uso);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = vehiculoSchema.parse(body);

    const { data: v, error } = await supabase
      .from("vehiculos")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return ok(v, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// ============================================
// VEHICULOS - por ID
// ============================================
files["src/app/api/vehiculos/[id]/route.ts"] = `import { NextRequest } from "next/server";
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
`;

// ============================================
// ORDENES - listar y crear
// ============================================
files["src/app/api/ordenes/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { z } from "zod";

const itemSchema = z.object({
  producto_id: z.string().uuid().optional().nullable(),
  servicio_id: z.string().uuid().optional().nullable(),
  descripcion: z.string().optional().nullable(),
  cantidad: z.number().positive(),
  precio_unitario: z.number().min(0)
}).refine(i => i.producto_id || i.servicio_id, {
  message: "Debe tener producto o servicio"
});

const crearOrdenSchema = z.object({
  cliente_id: z.string().uuid(),
  vehiculo_id: z.string().uuid(),
  km_ingreso: z.number().int().min(0),
  items: z.array(itemSchema).min(1),
  descuento: z.number().min(0).default(0),
  notas: z.string().optional().nullable(),
  proximo_cambio_km: z.number().int().optional().nullable(),
  proximo_cambio_fecha: z.string().optional().nullable()
});

export async function GET(req: NextRequest) {
  try {
    const estado = req.nextUrl.searchParams.get("estado");
    const cliente_id = req.nextUrl.searchParams.get("cliente_id");

    let query = supabase
      .from("ordenes")
      .select("*, cliente:clientes(id, nombre, telefono), vehiculo:vehiculos(*), items:orden_items(*)");

    if (estado) query = query.eq("estado", estado);
    if (cliente_id) query = query.eq("cliente_id", cliente_id);

    const { data, error } = await query.order("fecha", { ascending: false }).limit(200);
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = crearOrdenSchema.parse(body);

    const { data: ordenId, error } = await supabase.rpc("crear_orden", {
      p_cliente_id: data.cliente_id,
      p_vehiculo_id: data.vehiculo_id,
      p_km_ingreso: data.km_ingreso,
      p_items: data.items,
      p_descuento: data.descuento,
      p_notas: data.notas || null,
      p_proximo_cambio_km: data.proximo_cambio_km || null,
      p_proximo_cambio_fecha: data.proximo_cambio_fecha || null
    });

    if (error) throw error;

    const { data: orden } = await supabase
      .from("ordenes")
      .select("*, items:orden_items(*)")
      .eq("id", ordenId)
      .single();

    return ok(orden, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// ============================================
// ORDENES - por ID + actualizar estado
// ============================================
files["src/app/api/ordenes/[id]/route.ts"] = `import { NextRequest } from "next/server";
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
      .from("ordenes")
      .update({ estado: "cancelado" })
      .eq("id", params.id);

    if (error) throw error;
    return ok({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// ============================================
// ORDENES - cobrar
// ============================================
files["src/app/api/ordenes/[id]/cobrar/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok, ApiError } from "@/lib/errors";
import { z } from "zod";

const schema = z.object({
  monto: z.number().positive(),
  medio: z.enum(["efectivo", "transferencia", "otro"]),
  notas: z.string().optional().nullable()
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const { data: orden, error: errO } = await supabase
      .from("ordenes")
      .select("cliente_id, saldo")
      .eq("id", params.id)
      .single();

    if (errO) throw errO;
    if (!orden) throw new ApiError(404, "Orden no encontrada");

    if (data.monto > Number(orden.saldo)) {
      throw new ApiError(400, "El monto excede el saldo pendiente");
    }

    const { data: pagoId, error } = await supabase.rpc("registrar_pago", {
      p_cliente_id: orden.cliente_id,
      p_monto: data.monto,
      p_medio: data.medio,
      p_tipo: "cobro",
      p_venta_id: null,
      p_orden_id: params.id,
      p_notas: data.notas || null,
      p_referencia_externa: null
    });

    if (error) throw error;

    const { data: ordenActualizada } = await supabase
      .from("ordenes")
      .select("*")
      .eq("id", params.id)
      .single();

    return ok({ pago_id: pagoId, orden: ordenActualizada }, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// ============================================
// TAREAS - listar y crear
// ============================================
files["src/app/api/tareas/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const estado = req.nextUrl.searchParams.get("estado") || "pendiente";
    const desde = req.nextUrl.searchParams.get("desde");
    const hasta = req.nextUrl.searchParams.get("hasta");
    const cliente_id = req.nextUrl.searchParams.get("cliente_id");

    let query = supabase
      .from("tareas")
      .select("*, cliente:clientes(id, nombre, telefono), vehiculo:vehiculos(*)");

    if (estado && estado !== "todas") query = query.eq("estado", estado);
    if (desde) query = query.gte("fecha_vencimiento", desde);
    if (hasta) query = query.lte("fecha_vencimiento", hasta);
    if (cliente_id) query = query.eq("cliente_id", cliente_id);

    const { data, error } = await query.order("fecha_vencimiento");
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { data: tarea, error } = await supabase
      .from("tareas")
      .insert({
        tipo: body.tipo || "otro",
        titulo: body.titulo,
        descripcion: body.descripcion || null,
        cliente_id: body.cliente_id || null,
        vehiculo_id: body.vehiculo_id || null,
        prioridad: body.prioridad || "media",
        fecha_vencimiento: body.fecha_vencimiento
      })
      .select()
      .single();

    if (error) throw error;
    return ok(tarea, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// ============================================
// TAREAS - por ID, completar, posponer
// ============================================
files["src/app/api/tareas/[id]/route.ts"] = `import { NextRequest } from "next/server";
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
`;

// ============================================
// TAREAS - resumen (para dashboard)
// ============================================
files["src/app/api/tareas/resumen/route.ts"] = `import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET() {
  try {
    const hoy = new Date().toISOString().slice(0, 10);
    const en7dias = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const { data: vencidas } = await supabase
      .from("tareas")
      .select("id")
      .eq("estado", "pendiente")
      .lt("fecha_vencimiento", hoy);

    const { data: hoyData } = await supabase
      .from("tareas")
      .select("id")
      .eq("estado", "pendiente")
      .eq("fecha_vencimiento", hoy);

    const { data: semana } = await supabase
      .from("tareas")
      .select("id")
      .eq("estado", "pendiente")
      .gte("fecha_vencimiento", hoy)
      .lte("fecha_vencimiento", en7dias);

    const { data: completadas } = await supabase
      .from("tareas")
      .select("id")
      .eq("estado", "completada")
      .gte("fecha_completada", hoy);

    return ok({
      vencidas: vencidas?.length || 0,
      hoy: hoyData?.length || 0,
      proximos_7_dias: semana?.length || 0,
      completadas_hoy: completadas?.length || 0
    });
  } catch (e) {
    return handleApiError(e);
  }
}
`;

for (const [file, content] of Object.entries(files)) {
  w(file, content);
}

console.log("\n✅ Backend de vehiculos, ordenes y tareas creado:", Object.keys(files).length, "archivos");
