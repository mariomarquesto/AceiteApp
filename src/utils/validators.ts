import { z } from 'zod';

export const clienteSchema = z.object({
  nombre: z.string().min(1).max(120),
  telefono: z.string().max(30).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  direccion: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),
  permite_cuenta_corriente: z.boolean().default(false),
  limite_credito: z.number().min(0).default(0)
});

export const vehiculoSchema = z.object({
  cliente_id: z.string().uuid(),
  marca: z.string().max(60).optional().nullable(),
  modelo: z.string().max(60).optional().nullable(),
  anio: z.number().int().min(1900).max(2100).optional().nullable(),
  placa: z.string().max(20).optional().nullable(),
  vin: z.string().max(30).optional().nullable(),
  color: z.string().max(30).optional().nullable(),
  km_actual: z.number().int().min(0).default(0),
  notas: z.string().optional().nullable()
});

export const productoSchema = z.object({
  codigo: z.string().max(50).optional().nullable(),
  nombre: z.string().min(1).max(150),
  tipo: z.enum(['aceite', 'filtro', 'repuesto', 'insumo']),
  marca: z.string().max(60).optional().nullable(),
  medida: z.string().max(60).optional().nullable(),
  descripcion: z.string().optional().nullable(),
  precio_costo: z.number().min(0).default(0),
  precio_venta: z.number().min(0),
  stock: z.number().int().default(0),
  stock_minimo: z.number().int().default(2)
});

export const servicioSchema = z.object({
  nombre: z.string().min(1).max(120),
  descripcion: z.string().optional().nullable(),
  precio: z.number().min(0)
});

export const itemVentaSchema = z.object({
  producto_id: z.string().uuid(),
  cantidad: z.number().positive(),
  precio_unitario: z.number().min(0)
});

export const crearVentaSchema = z.object({
  cliente_id: z.string().uuid().optional().nullable(),
  items: z.array(itemVentaSchema).min(1),
  descuento: z.number().min(0).default(0),
  notas: z.string().optional().nullable()
});

export const registrarPagoSchema = z.object({
  cliente_id: z.string().uuid(),
  monto: z.number().positive(),
  medio: z.enum(['efectivo', 'transferencia', 'otro']),
  tipo: z.enum(['cobro', 'abono', 'ajuste']).default('cobro'),
  venta_id: z.string().uuid().optional().nullable(),
  orden_id: z.string().uuid().optional().nullable(),
  notas: z.string().optional().nullable(),
  referencia_externa: z.string().optional().nullable()
});
