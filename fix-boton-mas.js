const fs = require("fs");
let css = fs.readFileSync("src/app/globals.css", "utf8");

// Eliminar regla vieja si existe
css = css.replace(/\.navbar-mas-button\s*\{[^}]*\}/g, "");

// Agregar CSS del botón "Más"
if (!css.includes(".navbar-mas-button")) {
  css += `

/* ============================================
   BOTÓN "MÁS" del navbar
   ============================================ */
.navbar-mas-button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #cbd5e1;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.navbar-mas-button:hover {
  background: rgba(56, 189, 248, 0.12);
  color: #ffffff;
}

.navbar-mas-button.navbar-mas-active {
  color: #ffffff;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(14,165,233,0.25), rgba(139,92,246,0.25));
  border: 1px solid rgba(56,189,248,0.4);
}

.navbar-mas-icon {
  font-size: 14px;
  color: inherit;
}

.navbar-mas-text {
  color: inherit;
}

.navbar-mas-arrow {
  font-size: 10px;
  color: inherit;
}
`;
  fs.writeFileSync("src/app/globals.css", css, "utf8");
  console.log("✅ CSS del botón Más agregado");
} else {
  console.log("ℹ️ Ya existía");
}
