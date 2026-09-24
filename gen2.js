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
// VENTAS - listar y crear
// ============================================
files["src/app/api/ventas/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { crearVentaSchema } from "@/utils/validators";

export async function GET(req: NextRequest) {
  try {
    const desde = req.nextUrl.searchParams.get("desde");
    const hasta = req.nextUrl.searchParams.get("hasta");
    const cliente_id = req.nextUrl.searchParams.get("cliente_id");

    let query = supabase
      .from("ventas")
      .select("*, cliente:clientes(id, nombre), items:venta_items(*)");

    if (cliente_id) query = query.eq("cliente_id", cliente_id);
    if (desde) query = query.gte("fecha", desde);
    if (hasta) query = query.lte("fecha", hasta);

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
    const data = crearVentaSchema.parse(body);

    const { data: ventaId, error } = await supabase.rpc("crear_venta", {
      p_cliente_id: data.cliente_id || null,
      p_items: data.items,
      p_descuento: data.descuento,
      p_notas: data.notas || null
    });

    if (error) throw error;

    const { data: venta } = await supabase
      .from("ventas")
      .select("*, items:venta_items(*)")
      .eq("id", ventaId)
      .single();

    return ok(venta, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// ============================================
// VENTAS - por ID
// ============================================
files["src/app/api/ventas/[id]/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

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
`;

// ============================================
// VENTAS - cobrar
// ============================================
files["src/app/api/ventas/[id]/cobrar/route.ts"] = `import { NextRequest } from "next/server";
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

    const { data: venta, error: errV } = await supabase
      .from("ventas")
      .select("cliente_id, saldo")
      .eq("id", params.id)
      .single();

    if (errV) throw errV;
    if (!venta) throw new ApiError(404, "Venta no encontrada");
    if (!venta.cliente_id) throw new ApiError(400, "La venta no tiene cliente asignado");

    if (data.monto > venta.saldo) {
      throw new ApiError(400, "El monto excede el saldo pendiente: " + venta.saldo);
    }

    const { data: pagoId, error } = await supabase.rpc("registrar_pago", {
      p_cliente_id: venta.cliente_id,
      p_monto: data.monto,
      p_medio: data.medio,
      p_tipo: "cobro",
      p_venta_id: params.id,
      p_orden_id: null,
      p_notas: data.notas || null,
      p_referencia_externa: null
    });

    if (error) throw error;

    const { data: ventaActualizada } = await supabase
      .from("ventas")
      .select("*")
      .eq("id", params.id)
      .single();

    return ok({ pago_id: pagoId, venta: ventaActualizada }, 201);
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
// ORDENES - por ID
// ============================================
files["src/app/api/ordenes/[id]/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok, ApiError } from "@/lib/errors";

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

    if (body.estado) updates.estado = body.estado;
    if (body.notas !== undefined) updates.notas = body.notas;
    if (body.estado === "completado") updates.fecha_completado = new Date().toISOString();
    if (body.estado === "entregado") updates.fecha_entrega = new Date().toISOString();

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

    if (data.monto > orden.saldo) {
      throw new ApiError(400, "El monto excede el saldo pendiente: " + orden.saldo);
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
// PAGOS - listar y crear
// ============================================
files["src/app/api/pagos/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { registrarPagoSchema } from "@/utils/validators";

export async function GET(req: NextRequest) {
  try {
    const cliente_id = req.nextUrl.searchParams.get("cliente_id");
    const desde = req.nextUrl.searchParams.get("desde");
    const hasta = req.nextUrl.searchParams.get("hasta");

    let query = supabase
      .from("pagos")
      .select("*, cliente:clientes(id, nombre)");

    if (cliente_id) query = query.eq("cliente_id", cliente_id);
    if (desde) query = query.gte("fecha", desde);
    if (hasta) query = query.lte("fecha", hasta);

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
    const data = registrarPagoSchema.parse(body);

    const { data: pagoId, error } = await supabase.rpc("registrar_pago", {
      p_cliente_id: data.cliente_id,
      p_monto: data.monto,
      p_medio: data.medio,
      p_tipo: data.tipo,
      p_venta_id: data.venta_id || null,
      p_orden_id: data.orden_id || null,
      p_notas: data.notas || null,
      p_referencia_externa: data.referencia_externa || null
    });

    if (error) throw error;

    const { data: pago } = await supabase
      .from("pagos")
      .select("*")
      .eq("id", pagoId)
      .single();

    return ok(pago, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// ============================================
// CUENTA CORRIENTE - listar saldos
// ============================================
files["src/app/api/cuenta-corriente/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const solo_con_deuda = req.nextUrl.searchParams.get("solo_con_deuda");

    const { data, error } = await supabase
      .from("v_saldos_clientes")
      .select("*");

    if (error) throw error;

    const result = solo_con_deuda === "true"
      ? data.filter((c: any) => Number(c.saldo) > 0)
      : data;

    return ok(result);
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// ============================================
// CUENTA CORRIENTE - estado por cliente
// ============================================
files["src/app/api/cuenta-corriente/[clienteId]/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET(_: NextRequest, { params }: { params: { clienteId: string } }) {
  try {
    const { data: cliente, error: errC } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", params.clienteId)
      .single();

    if (errC) throw errC;

    const { data: saldo } = await supabase
      .from("v_saldos_clientes")
      .select("*")
      .eq("cliente_id", params.clienteId)
      .single();

    const { data: ventas } = await supabase
      .from("ventas")
      .select("id, numero, fecha, total, saldo, estado_pago")
      .eq("cliente_id", params.clienteId)
      .neq("estado_pago", "pagada")
      .order("fecha");

    const { data: ordenes } = await supabase
      .from("ordenes")
      .select("id, numero, fecha, total, saldo, estado_pago")
      .eq("cliente_id", params.clienteId)
      .neq("estado_pago", "pagada")
      .order("fecha");

    const { data: pagos } = await supabase
      .from("pagos")
      .select("*")
      .eq("cliente_id", params.clienteId)
      .order("fecha", { ascending: false });

    return ok({
      cliente,
      saldo: saldo || { saldo: 0, total_deudas: 0, total_abonos: 0 },
      ventas_pendientes: ventas || [],
      ordenes_pendientes: ordenes || [],
      pagos: pagos || []
    });
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// ============================================
// REPORTES - stock bajo
// ============================================
files["src/app/api/reportes/stock-bajo/route.ts"] = `import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("v_stock_bajo")
      .select("*");

    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// ============================================
// REPORTES - ventas por rango
// ============================================
files["src/app/api/reportes/ventas/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const desde = req.nextUrl.searchParams.get("desde") || new Date().toISOString().slice(0, 10);
    const hasta = req.nextUrl.searchParams.get("hasta") || new Date().toISOString().slice(0, 10);

    const { data: ventas, error } = await supabase
      .from("ventas")
      .select("id, total, fecha, estado_pago, items:venta_items(cantidad, producto:productos(nombre))")
      .gte("fecha", desde)
      .lte("fecha", hasta + "T23:59:59");

    if (error) throw error;

    const { data: ordenes } = await supabase
      .from("ordenes")
      .select("id, total, fecha, estado_pago, items:orden_items(cantidad, producto:productos(nombre), servicio:servicios(nombre))")
      .gte("fecha", desde)
      .lte("fecha", hasta + "T23:59:59");

    const totalVentas = (ventas || []).reduce((s, v) => s + Number(v.total), 0);
    const totalOrdenes = (ordenes || []).reduce((s, o) => s + Number(o.total), 0);

    return ok({
      rango: { desde, hasta },
      total_ventas_directas: totalVentas,
      total_ordenes: totalOrdenes,
      total_facturado: totalVentas + totalOrdenes,
      cantidad_ventas: (ventas || []).length,
      cantidad_ordenes: (ordenes || []).length,
      ventas: ventas || [],
      ordenes: ordenes || []
    });
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// ============================================
// REPORTES - cierre de caja
// ============================================
files["src/app/api/reportes/cierre-caja/route.ts"] = `import { NextRequest } from "next/server";
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
`;

// ESCRIBIR TODOS
for (const [file, content] of Object.entries(files)) {
  w(file, content);
}

console.log("\n✅ Endpoints de negocio creados:", Object.keys(files).length);
