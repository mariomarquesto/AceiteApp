const fs = require("fs");
let css = fs.readFileSync("src/app/globals.css", "utf8");

// Buscar y eliminar reglas viejas de dashboard-grid
css = css.replace(/\.dashboard-grid\s*\{[^}]*\}/g, "");
css = css.replace(/@media[^{]*\{\s*\.dashboard-grid\s*\{[^}]*\}\s*\}/g, "");

// Reagregar al final con max-width más restrictivo
css += `

/* ============================================
   DASHBOARD GRID - CARD METRICAS
   ============================================ */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
}

@media (max-width: 1100px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

/* ============================================
   QUICK GRID - ACCESOS RAPIDOS
   ============================================ */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  width: 100%;
}

@media (max-width: 1100px) {
  .quick-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .quick-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
`;

fs.writeFileSync("src/app/globals.css", css, "utf8");
console.log("OK: CSS del dashboard-grid actualizado con minmax(0, 1fr)");
