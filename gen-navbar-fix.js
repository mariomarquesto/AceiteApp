const fs = require("fs");
let css = fs.readFileSync("src/app/globals.css", "utf8");

// Buscar la sección del navbar y reemplazarla
const startMarker = "/* ============================================\n   NAVBAR";
const endMarker = "/* ============================================\n   QUICK ACCESS";

const startIdx = css.indexOf(startMarker);
const endIdx = css.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  css = css.slice(0, startIdx) + css.slice(endIdx);
  console.log("OK: CSS viejo del navbar removido");
}

const navbarCss = `/* ============================================
   NAVBAR
   ============================================ */
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
  border-bottom: 1px solid transparent;
}

.navbar-scrolled {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  border-bottom: 1px solid rgba(14,165,233,0.3);
}

.navbar-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  height: 68px;
  gap: 4px;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 10px;
  transition: background 0.2s;
  flex-shrink: 0;
  margin-right: 8px;
}

.navbar-logo:hover {
  background: rgba(56, 189, 248, 0.1);
}

.navbar-logo-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.navbar-logo-text { line-height: 1.1; }

.navbar-logo-title {
  font-weight: 900;
  font-size: 17px;
  color: #ffffff;
  letter-spacing: -0.5px;
  line-height: 1;
}

.navbar-logo-sub {
  font-size: 8px;
  color: #38bdf8;
  font-weight: 700;
  letter-spacing: 0.8px;
  margin-top: 2px;
}

.navbar-links {
  display: flex;
  gap: 2px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 0 4px;
}

.navbar-links::-webkit-scrollbar {
  display: none;
}

.navbar-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #cbd5e1;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.navbar-link:hover {
  background: rgba(56, 189, 248, 0.12);
  color: #fff;
}

.navbar-link-active {
  color: #fff;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(14,165,233,0.25), rgba(139,92,246,0.25));
  border: 1px solid rgba(56,189,248,0.4);
  box-shadow: 0 0 16px rgba(14,165,233,0.2);
}

.navbar-link-icon { font-size: 14px; }

.navbar-cta {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 9px 16px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 4px 14px rgba(249,115,22,0.4);
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: 8px;
  white-space: nowrap;
}

.navbar-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(249,115,22,0.6);
}

.navbar-burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  padding: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  flex-shrink: 0;
  margin-left: 8px;
}

.navbar-burger span {
  display: block;
  height: 2px;
  background: #cbd5e1;
  border-radius: 2px;
}

.navbar-mobile-menu {
  display: none;
  flex-direction: column;
  padding: 8px 12px 16px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-top: 1px solid rgba(56,189,248,0.2);
}

.navbar-mobile-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  color: #cbd5e1;
  font-weight: 500;
  font-size: 15px;
  transition: all 0.15s;
}

.navbar-mobile-link:hover,
.navbar-mobile-link.active {
  background: rgba(56, 189, 248, 0.15);
  color: #fff;
}

.navbar-mobile-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  padding: 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
  font-weight: 700;
  font-size: 15px;
  box-shadow: 0 4px 14px rgba(249,115,22,0.4);
}

/* Tablet: ocultar labels, solo iconos */
@media (max-width: 1200px) {
  .navbar-link-label { display: none; }
  .navbar-link { padding: 9px 11px; }
}

/* Móvil: burger menu */
@media (max-width: 900px) {
  .navbar-inner {
    padding: 0 12px;
    height: 60px;
    gap: 4px;
  }
  .navbar-logo {
    margin-right: 0;
    padding: 4px 6px;
  }
  .navbar-logo-icon { width: 34px; height: 34px; }
  .navbar-logo-title { font-size: 15px; }
  .navbar-logo-sub { display: none; }

  .navbar-links { display: none; }
  .navbar-cta { display: none; }
  .navbar-burger { display: flex; }

  .navbar-mobile-menu { display: flex; }
}

`;

css += navbarCss;
fs.writeFileSync("src/app/globals.css", css, "utf8");
console.log("OK: CSS del navbar actualizado sin superposiciones");
