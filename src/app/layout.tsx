import "./globals.css";
import type { Metadata, Viewport } from "next";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "ARN Lubricentro y Repuestos",
  description: "Sistema de gestion para lubricentro y venta de repuestos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ARN"
  },
  icons: {
    icon: "/logo-icon.svg",
    apple: "/icon-192.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gradient-page">
        <Navbar />
        <main className="main-container">
          {children}
        </main>
      </body>
    </html>
  );
}