import { NextRequest } from "next/server";
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

const crearPresupuestoSchema = z.object({
  cliente_id: z.string().uuid(),
  vehiculo_id: z.string().uuid().optional().nullable(),
  validez_dias: z.number().int().min(1).default(7),
  descuento: z.number().min(0).default(0),
  notas: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1)
});

export async function GET(req: NextRequest) {
  try {
    const estado = req.nextUrl.searchParams.get("estado");
    const cliente_id = req.nextUrl.searchParams.get("cliente_id");

    let query = supabase
      .from("presupuestos")
      .select("*, cliente:clientes(id, nombre, telefono), vehiculo:vehiculos(marca, modelo, placa), items:presupuesto_items(*)");

    if (estado) query = query.eq("estado", estado);
    if (cliente_id) query = query.eq("cliente_id", cliente_id);

    const { data, error } = await query.order("created_at", { ascending: false }).limit(200);
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = crearPresupuestoSchema.parse(body);

    // Calcular totales
    let subtotal = 0;
    for (const item of data.items) {
      subtotal += item.cantidad * item.precio_unitario;
    }
    const total = subtotal - data.descuento;

    // Fecha de vencimiento
    const fechaVenc = new Date();
    fechaVenc.setDate(fechaVenc.getDate() + data.validez_dias);

    // Crear presupuesto
    const { data: presupuesto, error: errP } = await supabase
      .from("presupuestos")
      .insert({
        cliente_id: data.cliente_id,
        vehiculo_id: data.vehiculo_id || null,
        validez_dias: data.validez_dias,
        fecha_vencimiento: fechaVenc.toISOString().slice(0, 10),
        subtotal,
        descuento: data.descuento,
        total,
        notas: data.notas || null,
        estado: "borrador"
      })
      .select()
      .single();

    if (errP) throw errP;

    // Insertar items
    const itemsToInsert = data.items.map(i => ({
      presupuesto_id: presupuesto.id,
      producto_id: i.producto_id || null,
      servicio_id: i.servicio_id || null,
      descripcion: i.descripcion || null,
      cantidad: i.cantidad,
      precio_unitario: i.precio_unitario,
      subtotal: i.cantidad * i.precio_unitario
    }));

    const { error: errI } = await supabase
      .from("presupuesto_items")
      .insert(itemsToInsert);

    if (errI) throw errI;

    // Devolver presupuesto con items
    const { data: completo } = await supabase
      .from("presupuestos")
      .select("*, items:presupuesto_items(*)")
      .eq("id", presupuesto.id)
      .single();

    return ok(completo, 201);
  } catch (e) {
    return handleApiError(e);
  }
}