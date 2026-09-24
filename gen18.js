const fs = require("fs");

const navbar = `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const links = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/clientes", label: "Clientes", icon: "👥" },
  { href: "/productos", label: "Productos", icon: "📦" },
  { href: "/ventas", label: "Ventas", icon: "💰" },
  { href: "/cuenta-corriente", label: "Cuenta cte.", icon: "📊" }
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className={"navbar" + (scrolled ? " navbar-scrolled" : "")}>
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            <div className="navbar-logo-icon">🛢️</div>
            <div className="navbar-logo-text">
              <div className="navbar-logo-title">Aceite App</div>
              <div className="navbar-logo-sub">TALLER & REPUESTOS</div>
            </div>
          </Link>

          <div className="navbar-links">
            {links.map(l => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={"navbar-link" + (active ? " navbar-link-active" : "")}
                >
                  <span className="navbar-link-icon">{l.icon}</span>
                  <span className="navbar-link-label">{l.label}</span>
                </Link>
              );
            })}
          </div>

          <Link href="/ventas/nueva" className="navbar-cta">
            <span className="navbar-cta-icon">+</span>
            <span className="navbar-cta-label">Venta</span>
          </Link>

          <button
            className="navbar-burger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {menuOpen && (
          <div className="navbar-mobile-menu">
            {links.map(l => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={"navbar-mobile-link" + (active ? " active" : "")}
                >
                  <span style={{ fontSize: 18 }}>{l.icon}</span>
                  <span>{l.label}</span>
                </Link>
              );
            })}
            <Link href="/ventas/nueva" className="navbar-mobile-cta">
              <span>+</span>
              <span>Nueva venta</span>
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
`;
fs.writeFileSync("src/app/components/Navbar.tsx", navbar, "utf8");
console.log("OK: Navbar.tsx reescrito");

// ============================================
// CSS nuevo del navbar (mobile-friendly)
// ============================================
let css = fs.readFileSync("src/app/globals.css", "utf8");

// Remover CSS viejo del navbar
const startMarker = "/* ============================================\n   NAVBAR";
const endMarker = "/* ============================================\n   QUICK ACCESS";
const startIdx = css.indexOf(startMarker);
const endIdx = css.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  css = css.slice(0, startIdx) + css.slice(endIdx);
  console.log("OK: CSS viejo del navbar removido");
}

// Agregar CSS nuevo
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
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  height: 68px;
  gap: 8px;
  position: relative;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 10px;
  transition: background 0.2s;
  flex-shrink: 0;
  margin-right: 16px;
}

.navbar-logo:hover {
  background: rgba(56, 189, 248, 0.1);
}

.navbar-logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(14,165,233,0.4);
  flex-shrink: 0;
}

.navbar-logo-text { line-height: 1.1; }

.navbar-logo-title {
  font-weight: 800;
  font-size: 17px;
  background: linear-gradient(135deg, #38bdf8, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navbar-logo-sub {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.navbar-links {
  display: flex;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.navbar-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #cbd5e1;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.navbar-link:hover {
  background: rgba(56, 189, 248, 0.12);
  color: #fff;
  transform: translateY(-1px);
}

.navbar-link-active {
  color: #fff;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(14,165,233,0.25), rgba(139,92,246,0.25));
  border: 1px solid rgba(56,189,248,0.4);
  box-shadow: 0 0 20px rgba(14,165,233,0.2);
}

.navbar-link-icon { font-size: 16px; }

.navbar-cta {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  box-shadow: 0 4px 14px rgba(14,165,233,0.4);
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: auto;
}

.navbar-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(14,165,233,0.6);
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
}

.navbar-burger span {
  display: block;
  height: 2px;
  background: #cbd5e1;
  border-radius: 2px;
  transition: all 0.2s;
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
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  color: white;
  font-weight: 700;
  font-size: 15px;
  box-shadow: 0 4px 14px rgba(14,165,233,0.4);
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 900px) {
  .navbar-link-label { display: none; }
  .navbar-link { padding: 10px 12px; }
}

@media (max-width: 768px) {
  .navbar-inner {
    padding: 0 12px;
    height: 60px;
    gap: 6px;
  }
  .navbar-logo {
    margin-right: 0;
    padding: 4px 6px;
  }
  .navbar-logo-icon {
    width: 34px;
    height: 34px;
    font-size: 17px;
  }
  .navbar-logo-title { font-size: 15px; }
  .navbar-logo-sub { display: none; }

  /* Ocultar links desktop, mostrar burger */
  .navbar-links { display: none; }
  .navbar-cta { display: none; }
  .navbar-burger { display: flex; }

  /* Mostrar menu móvil cuando se abre */
  .navbar-mobile-menu { display: flex; }
}

`;
css += navbarCss;
fs.writeFileSync("src/app/globals.css", css, "utf8");
console.log("OK: CSS del navbar actualizado");
