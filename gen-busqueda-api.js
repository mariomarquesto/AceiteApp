const fs = require("fs");
const path = require("path");

function w(file, content) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content, "utf8");
  console.log("OK:", file);
}

w("src/app/api/buscar/route.ts", `import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleApiError, ok } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q");
    if (!q || q.length < 2) return ok({ clientes: [], productos: [], vehiculos: [] });

    const [clientes, productos, vehiculos] = await Promise.all([
      supabase
        .from("clientes")
        .select("id, nombre, telefono")
        .or("nombre.ilike.%" + q + "%,telefono.ilike.%" + q + "%")
        .eq("activo", true)
        .limit(5),
      supabase
        .from("productos")
        .select("id, nombre, codigo, precio_venta, stock")
        .or("nombre.ilike.%" + q + "%,codigo.ilike.%" + q + "%")
        .eq("activo", true)
        .limit(5),
      supabase
        .from("vehiculos")
        .select("id, marca, modelo, placa, cliente:clientes(nombre)")
        .or("marca.ilike.%" + q + "%,modelo.ilike.%" + q + "%,placa.ilike.%" + q + "%")
        .eq("activo", true)
        .limit(5)
    ]);

    return ok({
      clientes: clientes.data || [],
      productos: productos.data || [],
      vehiculos: vehiculos.data || []
    });
  } catch (e) {
    return handleApiError(e);
  }
}
`);
console.log("\n✅ Endpoint de busqueda creado");
