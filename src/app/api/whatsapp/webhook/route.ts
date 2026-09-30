import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ============================================
// GET - Verificación del webhook (Meta/WhatsApp)
// ============================================
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[WhatsApp] Webhook verificado");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// ============================================
// POST - Recibir mensajes entrantes
// ============================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validar estructura de Meta
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ ok: true });
    }

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;

    // Si no hay mensajes (es un status update), salir
    if (!messages || messages.length === 0) {
      return NextResponse.json({ ok: true });
    }

    const message = messages[0];
    const from = message.from; // teléfono del cliente
    const messageId = message.id;
    const tipo = message.type;

    let texto = "";
    if (tipo === "text") {
      texto = message.text?.body || "";
    } else if (tipo === "button") {
      texto = message.button?.text || "";
    } else if (tipo === "interactive") {
      texto =
        message.interactive?.button_reply?.title ||
        message.interactive?.list_reply?.title ||
        "";
    }

    console.log(`[WhatsApp] Mensaje de ${from}: ${texto}`);

    // ============================================
    // Guardar mensaje entrante
    // ============================================
    const { data: conversacion, error: convError } = await supabase
      .from("whatsapp_conversaciones")
      .upsert(
        {
          telefono: from,
          ultimo_mensaje: texto,
          ultima_actividad: new Date().toISOString()
        },
        { onConflict: "telefono" }
      )
      .select()
      .single();

    if (convError) {
      console.error("[WhatsApp] Error guardando conversación:", convError);
    }

    await supabase.from("whatsapp_mensajes").insert({
      telefono: from,
      direccion: "entrante",
      contenido: texto,
      tipo,
      message_id: messageId,
      conversacion_id: conversacion?.id || null
    });

    // ============================================
    // Responder con IA (llamar al endpoint interno)
    // ============================================
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    fetch(`${baseUrl}/api/ia/responder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telefono: from,
        mensaje: texto,
        conversacion_id: conversacion?.id
      })
    }).catch(err => console.error("[WhatsApp] Error llamando IA:", err));

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[WhatsApp] Error en webhook:", e);
    // Siempre devolver 200 para que Meta no reintente
    return NextResponse.json({ ok: true });
  }
}