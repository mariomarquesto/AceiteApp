"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import BusquedaGlobal from "./BusquedaGlobal";
import ThemeToggle from "./ThemeToggle";

const linksPrincipales = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/turnos", label: "Turnos", icon: "📅" },
  { href: "/presupuestos", label: "Presupuestos", icon: "📄" },
  { href: "/tareas", label: "Tareas", icon: "📋" },
  { href: "/clientes", label: "Clientes", icon: "👥" },
  { href: "/ordenes", label: "Órdenes", icon: "🔧" },
  { href: "/ventas", label: "Ventas", icon: "💰" }
];

const linksMas = [
  { href: "/reportes", label: "Reportes", icon: "📈" },
  { href: "/puntos", label: "Puntos", icon: "🎁" },
  { href: "/clientes-vip", label: "VIP", icon: "🏆" },
  { href: "/vehiculos", label: "Vehículos", icon: "🚗" },
  { href: "/productos", label: "Productos", icon: "📦" },
  { href: "/servicios", label: "Servicios", icon: "⚙️" },
  { href: "/cuenta-corriente", label: "Cta. cte.", icon: "💳" }
];

function LogoARN({ size = 42 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M 25 15 L 95 15 L 95 70 L 60 105 L 25 70 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="60" cy="55" r="22" fill="none" stroke="#f97316" strokeWidth="4" />
      <path d="M 60 40 Q 50 52 50 60 Q 50 68 60 68 Q 70 68 70 60 Q 70 52 60 40 Z" fill="#0ea5e9" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [masOpen, setMasOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMasOpen(false);
  }, [pathname]);

  const algunoDeMas = linksMas.some(l => pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href)));

  return (
    <nav className={"navbar" + (scrolled ? " navbar-scrolled" : "")}>
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <LogoARN size={42} />
          <div className="navbar-logo-text">
            <div className="navbar-logo-title">ARN</div>
            <div className="navbar-logo-sub">LUBRICENTRO Y REPUESTOS</div>
          </div>
        </Link>

        <div className="navbar-links">
          {linksPrincipales.map(l => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href} className={"navbar-link" + (active ? " navbar-link-active" : "")}>
                <span className="navbar-link-icon">{l.icon}</span>
                <span className="navbar-link-label">{l.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMasOpen(!masOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "8px 12px",
              borderRadius: 8,
              border: masOpen ? "1px solid rgba(56,189,248,0.4)" : "1px solid transparent",
              background: masOpen
                ? "linear-gradient(135deg, rgba(14,165,233,0.25), rgba(139,92,246,0.25))"
                : "transparent",
              color: "#ffffff",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "all 0.2s ease"
            }}
          >
            <span style={{ fontSize: 14, color: "#ffffff" }}>⚙️</span>
            <span style={{ color: "#ffffff" }} className="navbar-link-label">Más</span>
            <span style={{ fontSize: 10, color: "#ffffff" }}>{masOpen ? "▲" : "▼"}</span>
          </button>
        </div>

        <div className="navbar-search-wrapper">
          <BusquedaGlobal />
        </div>

        <ThemeToggle />

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

      {masOpen && (
        <div className="navbar-submenu">
          {linksMas.map(l => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={"navbar-submenu-link" + (active ? " navbar-submenu-link-active" : "")}
                onClick={() => setMasOpen(false)}
              >
                <span style={{ fontSize: 16 }}>{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {menuOpen && (
        <div className="navbar-mobile-menu">
          {linksPrincipales.map(l => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href} className={"navbar-mobile-link" + (active ? " active" : "")}>
                <span style={{ fontSize: 18 }}>{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            );
          })}
          <div style={{ padding: "12px 16px 4px", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Más opciones
          </div>
          {linksMas.map(l => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href} className={"navbar-mobile-link" + (active ? " active" : "")}>
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