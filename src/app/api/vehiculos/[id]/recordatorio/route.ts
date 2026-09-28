import { NextRequest } from "next/server";
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

    const { data: plantilla } = await supabase
      .from("plantillas_recordatorio")
      .select("*")
      .eq("tipo_uso", vehiculo.tipo_uso || "particular")
      .eq("canal", "whatsapp")
      .eq("activo", true)
      .single();

    const mensajeTemplate = plantilla?.mensaje ||
      "Hola {nombre}! Te escribo de ARN Lubricentro. Tu {vehiculo} ya está en los {km} km. ¿Coordinamos el cambio de aceite?";

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
