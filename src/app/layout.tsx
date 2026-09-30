// @ts-expect-error CSS imports are handled by Next.js
import "./globals.css";
import type { Metadata, Viewport } from "next";
import NavbarWrapper from "./components/NavbarWrapper";

export const metadata: Metadata = {
  title: "ARN Lubricentro y Repuestos",
  description: "Sistema de gestión para lubricentro y venta de repuestos",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
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