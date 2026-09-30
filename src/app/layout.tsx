import "./globals.css";
import type { Metadata, Viewport } from "next";
import NavbarWrapper from "./components/NavbarWrapper";
import Script from "next/script";

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

        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('✅ Service Worker registrado:', registration.scope);
                  },
                  function(err) {
                    console.log('❌ Error al registrar SW:', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}