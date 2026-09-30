import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET() {
  try {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().slice(0, 10);

    // Datos de los últimos 3 meses
    const hace3Meses = new Date(hoy.getFullYear(), hoy.getMonth() - 3, 1);
    const desde = hace3Meses.toISOString().slice(0, 10);

    const [ventas, ordenes, clientes, productos, tareas] = await Promise.all([
      supabase.from("ventas").select("total, fecha, cliente_id").gte("fecha", desde),
      supabase.from("ordenes").select("total, fecha, cliente_id").gte("fecha", desde),
      supabase.from("clientes").select("id, nombre, telefono").eq("activo", true),
      supabase.from("productos").select("id, nombre, stock, stock_minimo").eq("activo", true),
      supabase.from("tareas").select("id, estado, fecha_vencimiento").eq("estado", "pendiente")
    ]);

    const recomendaciones: any[] = [];

    // === ANÁLISIS 1: Tendencia mes actual vs anterior ===
    const mesActualInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
    const mesAnteriorInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1).toISOString().slice(0, 10);
    const mesAnteriorFin = new Date(hoy.getFullYear(), hoy.getMonth(), 0).toISOString().slice(0, 10);

    const todasVentas = [...(ventas.data || []), ...(ordenes.data || [])];

    const totalMesActual = todasVentas
      .filter(v => v.fecha >= mesActualInicio)
      .reduce((s, v) => s + Number(v.total), 0);

    const totalMesAnterior = todasVentas
      .filter(v => v.fecha >= mesAnteriorInicio && v.fecha <= mesAnteriorFin + "T23:59:59")
      .reduce((s, v) => s + Number(v.total), 0);

    if (totalMesAnterior > 0) {
      const variacion = ((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100;

      if (variacion < -20) {
        recomendaciones.push({
          tipo: "urgente",
          icono: "🔴",
          titulo: `Estás ${Math.abs(Math.round(variacion))}% abajo del mes anterior`,
          descripcion: `Facturaste $${Math.round(totalMesActual).toLocaleString("es-AR")} vs $${Math.round(totalMesAnterior).toLocaleString("es-AR")} el mes pasado`,
          acciones: [
            { label: "Ver clientes inactivos", href: "/clientes" },
            { label: "Ver tareas pendientes", href: "/tareas" },
            { label: "Crear promo", href: "/presupuestos/nuevo" }
          ],
          color: "#ef4444"
        });
      } else if (variacion < -5) {
        recomendaciones.push({
          tipo: "atencion",
          icono: "🟡",
          titulo: `Ventas ${Math.abs(Math.round(variacion))}% abajo del mes pasado`,
          descripcion: `Atención al descenso. Considerá acciones para recuperar`,
          acciones: [
            { label: "Ver tareas", href: "/tareas" }
          ],
          color: "#f59e0b"
        });
      } else if (variacion > 20) {
        recomendaciones.push({
          tipo: "exito",
          icono: "🟢",
          titulo: `¡Crecimiento del ${Math.round(variacion)}%!`,
          descripcion: `Vas muy bien. Seguí con la misma estrategia`,
          acciones: [
            { label: "Ver reportes", href: "/reportes" }
          ],
          color: "#16a34a"
        });
      }
    }

    // === ANÁLISIS 2: Clientes inactivos ===
    const clientesActivos = new Set(
      todasVentas
        .filter(v => v.fecha >= new Date(hoy.getTime() - 60 * 86400000).toISOString().slice(0, 10))
        .map(v => v.cliente_id)
        .filter(Boolean)
    );

    const clientesConHistorial = new Set(
      todasVentas.map(v => v.cliente_id).filter(Boolean)
    );

    const inactivos = (clientes.data || []).filter(
      c => clientesConHistorial.has(c.id) && !clientesActivos.has(c.id)
    );

    if (inactivos.length > 0) {
      recomendaciones.push({
        tipo: "oportunidad",
        icono: "💡",
        titulo: `${inactivos.length} ${inactivos.length === 1 ? "cliente lleva" : "clientes llevan"} +2 meses sin venir`,
        descripcion: `Podés recuperarlos con un mensaje de WhatsApp. Potencial: $${(inactivos.length * 5000).toLocaleString("es-AR")}`,
        acciones: [
          { label: "Ver clientes", href: "/clientes" },
          { label: "Enviar recordatorios", href: "/tareas" }
        ],
        color: "#8b5cf6"
      });
    }

    // === ANÁLISIS 3: Stock bajo ===
    const stockBajo = (productos.data || []).filter(
      p => p.stock <= p.stock_minimo
    );

    if (stockBajo.length > 0) {
      recomendaciones.push({
        tipo: "urgente",
        icono: "📦",
        titulo: `${stockBajo.length} ${stockBajo.length === 1 ? "producto" : "productos"} con stock bajo`,
        descripcion: stockBajo.slice(0, 3).map(p => p.nombre).join(", ") +
          (stockBajo.length > 3 ? ` y ${stockBajo.length - 3} más` : ""),
        acciones: [
          { label: "Ver inventario", href: "/productos" }
        ],
        color: "#ef4444"
      });
    }

    // === ANÁLISIS 4: Tareas vencidas ===
    const tareasVencidas = (tareas.data || []).filter(
      t => t.fecha_vencimiento < hoyStr
    );

    if (tareasVencidas.length > 0) {
      recomendaciones.push({
        tipo: "urgente",
        icono: "📋",
        titulo: `${tareasVencidas.length} ${tareasVencidas.length === 1 ? "tarea vencida" : "tareas vencidas"}`,
        descripcion: "Hay clientes esperando respuesta. Contactalos hoy",
        acciones: [
          { label: "Ver tareas", href: "/tareas" }
        ],
        color: "#ef4444"
      });
    }

    // === ANÁLISIS 5: Concentración de productos ===
    const { data: itemsVentas } = await supabase
      .from("venta_items")
      .select("cantidad, subtotal, producto:productos(nombre)");

    const contadorProductos: Record<string, { total: number; cantidad: number }> = {};
    let totalItems = 0;

    for (const it of itemsVentas || []) {
      const nombre = (it as any).producto?.nombre;
      if (!nombre) continue;
      if (!contadorProductos[nombre]) contadorProductos[nombre] = { total: 0, cantidad: 0 };
      contadorProductos[nombre].total += Number(it.subtotal);
      contadorProductos[nombre].cantidad += Number(it.cantidad);
      totalItems += Number(it.subtotal);
    }

    const topProducto = Object.entries(contadorProductos)
      .sort((a, b) => b[1].total - a[1].total)[0];

    if (topProducto && totalItems > 0) {
      const porcentaje = (topProducto[1].total / totalItems) * 100;

      if (porcentaje > 40) {
        recomendaciones.push({
          tipo: "atencion",
          icono: "⚠️",
          titulo: `"${topProducto[0]}" es el ${Math.round(porcentaje)}% de tus ventas`,
          descripcion: "Mucha dependencia de un solo producto. Diversificá la oferta",
          acciones: [
            { label: "Ver productos", href: "/productos" },
            { label: "Ver reportes", href: "/reportes" }
          ],
          color: "#f59e0b"
        });
      }
    }

    // === ANÁLISIS 6: Objetivo del mes ===
    const diaActual = hoy.getDate();
    const diasDelMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
    const proyeccionFinMes = (totalMesActual / diaActual) * diasDelMes;

    // Si el crecimiento mensual promedio sugiere que vas a superar el anterior
    if (totalMesAnterior > 0) {
      const proyeccionVsAnterior = ((proyeccionFinMes - totalMesAnterior) / totalMesAnterior) * 100;

      if (proyeccionVsAnterior > 10 && proyeccionVsAnterior < 100) {
        recomendaciones.push({
          tipo: "exito",
          icono: "🎯",
          titulo: `Vas camino a superar el mes pasado en ${Math.round(proyeccionVsAnterior)}%`,
          descripcion: `Si mantenés el ritmo, cerrás el mes con $${Math.round(proyeccionFinMes).toLocaleString("es-AR")}`,
          acciones: [
            { label: "Ver reportes", href: "/reportes" }
          ],
          color: "#16a34a"
        });
      }
    }

    // === ANÁLISIS 7: Clientes recurrentes ===
    const conteoClientes: Record<string, { nombre: string; operaciones: number; total: number }> = {};

    for (const v of todasVentas) {
      if (!v.cliente_id) continue;
      const cliente = (clientes.data || []).find(c => c.id === v.cliente_id);
      if (!cliente) continue;
      if (!conteoClientes[v.cliente_id]) {
        conteoClientes[v.cliente_id] = { nombre: cliente.nombre, operaciones: 0, total: 0 };
      }
      conteoClientes[v.cliente_id].operaciones += 1;
      conteoClientes[v.cliente_id].total += Number(v.total);
    }

    const recurrentes = Object.values(conteoClientes).filter(c => c.operaciones >= 3);

    if (recurrentes.length > 0) {
      recomendaciones.push({
        tipo: "oportunidad",
        icono: "⭐",
        titulo: `${recurrentes.length} ${recurrentes.length === 1 ? "cliente recurrente" : "clientes recurrentes"}`,
        descripcion: `Son tus mejores clientes. Considerá darles un beneficio exclusivo`,
        acciones: [
          { label: "Ver ranking VIP", href: "/clientes-vip" },
          { label: "Ver sistema de puntos", href: "/puntos" }
        ],
        color: "#8b5cf6"
      });
    }

    return ok({
      recomendaciones,
      resumen: {
        total_recomendaciones: recomendaciones.length,
        urgentes: recomendaciones.filter(r => r.tipo === "urgente").length,
        oportunidades: recomendaciones.filter(r => r.tipo === "oportunidad").length,
        exitos: recomendaciones.filter(r => r.tipo === "exito").length
      }
    });
  } catch (e) {
    return handleApiError(e);
  }
}