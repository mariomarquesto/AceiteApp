import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

// 🚫 WhatsApp/IA desactivado temporalmente hasta configurar Meta
// Cuando tengas las credenciales, cambiá esto a true
const IA_HABILITADA = false;

// ============================================
// Helper: enviar mensaje por WhatsApp
// ============================================
async function enviarWhatsApp(to: string, texto: string) {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;

  if (!phoneId || !token) {
    console.warn("[IA] Faltan credenciales de WhatsApp");
    return null;
  }

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
        to,
        type: "text",
        text: { body: texto }
      })
    }
  );

  return res.json();
}

// ============================================
// Helper: detectar intención simple (sin IA)
// ============================================
function detectarIntencion(mensaje: string): string {
  const m = mensaje.toLowerCase();

  if (/(turno|agendar|cita|reservar)/.test(m)) return "turno";
  if (/(precio|cuesta|cuanto|cuánto|vale)/.test(m)) return "precio";
  if (/(promo|descuento|oferta)/.test(m)) return "promo";
  if (/(horario|abren|cierran|abierto)/.test(m)) return "horario";
  if (/(aceite|cambio|service)/.test(m)) return "servicio";
  if (/(hola|buenas|buen día|buenas tardes)/.test(m)) return "saludo";
  return "general";
}

// ============================================
// Helper: generar respuesta según intención
// ============================================
async function generarRespuesta(
  telefono: string,
  mensaje: string,
  intencion: string,
  config: any
): Promise<string> {
  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nombre")
    .ilike("telefono", `%${telefono.slice(-8)}%`)
    .maybeSingle();

  const saludo = cliente?.nombre
    ? `¡Hola ${cliente.nombre}! 👋`
    : "¡Hola! 👋";

  switch (intencion) {
    case "saludo":
      return `${saludo} ${config?.mensaje_bienvenida || "¿En qué te puedo ayudar?"}\n\nPodés consultarme por:\n• Precios\n• Turnos\n• Promociones`;

    case "precio": {
      const { data: servicios } = await supabase
        .from("servicios")
        .select("nombre, precio")
        .eq("activo", true)
        .limit(5);

      if (!servicios || servicios.length === 0) {
        return `${saludo} Decime qué servicio necesitás y te paso el precio.`;
      }

      const lista = servicios
        .map(s => `• ${s.nombre}: $${s.precio}`)
        .join("\n");

      return `${saludo} Estos son nuestros servicios:\n\n${lista}\n\n¿Te agendo un turno?`;
    }

    case "promo": {
      const hoy = new Date().toISOString().slice(0, 10);
      const { data: promos } = await supabase
        .from("promociones")
        .select("titulo, descripcion, descuento_porcentaje, descuento_monto")
        .eq("activa", true)
        .lte("fecha_inicio", hoy)
        .gte("fecha_fin", hoy)
        .limit(3);

      if (!promos || promos.length === 0) {
        return `${saludo} Por ahora no tenemos promos activas, pero podemos ofrecerte un buen precio. ¿Qué necesitás?`;
      }

      const lista = promos
        .map(p => {
          const desc = p.descuento_porcentaje
            ? `${p.descuento_porcentaje}%`
            : `$${p.descuento_monto}`;
          return `🎁 *${p.titulo}* (${desc})\n${p.descripcion || ""}`;
        })
        .join("\n\n");

      return `${saludo} ¡Tenemos promos activas!\n\n${lista}\n\n¿Te interesa alguna?`;
    }

    case "horario":
      return `${saludo} Nuestros horarios:\n• Lunes a Viernes: 8:00 a 18:00\n• Sábados: 8:00 a 13:00\n\n¿Querés agendar un turno?`;

    case "turno":
      return `${saludo} ¡Dale! Para agendarte un turno necesito:\n1. Tu nombre\n2. Marca y modelo del auto\n3. Día y horario que te quede cómodo`;

    case "servicio":
      return `${saludo} Hacemos cambio de aceite y filtros, y vendemos repuestos. ¿Qué auto tenés y qué necesitás?`;

    default:
      return `${saludo} Recibí tu mensaje: "${mensaje}". En breve te respondo. Si querés, consultame por precios, turnos o promos.`;
  }
}

// ============================================
// POST - Recibe mensaje y responde
// ============================================
export async function POST(req: NextRequest) {
  try {
    // 🚫 Si la IA está desactivada, no hacemos nada
    if (!IA_HABILITADA) {
      return ok({
        respondido: false,
        motivo: "IA/WhatsApp desactivado. Activá IA_HABILITADA cuando configures Meta."
      });
    }

    const body = await req.json();
    const { telefono, mensaje, conversacion_id } = body;

    if (!telefono || !mensaje) {
      return ok({ respondido: false, motivo: "Faltan datos" });
    }

    const { data: config } = await supabase
      .from("configuracion_descuentos")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (config && config.bot_activo === false) {
      return ok({ respondido: false, motivo: "Bot desactivado" });
    }

    const intencion = detectarIntencion(mensaje);
    const respuesta = await generarRespuesta(
      telefono,
      mensaje,
      intencion,
      config
    );

    await enviarWhatsApp(telefono, respuesta);

    await supabase.from("whatsapp_mensajes").insert({
      telefono,
      direccion: "saliente",
      contenido: respuesta,
      tipo: "text",
      conversacion_id: conversacion_id || null
    });

    return ok({
      respondido: true,
      intencion,
      respuesta
    });
  } catch (e) {
    return handleApiError(e);
  }
}