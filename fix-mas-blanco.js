const fs = require("fs");
let css = fs.readFileSync("src/app/globals.css", "utf8");

// Eliminar todas las reglas viejas del botón Más
css = css.replace(/\.navbar-mas-button\s*\{[^}]*\}/g, "");
css = css.replace(/\.navbar-mas-icon\s*\{[^}]*\}/g, "");
css = css.replace(/\.navbar-mas-text\s*\{[^}]*\}/g, "");
css = css.replace(/\.navbar-mas-arrow\s*\{[^}]*\}/g, "");
css = css.replace(/\.navbar-mas-button\.navbar-mas-active\s*\{[^}]*\}/g, "");
css = css.replace(/\.navbar-mas-button:hover\s*\{[^}]*\}/g, "");

// Agregar CSS forzado con !important
css += `

/* ============================================
   BOTÓN "MÁS" del navbar — FORZADO
   ============================================ */
.navbar-mas-button {
  display: flex !important;
  align-items: center !important;
  gap: 5px !important;
  padding: 8px 12px !important;
  border-radius: 8px !important;
  border: none !important;
  background: transparent !important;
  color: #ffffff !important;
  font-family: inherit !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
}

.navbar-mas-button:hover {
  background: rgba(56, 189, 248, 0.2) !important;
  color: #ffffff !important;
}

.navbar-mas-button.navbar-mas-active {
  color: #ffffff !important;
  font-weight: 700 !important;
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6) !important;
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4) !important;
}

.navbar-mas-icon,
.navbar-mas-text,
.navbar-mas-arrow {
  color: #ffffff !important;
  font-size: inherit !important;
}

.navbar-mas-icon {
  font-size: 15px !important;
}

.navbar-mas-text {
  font-size: 14px !important;
}

.navbar-mas-arrow {
  font-size: 10px !important;
  margin-left: 2px !important;
}
`;

fs.writeFileSync("src/app/globals.css", css, "utf8");
console.log("✅ CSS del botón Más forzado a blanco");
