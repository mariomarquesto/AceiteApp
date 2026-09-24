const fs = require("fs");
const path = require("path");

function w(file, content) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content, "utf8");
  console.log("OK:", file);
}

const files = {};

// CLIENTES - LISTAR Y CREAR
files["src/app/api/clientes/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { clienteSchema } from "@/utils/validators";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q");
    const cc = req.nextUrl.searchParams.get("cuenta_corriente");

    let query = supabase.from("clientes").select("*").eq("activo", true);
    if (q) query = query.or("nombre.ilike.%" + q + "%,telefono.ilike.%" + q + "%");
    if (cc === "true") query = query.eq("permite_cuenta_corriente", true);

    const { data, error } = await query.order("nombre");
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = clienteSchema.parse(body);

    const { data: cliente, error } = await supabase
      .from("clientes")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return ok(cliente, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// CLIENTES - POR ID
files["src/app/api/clientes/[id]/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok, ApiError } from "@/lib/errors";
import { clienteSchema } from "@/utils/validators";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("clientes")
      .select("*, vehiculos(*)")
      .eq("id", params.id)
      .single();

    if (error) throw error;
    if (!data) throw new ApiError(404, "Cliente no encontrado");
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = clienteSchema.partial().parse(body);

    const { data: cliente, error } = await supabase
      .from("clientes")
      .update(data)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return ok(cliente);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase
      .from("clientes")
      .update({ activo: false })
      .eq("id", params.id);

    if (error) throw error;
    return ok({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// VEHICULOS
files["src/app/api/vehiculos/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { vehiculoSchema } from "@/utils/validators";

export async function GET(req: NextRequest) {
  try {
    const cliente_id = req.nextUrl.searchParams.get("cliente_id");
    const placa = req.nextUrl.searchParams.get("placa");

    let query = supabase.from("vehiculos").select("*").eq("activo", true);
    if (cliente_id) query = query.eq("cliente_id", cliente_id);
    if (placa) query = query.ilike("placa", "%" + placa + "%");

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = vehiculoSchema.parse(body);

    const { data: v, error } = await supabase
      .from("vehiculos")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return ok(v, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
`;

files["src/app/api/vehiculos/[id]/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { vehiculoSchema } from "@/utils/validators";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("vehiculos")
      .select("*, cliente:clientes(*)")
      .eq("id", params.id)
      .single();

    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = vehiculoSchema.partial().parse(body);

    const { data: v, error } = await supabase
      .from("vehiculos")
      .update(data)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return ok(v);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase
      .from("vehiculos")
      .update({ activo: false })
      .eq("id", params.id);

    if (error) throw error;
    return ok({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// PRODUCTOS
files["src/app/api/productos/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { productoSchema } from "@/utils/validators";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q");
    const tipo = req.nextUrl.searchParams.get("tipo");

    let query = supabase.from("productos").select("*").eq("activo", true);
    if (q) query = query.or("nombre.ilike.%" + q + "%,codigo.ilike.%" + q + "%,marca.ilike.%" + q + "%");
    if (tipo) query = query.eq("tipo", tipo);

    const { data, error } = await query.order("nombre");
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = productoSchema.parse(body);

    const { data: p, error } = await supabase
      .from("productos")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return ok(p, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
`;

files["src/app/api/productos/[id]/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { productoSchema } from "@/utils/validators";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = productoSchema.partial().parse(body);

    const { data: p, error } = await supabase
      .from("productos")
      .update(data)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return ok(p);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase
      .from("productos")
      .update({ activo: false })
      .eq("id", params.id);

    if (error) throw error;
    return ok({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// MOVIMIENTOS
files["src/app/api/productos/[id]/movimientos/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { z } from "zod";

const schema = z.object({
  tipo: z.enum(["entrada", "salida", "ajuste"]),
  cantidad: z.number().int().positive(),
  motivo: z.string().optional()
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("movimientos_stock")
      .select("*")
      .eq("producto_id", params.id)
      .order("fecha", { ascending: false });

    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const { data: mov, error } = await supabase.rpc("registrar_movimiento_stock", {
      p_producto_id: params.id,
      p_tipo: data.tipo,
      p_cantidad: data.cantidad,
      p_motivo: data.motivo || null,
      p_referencia_id: null,
      p_referencia_tipo: "manual"
    });

    if (error) throw error;
    return ok({ movimiento_id: mov }, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// SERVICIOS
files["src/app/api/servicios/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { servicioSchema } from "@/utils/validators";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("servicios")
      .select("*")
      .eq("activo", true)
      .order("nombre");

    if (error) throw error;
    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = servicioSchema.parse(body);

    const { data: s, error } = await supabase
      .from("servicios")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return ok(s, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
`;

files["src/app/api/servicios/[id]/route.ts"] = `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";
import { servicioSchema } from "@/utils/validators";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = servicioSchema.partial().parse(body);

    const { data: s, error } = await supabase
      .from("servicios")
      .update(data)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return ok(s);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase
      .from("servicios")
      .update({ activo: false })
      .eq("id", params.id);

    if (error) throw error;
    return ok({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
`;

// ESCRIBIR TODOS
for (const [file, content] of Object.entries(files)) {
  w(file, content);
}

console.log("\n✅ Total archivos creados:", Object.keys(files).length);
