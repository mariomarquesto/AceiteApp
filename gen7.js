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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
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
                <span>{l.label}</span>
              </Link>
            );
          })}
        </div>

        <Link href="/ventas/nueva" className="navbar-cta">
          <span>+</span>
          <span>Venta</span>
        </Link>
      </div>
    </nav>
  );
}
`;

fs.writeFileSync("src/app/components/Navbar.tsx", navbar, "utf8");
console.log("OK: Navbar.tsx");

// CSS global
let css = fs.readFileSync("src/app/globals.css", "utf8");

const navbarCss = `

/* ============================================
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
  gap: 4px;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 32px;
  padding: 6px 10px;
  border-radius: 10px;
  transition: background 0.2s;
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
}

.navbar-logo-text {
  line-height: 1.1;
}

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

.navbar-link-icon {
  font-size: 16px;
}

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
}

.navbar-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(14,165,233,0.6);
}

/* Responsive */
@media (max-width: 900px) {
  .navbar-inner {
    padding: 0 12px;
    gap: 2px;
  }
  .navbar-link span:not(.navbar-link-icon) {
    display: none;
  }
  .navbar-link {
    padding: 10px 12px;
  }
  .navbar-logo-sub {
    display: none;
  }
  .navbar-cta span:last-child {
    display: none;
  }
  .navbar-cta {
    padding: 10px 14px;
  }
}
`;

if (!css.includes("/* NAVBAR */")) {
  css += navbarCss;
  fs.writeFileSync("src/app/globals.css", css, "utf8");
  console.log("OK: globals.css actualizado con navbar");
} else {
  console.log("globals.css ya tenia navbar");
}
