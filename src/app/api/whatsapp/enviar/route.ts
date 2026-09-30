import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

// 🚫 WhatsApp desactivado temporalmente hasta configurar Meta
const WHATSAPP_HABILITADO = false;

export async function POST(req: NextRequest) {
  try {
    const { telefono, mensaje } = await req.json();

    if (!telefono || !mensaje) {
      return ok({ enviado: false, motivo: "Faltan datos" });
    }

    // 🚫 Si WhatsApp no está configurado, devolvemos OK pero no enviamos
    if (!WHATSAPP_HABILITADO) {
      return ok({
        enviado: false,
        motivo: "WhatsApp no configurado. Activá WHATSAPP_HABILITADO cuando tengas las credenciales de Meta."
      });
    }

    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const token = process.env.WHATSAPP_TOKEN;

    if (!phoneId || !token) {
      return ok({
        enviado: false,
        motivo: "Faltan credenciales de WhatsApp en variables de entorno"
      });
    }

    // Enviar por Meta Cloud API
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: telefono,
          type: "text",
          text: { body: mensaje }
        })
      }
    );

    const metaRes = await res.json();
    if (!res.ok) {
      throw new Error(metaRes.error?.message || "Error al enviar por WhatsApp");
    }

    // Guardar en BD
    const { data: conv } = await supabase
      .from("whatsapp_conversaciones")
      .select("id")
      .eq("telefono", telefono)
      .maybeSingle();

    await supabase.from("whatsapp_mensajes").insert({
      telefono,
      direccion: "saliente",
      contenido: mensaje,
      tipo: "text",
      conversacion_id: conv?.id || null
    });

    if (conv) {
      await supabase
        .from("whatsapp_conversaciones")
        .update({
          ultimo_mensaje: mensaje,
          ultima_actividad: new Date().toISOString()
        })
        .eq("id", conv.id);
    }

    return ok({ enviado: true, metaRes });
  } catch (e) {
    return handleApiError(e);
  }
}