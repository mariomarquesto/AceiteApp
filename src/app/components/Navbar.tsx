"use client";

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
          <span>+</span>
          <span>Venta</span>
        </Link>

        <button
          type="button"
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
  );
}
