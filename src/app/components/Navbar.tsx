"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import BusquedaGlobal from "./BusquedaGlobal";

const links = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/reportes", label: "Reportes", icon: "📈" },
  { href: "/tareas", label: "Tareas", icon: "📋" },
  { href: "/clientes", label: "Clientes", icon: "👥" },
  { href: "/clientes-vip", label: "VIP", icon: "🏆" },
  { href: "/vehiculos", label: "Vehículos", icon: "🚗" },
  { href: "/ordenes", label: "Órdenes", icon: "🔧" },
  { href: "/ventas", label: "Ventas", icon: "💰" },
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
          <LogoARN size={42} />
          <div className="navbar-logo-text">
            <div className="navbar-logo-title">ARN</div>
            <div className="navbar-logo-sub">LUBRICENTRO Y REPUESTOS</div>
          </div>
        </Link>

        <div className="navbar-links">
          {links.map(l => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href} className={"navbar-link" + (active ? " navbar-link-active" : "")}>
                <span className="navbar-link-icon">{l.icon}</span>
                <span className="navbar-link-label">{l.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="navbar-search-wrapper">
          <BusquedaGlobal />
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