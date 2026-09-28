const fs = require("fs");
const path = require("path");

function w(file, content) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content, "utf8");
  console.log("OK:", file);
}

// ============================================
// ENDPOINT - Plantillas
// ============================================
w("src/app/api/plantillas/route.ts", `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("plantillas_recordatorio")
      .select("*")
      .eq("activo", true)
      .order("tipo_uso");

    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, mensaje } = body;

    if (!id || !mensaje) {
      return ok({ error: "Faltan datos" }, 400);
    }

    const { data, error } = await supabase
      .from("plantillas_recordatorio")
      .update({ mensaje })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}
`);

// ============================================
// ENDPOINT - Generar recordatorio
// ============================================
w("src/app/api/vehiculos/[id]/recordatorio/route.ts", `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok, ApiError } from "@/lib/errors";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: vehiculo, error } = await supabase
      .from("vehiculos")
      .select("*, cliente:clientes(*)")
      .eq("id", params.id)
      .single();

    if (error) throw error;
    if (!vehiculo) throw new ApiError(404, "Vehículo no encontrado");
    if (!vehiculo.cliente?.telefono) {
      throw new ApiError(400, "El cliente no tiene teléfono cargado");
    }

    // Buscar plantilla según tipo de uso
    const { data: plantilla } = await supabase
      .from("plantillas_recordatorio")
      .select("*")
      .eq("tipo_uso", vehiculo.tipo_uso || "particular")
      .eq("canal", "whatsapp")
      .eq("activo", true)
      .single();

    const mensajeTemplate = plantilla?.mensaje ||
      "Hola {nombre}! Te escribo de ARN Lubricentro. Tu {vehiculo} ya está en los {km} km. ¿Coordinamos el cambio de aceite?";

    // Calcular datos para reemplazar
    const kmActual = Number(vehiculo.km_actual) || 0;
    const intervaloKm = Number(vehiculo.intervalo_km) || 10000;
    const proximoCambioKm = Number(vehiculo.proximo_cambio_km) || (kmActual + intervaloKm);
    const meses = Number(vehiculo.intervalo_meses) || 6;

    let fechaUltimoCambio = "—";
    if (vehiculo.proximo_cambio_fecha) {
      const fecha = new Date(vehiculo.proximo_cambio_fecha);
      fecha.setMonth(fecha.getMonth() - meses);
      fechaUltimoCambio = fecha.toLocaleDateString("es-AR");
    }

    const vehiculoNombre = [vehiculo.marca, vehiculo.modelo].filter(Boolean).join(" ") || "vehículo";

    const mensaje = mensajeTemplate
      .replace(/{nombre}/g, vehiculo.cliente.nombre || "")
      .replace(/{vehiculo}/g, vehiculoNombre)
      .replace(/{placa}/g, vehiculo.placa || "")
      .replace(/{km}/g, proximoCambioKm.toLocaleString("es-AR"))
      .replace(/{meses}/g, String(meses))
      .replace(/{fecha}/g, fechaUltimoCambio);

    const tel = (vehiculo.cliente.telefono || "").replace(/[^0-9]/g, "");
    const telFinal = tel.startsWith("54") ? tel : "54" + tel;

    return ok({
      mensaje,
      telefono: telFinal,
      cliente: vehiculo.cliente.nombre,
      vehiculo: vehiculoNombre,
      plantilla_usada: plantilla?.tipo_uso || "particular"
    });
  } catch (e) {
    return handleApiError(e);
  }
}
`);

console.log("\\n✅ Endpoints de recordatorio creados");
