# 🛢️ Aceite App

Sistema de gestión para negocio de cambio de aceite y venta de repuestos.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL + Auth)
- **TypeScript**
- **Tailwind / CSS custom**

## Funcionalidades

- 👥 Clientes y vehículos
- 📦 Inventario (aceites, filtros, repuestos)
- 🛒 Ventas directas con descuento de stock
- 🔧 Órdenes de servicio (cambio de aceite)
- 💰 Pagos (efectivo, transferencia)
- 📊 Cuenta corriente y pagos a cuenta
- 📈 Reportes (ventas, cierre de caja, stock bajo)

## Setup local

1. Clonar el repo
2. `npm install`
3. Crear `.env.local` con las credenciales de Supabase
4. Correr el schema SQL en Supabase
5. `npm run dev`

## Deploy

- Vercel (frontend + API routes)
- Supabase (base de datos)

## Licencia

Privado - uso personal
