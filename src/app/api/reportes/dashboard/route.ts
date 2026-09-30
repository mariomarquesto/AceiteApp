import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET() {
  try {
    const hoy = new Date();

    // Últimos 6 meses (para el gráfico)
    const meses: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const inicio = d.toISOString().slice(0, 10);
      const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
      meses.push({
        mes: inicio.slice(0, 7),
        inicio,
        fin,
        total: 0,
        dias: new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
      });
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

    // Comparación mes actual vs anterior
    const mesActual = meses[meses.length - 1].total;
    const mesAnterior = meses[meses.length - 2].total;
    const diferencia = mesActual - mesAnterior;
    const porcentaje = mesAnterior > 0 ? (diferencia / mesAnterior) * 100 : 0;

    // Promedios
    const promedio = meses.reduce((s, m) => s + m.total, 0) / meses.length;

    // === TENDENCIA (regresión lineal simple) ===
    const n = meses.length;
    const sumX = meses.reduce((s, _, i) => s + i, 0);
    const sumY = meses.reduce((s, m) => s + m.total, 0);
    const sumXY = meses.reduce((s, m, i) => s + i * m.total, 0);
    const sumX2 = meses.reduce((s, _, i) => s + i * i, 0);

    const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercepto = (sumY - pendiente * sumX) / n;

    // === PROYECCIONES ===

    // 1. Proyección lineal (tendencia)
    const proyeccionLineal = [1, 2, 3].map(i => ({
      mes: `Mes ${i}`,
      total: Math.max(0, pendiente * (n - 1 + i) + intercepto)
    }));

    // 2. Proyección por promedio de los últimos 3 meses
    const ultimos3 = meses.slice(-3);
    const promedio3 = ultimos3.reduce((s, m) => s + m.total, 0) / 3;
    const proyeccionPromedio = [1, 2, 3].map(i => ({
      mes: `Mes ${i}`,
      total: promedio3
    }));

    // 3. Proyección con factor de crecimiento (basado en la tendencia)
    const factorCrecimiento = mesAnterior > 0 ? (mesActual / mesAnterior) : 1;
    const factorSuavizado = 1 + (factorCrecimiento - 1) * 0.5; // Suavizar
    const proyeccionCrecimiento = [1, 2, 3].map(i => ({
      mes: `Mes ${i}`,
      total: mesActual * Math.pow(factorSuavizado, i)
    }));

    // === PROYECCIÓN DEL MES ACTUAL (a fin de mes) ===
    const diaActual = hoy.getDate();
    const diasDelMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
    const proyeccionFinDeMes = diaActual > 0 ? (mesActual / diaActual) * diasDelMes : 0;
    const faltaParaCerrar = proyeccionFinDeMes - mesActual;

    // === TOP PRODUCTOS ===
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

    // === TOP CLIENTES ===
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

    return ok({
      meses,
      topProductos,
      topClientes,
      comparacion: {
        mes_actual: mesActual,
        mes_anterior: mesAnterior,
        diferencia,
        porcentaje: Number(porcentaje.toFixed(2))
      },
      promedio,
      proyeccion: proyeccionLineal,
      proyecciones: {
        lineal: proyeccionLineal,
        promedio: proyeccionPromedio,
        crecimiento: proyeccionCrecimiento
      },
      tendencia: Number(pendiente.toFixed(2)),
      factorCrecimiento: Number(factorSucrecimiento => 0),
      finDeMes: {
        diaActual,
        diasDelMes,
        proyeccion: proyeccionFinDeMes,
        faltaParaCerrar,
        porcentajeCompletado: diasDelMes > 0 ? (diaActual / diasDelMes) * 100 : 0
      }
    });
  } catch (e) {
    return handleApiError(e);
  }
}