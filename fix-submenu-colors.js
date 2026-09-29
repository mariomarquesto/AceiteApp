const fs = require("fs");
let css = fs.readFileSync("src/app/globals.css", "utf8");

// Eliminar el CSS viejo del submenú
const startMarker = "/* ============================================\n   SUBMENU \"MÁS\"";
const idx = css.indexOf(startMarker);

if (idx !== -1) {
  css = css.slice(0, idx);
  console.log("OK: CSS viejo del submenú eliminado");
}

// Agregar CSS nuevo con colores correctos
css += `
/* ============================================
   SUBMENU "MÁS" — Aparece debajo del navbar
   ============================================ */
.navbar-submenu {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 20px;
  background: #1e293b;
  border-top: 1px solid rgba(56, 189, 248, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  animation: submenuSlide 0.2s ease;
  justify-content: center;
}

@keyframes submenuSlide {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.navbar-submenu-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  color: #ffffff !important;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.25);
  white-space: nowrap;
}

.navbar-submenu-link:hover {
  background: rgba(56, 189, 248, 0.25);
  color: #ffffff !important;
  border-color: rgba(56, 189, 248, 0.6);
  transform: translateY(-2px);
}

.navbar-submenu-link-active {
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  color: #ffffff !important;
  font-weight: 700;
  border-color: #38bdf8;
}

@media (max-width: 900px) {
  .navbar-submenu {
    display: none;
  }
}
`;

fs.writeFileSync("src/app/globals.css", css, "utf8");
console.log("✅ CSS del submenú con colores correctos");
