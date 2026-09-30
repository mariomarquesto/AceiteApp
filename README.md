<div align="center">

# 🛢️ ARN Lubricentro y Repuestos

### Sistema integral de gestión para lubricentro y venta de repuestos

[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

**Un sistema hecho a medida para la operación diaria de un lubricentro moderno.**

[Ver Demo](https://aceite-app-two.vercel.app) · [Reportar Bug](https://github.com/mariomarquesto/AceiteApp/issues) · [Pedir Feature](https://github.com/mariomarquesto/AceiteApp/issues)

</div>

---

## 📖 Tabla de contenidos

- [🎯 ¿Qué es este sistema?](#-qué-es-este-sistema)
- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Stack tecnológico](#️-stack-tecnológico)
- [🚀 Instalación local](#-instalación-local)
- [📁 Estructura del proyecto](#-estructura-del-proyecto)
- [🗄️ Base de datos](#️-base-de-datos)
- [🔌 Endpoints de la API](#-endpoints-de-la-api)
- [📱 PWA (instalable)](#-pwa-instalable)
- [🎨 Branding](#-branding)
- [🔐 Seguridad](#-seguridad)
- [📊 Roadmap](#-roadmap)
- [📝 Licencia](#-licencia)

---

## 🎯 ¿Qué es este sistema?

**ARN Lubricentro** es un sistema web completo para gestionar un negocio de cambio de aceite y venta de repuestos. Está diseñado para funcionar desde cualquier dispositivo (PC, tablet, celular) y automatiza las tareas repetitivas del negocio.

### 🎁 ¿Qué problema resuelve?

| Antes | Después |
|-------|---------|
| 📓 Cuaderno con clientes anotados | 👥 Base de datos con historial completo |
| 📞 Recordar manualmente cuándo llamar | 🤖 Recordatorios automáticos por WhatsApp |
| 📦 No saber cuánto stock queda | 📊 Alertas de stock bajo en el dashboard |
| 💸 Olvidarse quién debe plata | 💳 Cuenta corriente por cliente |
| 🗓️ Turnos anotados en papel | 📅 Calendario visual de turnos |
| 📈 No saber cómo va el negocio | 📊 Reportes con gráficos y proyecciones |
| 🧾 Tickets hechos a mano | 🖨️ Tickets PDF profesionales con firma |

---

## ✨ Funcionalidades

### 🏠 Panel de control
- Métricas en tiempo real (clientes, órdenes, ventas del día)
- Alertas inteligentes de cumpleaños 🎂
- Alertas de tareas vencidas 🔴
- Alertas de stock bajo 📦
- Accesos rápidos a las acciones más usadas

### 👥 Clientes
- CRUD completo (crear, editar, eliminar)
- Historial de contacto (WhatsApp, llamadas, visitas)
- Fecha de nacimiento con recordatorio automático
- **Portal del cliente** con link mágico (`/portal/[token]`)
- Cuenta corriente con límite de crédito

### 🚗 Vehículos
- CRUD completo
- **Tipo de uso** (particular, taxi, Uber, remis, flota, moto)
- **Recordatorios personalizados** por tipo (km + meses)
- Historial de servicios
- Cálculo automático del próximo cambio

### 📦 Productos e inventario
- CRUD completo (aceites, filtros, repuestos, insumos)
- Control de stock con alertas de mínimos
- Movimientos de stock (entradas, salidas, ajustes)
- Historial de movimientos por producto

### ⚙️ Servicios
- CRUD de mano de obra
- Precios configurables
- Integración con órdenes

### 🔧 Órdenes de servicio
- Crear orden: cliente + vehículo + servicios + productos + km
- **Checklist de service** (12 puntos de revisión)
- Estados: En proceso → Completado → Entregado
- **Firma digital del cliente** con canvas
- **Aviso automático por WhatsApp** al entregar
- Ticket PDF con branding y firma

### 💰 Ventas directas
- Crear venta rápida
- Cobro inmediato
- Anulación con devolución de stock
- Ticket PDF

### 📋 Tareas / CRM
- Crear tareas automáticas o manuales
- Prioridades (urgente, alta, media, baja)
- **Recordatorios automáticos** al completar una orden
- **WhatsApp con un click** desde la tarea
- Historial de contacto

### 💳 Cuenta corriente
- Vista de saldos por cliente
- Detalle de cuenta con historial
- **Pagos a cuenta** (abonos parciales)
- **Sistema de mora** configurable
- Recordatorios automáticos de deuda

### 📅 Turnos
- Calendario semanal visual
- Agendar turno con cliente + vehículo + servicio
- Estados: Pendiente → Confirmado → Completado
- Vista por hora

### 📄 Presupuestos
- Crear presupuesto con ítems
- Enviar por WhatsApp
- **Convertir a orden** con un click
- Estados: Borrador → Enviado → Aceptado → Convertido

### 📈 Reportes inteligentes
- KPIs con gradientes (facturación, promedio, mejor mes)
- Gráfico de evolución de ventas
- **Proyección de ventas** con 3 escenarios
- **🧠 Tomador de decisiones automático** que detecta:
  - Caída de ventas
  - Clientes inactivos
  - Stock bajo
  - Tareas vencidas
  - Concentración de productos
  - Clientes recurrentes

### 🏆 Ranking VIP
- Top 10 clientes por facturación
- Podio con medallas 🥇🥈🥉
- Porcentaje del total

### 🎁 Sistema de puntos
- Programa de fidelización
- **$100 = 1 punto** (configurable)
- Canje de puntos por descuentos
- Ranking de clientes con más puntos

### 🔍 Búsqueda global
- Buscador en el navbar
- Busca clientes, productos y vehículos
- Resultados instantáneos

### 🌙 Modo oscuro
- Toggle en el navbar
- Se guarda la preferencia
- Se aplica en toda la app

---

## 🛠️ Stack tecnológico

### Frontend
- **[Next.js 14](https://nextjs.org/)** — Framework React con App Router
- **[React 18](https://react.dev/)** — Librería de UI
- **[TypeScript](https://www.typescriptlang.org/)** — Tipado estático
- **[Recharts](https://recharts.org/)** — Gráficos
- **[jsPDF](https://github.com/parallax/jsPDF)** — Generación de PDFs
- **[signature_pad](https://github.com/szimek/signature_pad)** — Firma digital

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** — Endpoints REST
- **[Supabase](https://supabase.com/)** — PostgreSQL + Storage + Auth
- **[Zod](https://zod.dev/)** — Validación de datos

### Infraestructura
- **[Vercel](https://vercel.com/)** — Hosting + CI/CD
- **[Supabase](https://supabase.com/)** — Base de datos + Storage

---

## 🚀 Instalación local

### Requisitos previos

- **Node.js 18+** → [Descargar](https://nodejs.org/)
- **npm** (viene con Node)
- **Cuenta de Supabase** → [Crear gratis](https://supabase.com/)
- **Git** → [Descargar](https://git-scm.com/)

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/mariomarquesto/AceiteApp.git
cd AceiteApp
```

### Paso 2: Instalar dependencias

```bash
npm install
```

### Paso 3: Configurar Supabase

1. Crear un proyecto en [Supabase](https://supabase.com/)
2. Ir a **Settings → API** y copiar:
   - Project URL
   - anon public key
   - service_role key

3. Crear el archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Ejecutar el schema SQL en **Supabase → SQL Editor**

### Paso 4: Correr el servidor

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 📁 Estructura del proyecto

```
aceite-app/
├── src/
│   ├── app/
│   │   ├── api/                    # Endpoints REST
│   │   │   ├── clientes/
│   │   │   ├── productos/
│   │   │   ├── ordenes/
│   │   │   ├── ventas/
│   │   │   ├── pagos/
│   │   │   ├── tareas/
│   │   │   ├── turnos/
│   │   │   ├── presupuestos/
│   │   │   ├── firmas/
│   │   │   ├── reportes/
│   │   │   └── ...
│   │   ├── clientes/               # Pantallas de clientes
│   │   ├── productos/              # Pantallas de productos
│   │   ├── ordenes/                # Pantallas de órdenes
│   │   ├── ventas/                 # Pantallas de ventas
│   │   ├── tareas/                 # Pantallas de tareas
│   │   ├── turnos/                 # Pantallas de turnos
│   │   ├── presupuestos/           # Pantallas de presupuestos
│   │   ├── reportes/               # Pantallas de reportes
│   │   ├── portal/                 # Portal del cliente
│   │   ├── puntos/                 # Sistema de puntos
│   │   ├── componentes/            # Componentes reutilizables
│   │   │   ├── Navbar.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Ticket.tsx
│   │   │   ├── FirmaDigital.tsx
│   │   │   ├── ContactoBoton.tsx
│   │   │   ├── BusquedaGlobal.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── layout.tsx              # Layout principal
│   │   └── page.tsx                # Dashboard
│   ├── lib/
│   │   ├── supabase.ts             # Cliente de Supabase
│   │   └── errors.ts               # Manejo de errores
│   ├── utils/
│   │   ├── validators.ts           # Schemas de Zod
│   │   └── format.ts               # Formateo de datos
│   └── types/
│       └── database.ts             # Tipos de la BD
├── public/
│   ├── logo-icon.svg               # Logo para navbar
│   ├── manifest.json               # Configuración PWA
│   └── icon-192.svg / icon-512.svg # Iconos PWA
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Schema completo
├── README.md
├── package.json
└── next.config.js
```

---

## 🗄️ Base de datos

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `clientes` | Datos de clientes + portal token + cumpleaños |
| `vehiculos` | Vehículos con tipo de uso y recordatorios |
| `productos` | Inventario (aceites, filtros, repuestos) |
| `servicios` | Mano de obra |
| `movimientos_stock` | Entradas, salidas y ajustes |
| `ordenes` / `orden_items` | Órdenes de servicio |
| `ventas` / `venta_items` | Ventas directas |
| `pagos` | Cobros, abonos y ajustes |
| `presupuestos` / `presupuesto_items` | Cotizaciones |
| `tareas` | CRM de recordatorios |
| `turnos` | Agenda de turnos |
| `contactos` | Historial de contacto |
| `puntos_movimientos` | Sistema de puntos |
| `configuracion` | Configuración general |

### Funciones SQL

| Función | Qué hace |
|---------|----------|
| `crear_venta()` | Venta + descuento de stock |
| `crear_orden()` | Orden + descuento de stock |
| `registrar_pago()` | Cobro + aplicación FIFO a deudas |
| `registrar_movimiento_stock()` | Ajuste de stock |
| `recalcular_estado_venta()` | Actualiza estado de pago |
| `convertir_presupuesto_a_orden()` | Convierte presupuesto |
| `generar_tarea_proximo_cambio()` | **Trigger** al completar orden |
| `calcular_mora()` | Interés por atraso |

---

## 🔌 Endpoints de la API

### Clientes
- `GET /api/clientes` — Listar
- `POST /api/clientes` — Crear
- `GET /api/clientes/[id]` — Ver
- `PUT /api/clientes/[id]` — Editar
- `DELETE /api/clientes/[id]` — Eliminar

### Productos
- `GET /api/productos` — Listar
- `POST /api/productos` — Crear
- `GET /api/productos/[id]` — Ver
- `PUT /api/productos/[id]` — Editar
- `POST /api/productos/[id]/movimientos` — Ajustar stock

### Órdenes
- `GET /api/ordenes` — Listar
- `POST /api/ordenes` — Crear
- `POST /api/ordenes/[id]/cobrar` — Cobrar
- `POST /api/firmas` — Subir firma

### Ventas
- `GET /api/ventas` — Listar
- `POST /api/ventas` — Crear
- `POST /api/ventas/[id]/cobrar` — Cobrar
- `POST /api/ventas/[id]/anular` — Anular

### Tareas
- `GET /api/tareas` — Listar
- `POST /api/tareas` — Crear
- `PUT /api/tareas/[id]` — Actualizar
- `GET /api/tareas/resumen` — Métricas

### Reportes
- `GET /api/reportes/dashboard` — KPIs + proyecciones
- `GET /api/reportes/decisiones` — Recomendaciones inteligentes
- `GET /api/reportes/stock-bajo` — Productos a reponer

### Utilidades
- `GET /api/buscar?q=` — Búsqueda global
- `GET /api/portal/[token]` — Portal del cliente
- `GET /api/vehiculos/[id]/recordatorio` — Generar recordatorio WhatsApp

---

## 📱 PWA (instalable)

El sistema es una **Progressive Web App**. Se puede instalar en el celular como una app nativa.

### Cómo instalar

**Android (Chrome):**
1. Abrir `https://aceite-app-two.vercel.app`
2. Menú (3 puntos) → **"Instalar app"**
3. Aparece el ícono en el home

**iOS (Safari):**
1. Abrir la app en Safari
2. Compartir → **"Añadir a pantalla de inicio"**
3. Confirmar

**Desktop (Chrome/Edge):**
1. Ícono de instalar en la barra de direcciones
2. **"Instalar"**

---

## 🎨 Branding

### Colores

| Color | Hex | Uso |
|-------|-----|-----|
| 🔵 Azul | `#0ea5e9` | Acento principal |
| 🟠 Naranja | `#f97316` | Acento secundario |
| ⚫ Oscuro | `#0f172a` | Fondos, navbar |
| ⚪ Claro | `#f8fafc` | Cards, tablas |

### Fuentes
- **Sistema** (no carga webfonts, es más rápido)

---

## 🔐 Seguridad

### Recomendaciones para producción

- [ ] **Habilitar RLS** en Supabase (Row Level Security)
- [ ] **Regenerar claves** que se hayan expuesto
- [ ] **Usar variables de entorno** (nunca hardcodear claves)
- [ ] **Backup automático** de la base de datos
- [ ] **HTTPS** obligatorio (Vercel ya lo hace)
- [ ] **Rotación periódica** de claves

---

## 📊 Roadmap

### ✅ Completado
- [x] Clientes + vehículos
- [x] Productos + inventario
- [x] Órdenes de servicio
- [x] Ventas
- [x] Tareas / CRM
- [x] Cuenta corriente + mora
- [x] Turnos
- [x] Presupuestos
- [x] Reportes + proyecciones
- [x] Tomador de decisiones automático
- [x] Firma digital
- [x] Portal del cliente
- [x] Sistema de puntos
- [x] Modo oscuro
- [x] Búsqueda global
- [x] PWA instalable

### 🚧 En desarrollo
- [ ] Descuentos automáticos
- [ ] Programa de referidos
- [ ] Email semanal de resumen
- [ ] Notificaciones push

### 💡 Ideas futuras
- [ ] Multi-usuario con roles
- [ ] Fotos en órdenes
- [ ] Chatbot de WhatsApp
- [ ] Análisis predictivo avanzado
- [ ] App móvil nativa

---

## 🤝 Contribuciones

Este es un proyecto privado. Para sugerencias o reportes de bugs, abrí un [issue](https://github.com/mariomarquesto/AceiteApp/issues).

---

## 📝 Licencia

**Privado** — Todos los derechos reservados.

Este software fue desarrollado exclusivamente para **ARN Lubricentro y Repuestos**.

---

<div align="center">

**Hecho con 💪 y mucho ☕ en Argentina**

🛢️ **ARN Lubricentro y Repuestos** 🛢️

</div>