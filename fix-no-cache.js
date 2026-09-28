const fs = require("fs");

const archivos = [
  "src/app/clientes/page.tsx",
  "src/app/productos/page.tsx",
  "src/app/vehiculos/page.tsx",
  "src/app/ventas/page.tsx",
  "src/app/cuenta-corriente/page.tsx",
  "src/app/ordenes/page.tsx",
  "src/app/page.tsx"
];

const dynamicLine = 'export const dynamic = "force-dynamic";\nexport const revalidate = 0;\n\n';

for (const archivo of archivos) {
  if (!fs.existsSync(archivo)) {
    console.log("SKIP (no existe):", archivo);
    continue;
  }

  let content = fs.readFileSync(archivo, "utf8");

  // Si ya tiene, saltear
  if (content.includes('export const dynamic = "force-dynamic"')) {
    console.log("SKIP (ya tiene):", archivo);
    continue;
  }

  // Insertar después de los imports
  const lineas = content.split("\n");
  let ultimaLineaImport = -1;

  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i].trim();
    if (l.startsWith("import ")) {
      ultimaLineaImport = i;
    }
  }

  if (ultimaLineaImport >= 0) {
    lineas.splice(ultimaLineaImport + 1, 0, "", 'export const dynamic = "force-dynamic";', 'export const revalidate = 0;');
    content = lineas.join("\n");
  } else {
    content = dynamicLine + content;
  }

  fs.writeFileSync(archivo, content, "utf8");
  console.log("OK:", archivo);
}

console.log("\n✅ Todas las paginas ahora son dinamicas");
