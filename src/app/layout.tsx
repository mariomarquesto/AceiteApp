import "./globals.css";
import type { Metadata, Viewport } from "next";
import NavbarWrapper from "./components/NavbarWrapper";

export const metadata: Metadata = {
  title: "ARN Lubricentro y Repuestos",
  description: "Sistema de gestion para lubricentro y venta de repuestos",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-icon.svg",
    apple: "/icon-192.svg"
  }
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gradient-page">
        <NavbarWrapper />
        <main className="main-container">
          {children}
        </main>
      </body>
    </html>
  );
}