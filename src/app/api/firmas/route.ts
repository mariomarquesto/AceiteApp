import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const { base64, tipo, id } = await req.json();

    if (!base64 || !tipo || !id) {
      return ok({ error: "Faltan datos" }, 400);
    }

    // Convertir base64 a buffer
    const buffer = Buffer.from(base64, "base64");

    // Nombre del archivo
    const fileName = `${tipo}-${id}-${Date.now()}.png`;

    console.log("Subiendo a firmas2:", fileName);

    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("firmas2")
      .upload(fileName, buffer, {
        contentType: "image/png",
        upsert: true
      });

    if (uploadError) {
      console.error("Error subiendo firma:", uploadError);
      throw uploadError;
    }

    console.log("Firma subida OK");

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from("firmas2")
      .getPublicUrl(fileName);

    const url = urlData.publicUrl;
    console.log("URL de firma:", url);

    // Guardar en la tabla correspondiente
    const tabla = tipo === "orden" ? "ordenes" : "ventas";
    const { error: updateError } = await supabase
      .from(tabla)
      .update({
        firma_url: url,
        firma_fecha: new Date().toISOString()
      })
      .eq("id", id);

    if (updateError) throw updateError;

    return ok({ url }, 201);
  } catch (e) {
    return handleApiError(e);
  }
}