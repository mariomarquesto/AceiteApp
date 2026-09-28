const fs = require("fs");

const layout = `import "./globals.css";
import type { Metadata } from "next";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "ARN Lubricentro y Repuestos",
  description: "Sistema de gestión para lubricentro y venta de repuestos",
  icons: {
    icon: "/logo-icon.svg"
  }
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
`;

fs.writeFileSync("src/app/layout.tsx", layout, "utf8");
console.log("OK: layout.tsx actualizado con branding ARN");
