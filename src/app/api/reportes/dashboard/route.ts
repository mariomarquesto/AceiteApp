import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET() {
  try {
    const hoy = new Date();
    const meses: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const inicio = d.toISOString().slice(0, 10);
      const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
      meses.push({ mes: inicio.slice(0, 7), inicio, fin, total: 0 });
    }

    const primerDia = meses[0].inicio;
    const [ventas, ordenes] = await Promise.all([
      supabase.from("ventas").select("total, fecha").gte("fecha", primerDia),
      supabase.from("ordenes").select("total, fecha").gte("fecha", primerDia)
    ]);

    const todas = [...(ventas.data || []), ...(ordenes.data || [])];

    for (const m of meses) {
      m.total = todas
        .filter(v => v.fecha >= m.inicio && v.fecha <= m.fin + "T23:59:59")
        .reduce((s, v) => s + Number(v.total), 0);
    }

    const { data: itemsVentas } = await supabase
      .from("venta_items")
      .select("cantidad, subtotal, producto:productos(nombre)");

    const { data: itemsOrdenes } = await supabase
      .from("orden_items")
      .select("cantidad, subtotal, producto:productos(nombre), servicio:servicios(nombre)");

    const contador: Record<string, { cantidad: number; total: number }> = {};

    for (const it of itemsVentas || []) {
      const nombre = (it as any).producto?.nombre;
      if (!nombre) continue;
      if (!contador[nombre]) contador[nombre] = { cantidad: 0, total: 0 };
      contador[nombre].cantidad += Number(it.cantidad);
      contador[nombre].total += Number(it.subtotal);
    }

    for (const it of itemsOrdenes || []) {
      const nombre = (it as any).producto?.nombre || (it as any).servicio?.nombre;
      if (!nombre) continue;
      if (!contador[nombre]) contador[nombre] = { cantidad: 0, total: 0 };
      contador[nombre].cantidad += Number(it.cantidad);
      contador[nombre].total += Number(it.subtotal);
    }

    const topProductos = Object.entries(contador)
      .map(([nombre, data]) => ({ nombre, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const { data: clientesVentas } = await supabase
      .from("ventas")
      .select("total, cliente:clientes(nombre)")
      .not("cliente_id", "is", null);

    const { data: clientesOrdenes } = await supabase
      .from("ordenes")
      .select("total, cliente:clientes(nombre)");

    const contadorClientes: Record<string, { total: number; operaciones: number }> = {};

    for (const v of [...(clientesVentas || []), ...(clientesOrdenes || [])]) {
      const nombre = (v as any).cliente?.nombre;
      if (!nombre) continue;
      if (!contadorClientes[nombre]) contadorClientes[nombre] = { total: 0, operaciones: 0 };
      contadorClientes[nombre].total += Number(v.total);
      contadorClientes[nombre].operaciones += 1;
    }

    const topClientes = Object.entries(contadorClientes)
      .map(([nombre, data]) => ({ nombre, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return ok({ meses, topProductos, topClientes });
  } catch (e) {
    return handleApiError(e);
  }
}