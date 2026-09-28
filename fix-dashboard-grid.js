const fs = require("fs");
let css = fs.readFileSync("src/app/globals.css", "utf8");

// 1. Eliminar TODAS las reglas existentes de dashboard-grid
css = css.replace(/\.dashboard-grid\s*\{[^}]*\}/g, "");
css = css.replace(/@media[^{]*\{\s*\.dashboard-grid\s*\{[^}]*\}\s*\}/g, "");

// 2. Agregar la definición limpia al final
css += `

/* ============================================
   DASHBOARD GRID - CARD METRICAS EN FILA
   ============================================ */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  width: 100%;
}

/* Tablet: 2 columnas */
@media (max-width: 1100px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Móvil: 1 columna */
@media (max-width: 600px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
`;

fs.writeFileSync("src/app/globals.css", css, "utf8");
console.log("OK: .dashboard-grid limpiado y redefinido");
