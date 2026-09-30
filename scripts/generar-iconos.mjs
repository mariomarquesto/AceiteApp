import sharp from "sharp";
import { mkdirSync } from "fs";

// ============================================
// SVG del logo ARN (el mismo del Navbar)
// ============================================
const logoSVG = `
<svg width="512" height="512" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="120" rx="24" fill="#0f172a"/>
  <path d="M 25 15 L 95 15 L 95 70 L 60 105 L 25 70 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round" transform="translate(0, 8)"/>
  <circle cx="60" cy="63" r="22" fill="none" stroke="#f97316" stroke-width="4"/>
  <path d="M 60 48 Q 50 60 50 68 Q 50 76 60 76 Q 70 76 70 68 Q 70 60 60 48 Z" fill="#0ea5e9"/>
</svg>
`;

mkdirSync("public", { recursive: true });

// Generar los 4 tamaños
const tamanios = [
  { size: 192, archivo: "public/icon-192.png" },
  { size: 512, archivo: "public/icon-512.png" },
  { size: 180, archivo: "public/apple-touch-icon.png" },
  { size: 32, archivo: "public/favicon.png" }
];

for (const { size, archivo } of tamanios) {
  await sharp(Buffer.from(logoSVG))
    .resize(size, size)
    .png()
    .toFile(archivo);
  console.log(`✅ ${archivo} (${size}x${size})`);
}

console.log("\n🎉 Íconos generados correctamente");