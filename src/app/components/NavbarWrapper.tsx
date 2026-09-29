"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  // No mostrar navbar en el portal del cliente
  if (pathname.startsWith("/portal/")) {
    return null;
  }

  return <Navbar />;
}