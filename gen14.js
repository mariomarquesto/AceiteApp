const fs = require("fs");
let css = fs.readFileSync("src/app/globals.css", "utf8");

const responsiveCss = `

/* ============================================
   RESPONSIVE - MOBILE FIRST FIX
   ============================================ */

/* Contenedor principal */
main {
  padding: 16px !important;
}

/* ============================================
   NAVBAR en móvil
   ============================================ */
@media (max-width: 768px) {
  .navbar-inner {
    padding: 0 12px !important;
    height: 60px !important;
    gap: 0 !important;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .navbar-inner::-webkit-scrollbar {
    display: none;
  }
  .navbar-logo {
    margin-right: 12px !important;
    padding: 4px 6px !important;
    flex-shrink: 0;
  }
  .navbar-logo-icon {
    width: 34px !important;
    height: 34px !important;
    font-size: 17px !important;
  }
  .navbar-logo-title {
    font-size: 15px !important;
  }
  .navbar-logo-sub {
    display: none !important;
  }
  .navbar-links {
    gap: 2px !important;
    flex: 1;
    min-width: 0;
  }
  .navbar-link {
    padding: 8px 10px !important;
    font-size: 13px !important;
    white-space: nowrap;
  }
  .navbar-link span:not(.navbar-link-icon) {
    display: none;
  }
  .navbar-cta {
    padding: 8px 12px !important;
    font-size: 13px !important;
    flex-shrink: 0;
  }
  .navbar-cta span:last-child {
    display: none;
  }
}

/* ============================================
   PAGE HEADER
   ============================================ */
@media (max-width: 640px) {
  .page-header {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 12px !important;
    margin-bottom: 20px !important;
  }
  .page-title {
    font-size: 22px !important;
  }
  .page-subtitle {
    font-size: 13px !important;
  }
}

/* ============================================
   GRIDS en móvil (métricas, accesos, etc)
   ============================================ */
@media (max-width: 640px) {
  /* Forzar 1 columna en todos los grids inline */
  main [style*="grid-template-columns"] {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }
}

/* ============================================
   CARD en móvil
   ============================================ */
@media (max-width: 640px) {
  .card {
    padding: 18px !important;
  }
  .card-value {
    font-size: 26px !important;
  }
  .card-icon {
    width: 36px !important;
    height: 36px !important;
    font-size: 18px !important;
  }
}

/* ============================================
   QUICK ACCESS en móvil
   ============================================ */
@media (max-width: 640px) {
  .quick-access {
    padding: 14px !important;
    gap: 12px !important;
  }
  .quick-access-icon {
    width: 44px !important;
    height: 44px !important;
    font-size: 20px !important;
  }
  .quick-access-title {
    font-size: 14px !important;
  }
  .quick-access-subtitle {
    font-size: 11px !important;
  }
  .quick-access-arrow {
    font-size: 16px !important;
  }
}

/* ============================================
   TABLAS en móvil (scroll horizontal)
   ============================================ */
@media (max-width: 768px) {
  .table-wrapper {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
    border-radius: 12px;
  }
  .table {
    min-width: 600px;
  }
  .table th,
  .table td {
    padding: 12px 14px !important;
    font-size: 13px !important;
  }
  .table th {
    font-size: 11px !important;
  }
}

/* ============================================
   FORMS en móvil
   ============================================ */
@media (max-width: 640px) {
  .form-card {
    padding: 20px !important;
    max-width: 100% !important;
  }
  /* Grid de 2 columnas en forms -> 1 columna */
  .form-card [style*="grid-template-columns"] {
    grid-template-columns: 1fr !important;
  }
}

/* ============================================
   BOTONES en móvil
   ============================================ */
@media (max-width: 640px) {
  .btn {
    padding: 12px 16px !important;
    font-size: 14px !important;
    width: 100%;
  }
  /* Si hay grupo de botones, apilados */
  [style*="display: flex"][style*="gap"] > .btn {
    width: 100%;
  }
}

/* ============================================
   INPUTS en móvil (evitar zoom automático en iOS)
   ============================================ */
@media (max-width: 640px) {
  .input,
  input,
  select,
  textarea {
    font-size: 16px !important;
  }
}

/* ============================================
   OVERFLOW GLOBAL
   ============================================ */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

* {
  max-width: 100%;
}

/* Fix para elementos con width fijo */
@media (max-width: 640px) {
  [style*="max-width: 500"],
  [style*="max-width: 560"],
  [style*="max-width: 600"] {
    max-width: 100% !important;
  }
}
`;

if (!css.includes("RESPONSIVE - MOBILE FIRST FIX")) {
  css += responsiveCss;
  fs.writeFileSync("src/app/globals.css", css, "utf8");
  console.log("OK: responsive agregado a globals.css");
} else {
  console.log("responsive ya estaba");
}

// ============================================
// Fix específico: los grids inline del dashboard/ventas
// ============================================
console.log("\nAhora actualizando page.tsx y ventas/nueva con clases responsive...");
