import { NextRequest, NextResponse } from "next/server";

// 🚫 WhatsApp desactivado temporalmente hasta configurar Meta
const WHATSAPP_HABILITADO = false;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (!WHATSAPP_HABILITADO) {
    return new NextResponse("WhatsApp no configurado", { status: 200 });
  }

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[WhatsApp] Webhook verificado");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  if (!WHATSAPP_HABILITADO) {
    return NextResponse.json({ ok: true, motivo: "WhatsApp no configurado" });
  }

  try {
    const body = await req.json();
    // ... resto del código original
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: true });
  }
}