-- ============================================================
-- ARN LUBRICENTRO Y REPUESTOS
-- SCHEMA COMPLETO v1.1 - 2026-09-30
-- ============================================================
-- Este script crea TODO el sistema desde cero:
--   - 24 tablas
--   - Funciones RPC (crear_venta, crear_orden, registrar_pago)
--   - Triggers (updated_at, tareas automáticas)
--   - Vistas (v_saldos_clientes, v_stock_bajo)
--   - Datos seed de ejemplo
--
-- Uso: Pegar en Supabase → SQL Editor → RUN
-- ============================================================


-- ============================================================
-- 1. LIMPIEZA
-- ============================================================
DROP TRIGGER IF EXISTS trg_orden_completada_crea_tarea ON ordenes;
DROP TRIGGER IF EXISTS trg_tareas_updated ON tareas;
DROP TRIGGER IF EXISTS trg_clientes_updated ON clientes;
DROP TRIGGER IF EXISTS trg_vehiculos_updated ON vehiculos;
DROP TRIGGER IF EXISTS trg_productos_updated ON productos;
DROP TRIGGER IF EXISTS trg_presupuestos_updated ON presupuestos;
DROP TRIGGER IF EXISTS trg_promociones_updated ON promociones;
DROP TRIGGER IF EXISTS trg_turnos_updated ON turnos;

DROP FUNCTION IF EXISTS generar_tarea_proximo_cambio() CASCADE;
DROP FUNCTION IF EXISTS registrar_movimiento_stock(UUID, VARCHAR, INT, VARCHAR, UUID, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS recalcular_estado_venta(UUID) CASCADE;
DROP FUNCTION IF EXISTS recalcular_estado_orden(UUID) CASCADE;
DROP FUNCTION IF EXISTS crear_venta(UUID, JSONB, NUMERIC, TEXT) CASCADE;
DROP FUNCTION IF EXISTS crear_orden(UUID, UUID, INT, JSONB, NUMERIC, TEXT, INT, DATE) CASCADE;
DROP FUNCTION IF EXISTS registrar_pago(UUID, NUMERIC, VARCHAR, VARCHAR, UUID, UUID, TEXT, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

DROP TABLE IF EXISTS tareas_historial CASCADE;
DROP TABLE IF EXISTS tareas CASCADE;
DROP TABLE IF EXISTS plantillas_recordatorio CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS venta_items CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS orden_items CASCADE;
DROP TABLE IF EXISTS ordenes CASCADE;
DROP TABLE IF EXISTS presupuesto_items CASCADE;
DROP TABLE IF EXISTS presupuestos CASCADE;
DROP TABLE IF EXISTS movimientos_stock CASCADE;
DROP TABLE IF EXISTS servicios CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS vehiculos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS contactos CASCADE;
DROP TABLE IF EXISTS turnos CASCADE;
DROP TABLE IF EXISTS promociones CASCADE;
DROP TABLE IF EXISTS configuracion CASCADE;
DROP TABLE IF EXISTS configuracion_descuentos CASCADE;
DROP TABLE IF EXISTS conversaciones CASCADE;
DROP TABLE IF EXISTS whatsapp_conversaciones CASCADE;
DROP TABLE IF EXISTS whatsapp_mensajes CASCADE;

DROP VIEW IF EXISTS v_saldos_clientes CASCADE;
DROP VIEW IF EXISTS v_stock_bajo CASCADE;


-- ============================================================
-- 2. EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- 3. CLIENTES
-- ============================================================
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(120) NOT NULL,
  telefono VARCHAR(30),
  email VARCHAR(120),
  direccion TEXT,
  notas TEXT,
  permite_cuenta_corriente BOOLEAN DEFAULT FALSE,
  limite_credito NUMERIC(12,2) DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  portal_token VARCHAR(64) UNIQUE,
  portal_activo BOOLEAN DEFAULT TRUE,
  fecha_nacimiento DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_clientes_nombre ON clientes(nombre);
CREATE INDEX idx_clientes_portal_token ON clientes(portal_token);


-- ============================================================
-- 4. VEHICULOS
-- ============================================================
CREATE TABLE vehiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  marca VARCHAR(60),
  modelo VARCHAR(60),
  anio INT,
  placa VARCHAR(20),
  vin VARCHAR(30),
  color VARCHAR(30),
  km_actual INT DEFAULT 0,
  tipo_uso VARCHAR(20) DEFAULT 'particular'
    CHECK (tipo_uso IN ('particular','taxi','uber','remis','flota','empresa','moto','otro')),
  intervalo_km INT DEFAULT 10000,
  intervalo_meses INT DEFAULT 6,
  proximo_cambio_km INT,
  proximo_cambio_fecha DATE,
  notas TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehiculos_cliente ON vehiculos(cliente_id);
CREATE INDEX idx_vehiculos_placa ON vehiculos(placa);
CREATE INDEX idx_vehiculos_tipo_uso ON vehiculos(tipo_uso);


-- ============================================================
-- 5. PRODUCTOS
-- ============================================================
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('aceite','filtro','repuesto','insumo')),
  marca VARCHAR(60),
  medida VARCHAR(60),
  descripcion TEXT,
  precio_costo NUMERIC(12,2) DEFAULT 0,
  precio_venta NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  stock_minimo INT NOT NULL DEFAULT 2,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_productos_tipo ON productos(tipo);
CREATE INDEX idx_productos_codigo ON productos(codigo);
CREATE INDEX idx_productos_nombre ON productos(nombre);


-- ============================================================
-- 6. SERVICIOS
-- ============================================================
CREATE TABLE servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  precio NUMERIC(12,2) NOT NULL DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 7. MOVIMIENTOS DE STOCK
-- ============================================================
CREATE TABLE movimientos_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES productos(id),
  tipo VARCHAR(15) NOT NULL CHECK (tipo IN ('entrada','salida','ajuste')),
  cantidad INT NOT NULL,
  motivo VARCHAR(60),
  referencia_id UUID,
  referencia_tipo VARCHAR(20),
  notas TEXT,
  fecha TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mov_stock_producto ON movimientos_stock(producto_id);
CREATE INDEX idx_mov_stock_fecha ON movimientos_stock(fecha);


-- ============================================================
-- 8. PRESUPUESTOS
-- ============================================================
CREATE TABLE presupuestos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero SERIAL UNIQUE,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  vehiculo_id UUID REFERENCES vehiculos(id),
  estado VARCHAR(15) NOT NULL DEFAULT 'borrador'
    CHECK (estado IN ('borrador','enviado','aceptado','rechazado','convertido','vencido')),
  validez_dias INT DEFAULT 7,
  subtotal NUMERIC(12,2) DEFAULT 0,
  descuento NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  notas TEXT,
  token_publico VARCHAR(64) UNIQUE,
  fecha_vencimiento DATE,
  enviado_at TIMESTAMPTZ,
  aceptado_at TIMESTAMPTZ,
  rechazado_at TIMESTAMPTZ,
  orden_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_presupuestos_cliente ON presupuestos(cliente_id);
CREATE INDEX idx_presupuestos_estado ON presupuestos(estado);

CREATE TABLE presupuesto_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presupuesto_id UUID NOT NULL REFERENCES presupuestos(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  servicio_id UUID REFERENCES servicios(id),
  descripcion VARCHAR(200),
  cantidad NUMERIC(10,2) NOT NULL DEFAULT 1,
  precio_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  CHECK (producto_id IS NOT NULL OR servicio_id IS NOT NULL)
);

CREATE INDEX idx_pres_items_pres ON presupuesto_items(presupuesto_id);


-- ============================================================
-- 9. ORDENES DE SERVICIO
-- ============================================================
CREATE TABLE ordenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero SERIAL UNIQUE,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  vehiculo_id UUID NOT NULL REFERENCES vehiculos(id),
  presupuesto_id UUID REFERENCES presupuestos(id),
  km_ingreso INT,
  estado VARCHAR(15) NOT NULL DEFAULT 'en_proceso'
    CHECK (estado IN ('en_proceso','completado','entregado','cancelado')),
  estado_pago VARCHAR(15) NOT NULL DEFAULT 'pendiente'
    CHECK (estado_pago IN ('pendiente','parcial','pagada','cuenta_corriente')),
  subtotal NUMERIC(12,2) DEFAULT 0,
  descuento NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  saldo NUMERIC(12,2) DEFAULT 0,
  notas TEXT,
  fecha_vencimiento DATE,
  recargo_mora NUMERIC(12,2) DEFAULT 0,
  total_base NUMERIC(12,2),
  firma_url TEXT,
  firma_fecha TIMESTAMPTZ,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  fecha_completado TIMESTAMPTZ,
  fecha_entrega TIMESTAMPTZ
);

CREATE INDEX idx_ordenes_cliente ON ordenes(cliente_id);
CREATE INDEX idx_ordenes_vehiculo ON ordenes(vehiculo_id);
CREATE INDEX idx_ordenes_estado ON ordenes(estado);
CREATE INDEX idx_ordenes_fecha ON ordenes(fecha);

CREATE TABLE orden_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id UUID NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  servicio_id UUID REFERENCES servicios(id),
  descripcion VARCHAR(200),
  cantidad NUMERIC(10,2) NOT NULL DEFAULT 1,
  precio_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  CHECK (producto_id IS NOT NULL OR servicio_id IS NOT NULL)
);

CREATE INDEX idx_orden_items_orden ON orden_items(orden_id);

ALTER TABLE presupuestos
  ADD CONSTRAINT presupuestos_orden_id_fkey
  FOREIGN KEY (orden_id) REFERENCES ordenes(id);


-- ============================================================
-- 10. VENTAS DIRECTAS
-- ============================================================
CREATE TABLE ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero SERIAL UNIQUE,
  cliente_id UUID REFERENCES clientes(id),
  estado_pago VARCHAR(15) NOT NULL DEFAULT 'pendiente'
    CHECK (estado_pago IN ('pendiente','parcial','pagada','cuenta_corriente')),
  subtotal NUMERIC(12,2) DEFAULT 0,
  descuento NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  saldo NUMERIC(12,2) DEFAULT 0,
  notas TEXT,
  fecha_vencimiento DATE,
  recargo_mora NUMERIC(12,2) DEFAULT 0,
  total_base NUMERIC(12,2),
  firma_url TEXT,
  firma_fecha TIMESTAMPTZ,
  fecha TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX idx_ventas_fecha ON ventas(fecha);

CREATE TABLE venta_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id),
  descripcion VARCHAR(200),
  cantidad NUMERIC(10,2) NOT NULL DEFAULT 1,
  precio_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_venta_items_venta ON venta_items(venta_id);


-- ============================================================
-- 11. PAGOS
-- ============================================================
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero SERIAL UNIQUE,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  tipo VARCHAR(15) NOT NULL CHECK (tipo IN ('cobro','abono','ajuste')),
  medio VARCHAR(20) NOT NULL CHECK (medio IN ('efectivo','transferencia','otro')),
  monto NUMERIC(12,2) NOT NULL,
  venta_id UUID REFERENCES ventas(id),
  orden_id UUID REFERENCES ordenes(id),
  comprobante_url TEXT,
  referencia_externa VARCHAR(100),
  notas TEXT,
  fecha TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pagos_cliente ON pagos(cliente_id);
CREATE INDEX idx_pagos_venta ON pagos(venta_id);
CREATE INDEX idx_pagos_orden ON pagos(orden_id);
CREATE INDEX idx_pagos_fecha ON pagos(fecha);


-- ============================================================
-- 12. TAREAS (CRM)
-- ============================================================
CREATE TABLE tareas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('recordatorio_cambio','cobro','seguimiento','otro')),
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  cliente_id UUID REFERENCES clientes(id),
  vehiculo_id UUID REFERENCES vehiculos(id),
  orden_id UUID REFERENCES ordenes(id),
  estado VARCHAR(15) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente','en_progreso','completada','cancelada')),
  prioridad VARCHAR(10) DEFAULT 'media'
    CHECK (prioridad IN ('baja','media','alta','urgente')),
  fecha_vencimiento DATE NOT NULL,
  fecha_completada TIMESTAMPTZ,
  resultado TEXT,
  contacto_realizado BOOLEAN DEFAULT FALSE,
  medio_contacto VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tareas_estado ON tareas(estado);
CREATE INDEX idx_tareas_fecha ON tareas(fecha_vencimiento);
CREATE INDEX idx_tareas_cliente ON tareas(cliente_id);
CREATE INDEX idx_tareas_vehiculo ON tareas(vehiculo_id);


-- ============================================================
-- 13. PLANTILLAS DE RECORDATORIO
-- ============================================================
CREATE TABLE plantillas_recordatorio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_uso VARCHAR(20) NOT NULL,
  canal VARCHAR(20) DEFAULT 'whatsapp' CHECK (canal IN ('whatsapp','sms','email','llamada')),
  asunto VARCHAR(200),
  mensaje TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO plantillas_recordatorio (tipo_uso, canal, mensaje) VALUES
  ('particular', 'whatsapp', 'Hola {nombre}! Te escribo de ARN Lubricentro. Tu {vehiculo} cumple {meses} meses desde el ultimo cambio de aceite el {fecha}. Queres que te agende un turno?'),
  ('taxi', 'whatsapp', 'Hola {nombre}! Tu {vehiculo} ya llego a los {km} km. Es momento del cambio de aceite para que sigas trabajando sin problemas. Te agendo?'),
  ('uber', 'whatsapp', 'Hola {nombre}! Tu {vehiculo} ya esta en {km} km desde el ultimo service. Coordinamos el cambio de aceite esta semana?'),
  ('remis', 'whatsapp', 'Hola {nombre}! Tu {vehiculo} ya esta en {km} km desde el ultimo service. Coordinamos el cambio de aceite esta semana?'),
  ('flota', 'whatsapp', 'Hola {nombre}! Le recordamos que el {vehiculo} debe hacer el cambio de aceite. Cuando podemos agendar el service?'),
  ('empresa', 'whatsapp', 'Hola {nombre}! Le recordamos que el {vehiculo} debe hacer el cambio de aceite. Cuando podemos agendar el service?'),
  ('moto', 'whatsapp', 'Hola {nombre}! Tu moto {vehiculo} cumple {meses} meses desde el ultimo cambio. La revisamos?'),
  ('otro', 'whatsapp', 'Hola {nombre}! Es momento de hacer el cambio de aceite de tu {vehiculo}. Coordinamos?');


-- ============================================================
-- 14. HISTORIAL DE TAREAS
-- ============================================================
CREATE TABLE tareas_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarea_id UUID NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
  accion VARCHAR(30) NOT NULL,
  detalle TEXT,
  usuario VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tareas_historial_tarea ON tareas_historial(tarea_id);


-- ============================================================
-- 15. CONFIGURACION (MORA)
-- ============================================================
CREATE TABLE configuracion (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  dias_vencimiento INTEGER DEFAULT 30,
  porcentaje_mora_mensual NUMERIC(5,2) DEFAULT 5.00,
  activar_mora BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO configuracion (id) VALUES (1) ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 16. CONTACTOS (CRM)
-- ============================================================
CREATE TABLE contactos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  vehiculo_id UUID REFERENCES vehiculos(id),
  tarea_id UUID REFERENCES tareas(id),
  tipo VARCHAR(20) NOT NULL DEFAULT 'whatsapp'
    CHECK (tipo IN ('whatsapp','llamada','email','visita','sms')),
  motivo VARCHAR(200),
  resultado VARCHAR(20) DEFAULT 'contactado'
    CHECK (resultado IN ('sin_respuesta','contactado','interesado','agendo','rechazo')),
  notas TEXT,
  usuario VARCHAR(100),
  fecha TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contactos_cliente ON contactos(cliente_id);
CREATE INDEX idx_contactos_fecha ON contactos(fecha);


-- ============================================================
-- 17. TURNOS (AGENDA)
-- ============================================================
CREATE TABLE turnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  vehiculo_id UUID REFERENCES vehiculos(id),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  duracion_minutos INTEGER DEFAULT 60,
  servicio VARCHAR(200),
  notas TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente','confirmado','completado','cancelado','no_asistio')),
  orden_id UUID REFERENCES ordenes(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_turnos_fecha ON turnos(fecha);
CREATE INDEX idx_turnos_cliente ON turnos(cliente_id);
CREATE INDEX idx_turnos_estado ON turnos(estado);


-- ============================================================
-- 18. PROMOCIONES
-- ============================================================
CREATE TABLE promociones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT,
  descuento_porcentaje NUMERIC(5,2),
  descuento_monto NUMERIC(12,2),
  aplica_a VARCHAR(15) DEFAULT 'todo'
    CHECK (aplica_a IN ('servicio','producto','combo','todo')),
  producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
  servicio_id UUID REFERENCES servicios(id) ON DELETE SET NULL,
  requiere_producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin DATE NOT NULL,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (descuento_porcentaje IS NOT NULL OR descuento_monto IS NOT NULL),
  CHECK (fecha_fin >= fecha_inicio)
);

CREATE INDEX idx_promociones_activa ON promociones(activa);
CREATE INDEX idx_promociones_vigencia ON promociones(fecha_inicio, fecha_fin);


-- ============================================================
-- 19. CONFIGURACION_DESCUENTOS
-- ============================================================
CREATE TABLE configuracion_descuentos (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  descuento_efectivo NUMERIC(5,2) DEFAULT 10.00,
  descuento_transferencia NUMERIC(5,2) DEFAULT 5.00,
  descuento_cumpleanos NUMERIC(5,2) DEFAULT 15.00,
  descuento_recurrente NUMERIC(5,2) DEFAULT 10.00,
  servicios_para_recurrente INTEGER DEFAULT 5,
  mensaje_bienvenida TEXT DEFAULT 'Hola! 👋 Bienvenido a ARN Lubricentro. ¿En qué te puedo ayudar?',
  mensaje_despedida TEXT DEFAULT '¡Gracias por escribirnos! Cualquier cosa estamos a disposición 🚗',
  bot_activo BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO configuracion_descuentos (id) VALUES (1) ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 20. CONVERSACIONES (legacy)
-- ============================================================
CREATE TABLE conversaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefono VARCHAR(30) NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  mensaje TEXT NOT NULL,
  respuesta TEXT,
  direccion VARCHAR(10) CHECK (direccion IN ('entrante','saliente')),
  es_ia BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversaciones_telefono ON conversaciones(telefono);


-- ============================================================
-- 21. WHATSAPP_CONVERSACIONES
-- ============================================================
CREATE TABLE whatsapp_conversaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefono VARCHAR(30) NOT NULL UNIQUE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  ultimo_mensaje TEXT,
  ultima_actividad TIMESTAMPTZ DEFAULT NOW(),
  no_leidos INTEGER DEFAULT 0,
  bot_activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wa_conv_telefono ON whatsapp_conversaciones(telefono);
CREATE INDEX idx_wa_conv_actividad ON whatsapp_conversaciones(ultima_actividad DESC);


-- ============================================================
-- 22. WHATSAPP_MENSAJES
-- ============================================================
CREATE TABLE whatsapp_mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id UUID REFERENCES whatsapp_conversaciones(id) ON DELETE CASCADE,
  telefono VARCHAR(30) NOT NULL,
  direccion VARCHAR(10) NOT NULL CHECK (direccion IN ('entrante','saliente')),
  contenido TEXT,
  tipo VARCHAR(20) DEFAULT 'text',
  message_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wa_msg_conv ON whatsapp_mensajes(conversacion_id);
CREATE INDEX idx_wa_msg_telefono ON whatsapp_mensajes(telefono);
CREATE INDEX idx_wa_msg_fecha ON whatsapp_mensajes(created_at DESC);


-- ============================================================
-- 23. TRIGGER updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clientes_updated BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_vehiculos_updated BEFORE UPDATE ON vehiculos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_productos_updated BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_presupuestos_updated BEFORE UPDATE ON presupuestos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tareas_updated BEFORE UPDATE ON tareas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_promociones_updated BEFORE UPDATE ON promociones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_turnos_updated BEFORE UPDATE ON turnos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 24. FUNCION: registrar_movimiento_stock
-- ============================================================
CREATE OR REPLACE FUNCTION registrar_movimiento_stock(
  p_producto_id UUID,
  p_tipo VARCHAR,
  p_cantidad INT,
  p_motivo VARCHAR DEFAULT NULL,
  p_referencia_id UUID DEFAULT NULL,
  p_referencia_tipo VARCHAR DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_mov_id UUID;
  v_delta INT;
BEGIN
  IF p_tipo = 'entrada' THEN
    v_delta := p_cantidad;
  ELSIF p_tipo = 'salida' THEN
    v_delta := -p_cantidad;
  ELSIF p_tipo = 'ajuste' THEN
    v_delta := p_cantidad;
  ELSE
    RAISE EXCEPTION 'Tipo invalido: %', p_tipo;
  END IF;

  INSERT INTO movimientos_stock (
    producto_id, tipo, cantidad, motivo, referencia_id, referencia_tipo
  ) VALUES (
    p_producto_id, p_tipo, p_cantidad, p_motivo, p_referencia_id, p_referencia_tipo
  ) RETURNING id INTO v_mov_id;

  UPDATE productos SET stock = stock + v_delta WHERE id = p_producto_id;
  RETURN v_mov_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 25. FUNCION: recalcular_estado_venta
-- ============================================================
CREATE OR REPLACE FUNCTION recalcular_estado_venta(p_venta_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total NUMERIC(12,2);
  v_pagado NUMERIC(12,2);
  v_saldo NUMERIC(12,2);
  v_estado VARCHAR(15);
BEGIN
  SELECT total INTO v_total FROM ventas WHERE id = p_venta_id;
  SELECT COALESCE(SUM(monto), 0) INTO v_pagado FROM pagos WHERE venta_id = p_venta_id AND tipo = 'cobro';
  v_saldo := v_total - v_pagado;

  IF v_saldo <= 0 THEN v_estado := 'pagada';
  ELSIF v_pagado > 0 THEN v_estado := 'parcial';
  ELSE v_estado := 'cuenta_corriente';
  END IF;

  UPDATE ventas SET saldo = GREATEST(v_saldo, 0), estado_pago = v_estado WHERE id = p_venta_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 26. FUNCION: recalcular_estado_orden
-- ============================================================
CREATE OR REPLACE FUNCTION recalcular_estado_orden(p_orden_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total NUMERIC(12,2);
  v_pagado NUMERIC(12,2);
  v_saldo NUMERIC(12,2);
  v_estado VARCHAR(15);
BEGIN
  SELECT total INTO v_total FROM ordenes WHERE id = p_orden_id;
  SELECT COALESCE(SUM(monto), 0) INTO v_pagado FROM pagos WHERE orden_id = p_orden_id AND tipo = 'cobro';
  v_saldo := v_total - v_pagado;

  IF v_saldo <= 0 THEN v_estado := 'pagada';
  ELSIF v_pagado > 0 THEN v_estado := 'parcial';
  ELSE v_estado := 'cuenta_corriente';
  END IF;

  UPDATE ordenes SET saldo = GREATEST(v_saldo, 0), estado_pago = v_estado WHERE id = p_orden_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 27. FUNCION: crear_venta
-- ============================================================
CREATE OR REPLACE FUNCTION crear_venta(
  p_cliente_id UUID,
  p_items JSONB,
  p_descuento NUMERIC DEFAULT 0,
  p_notas TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_venta_id UUID;
  v_subtotal NUMERIC := 0;
  v_item JSONB;
  v_subtotal_item NUMERIC;
  v_estado VARCHAR(15);
  v_saldo NUMERIC;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_subtotal_item := (v_item->>'cantidad')::NUMERIC * (v_item->>'precio_unitario')::NUMERIC;
    v_subtotal := v_subtotal + v_subtotal_item;
  END LOOP;

  IF p_cliente_id IS NULL THEN
    v_estado := 'pagada';
    v_saldo := 0;
  ELSE
    v_estado := 'pendiente';
    v_saldo := v_subtotal - p_descuento;
  END IF;

  INSERT INTO ventas (cliente_id, estado_pago, subtotal, descuento, total, saldo, notas)
  VALUES (p_cliente_id, v_estado, v_subtotal, p_descuento, v_subtotal - p_descuento, v_saldo, p_notas)
  RETURNING id INTO v_venta_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_subtotal_item := (v_item->>'cantidad')::NUMERIC * (v_item->>'precio_unitario')::NUMERIC;
    INSERT INTO venta_items (venta_id, producto_id, cantidad, precio_unitario, subtotal)
    VALUES (
      v_venta_id,
      (v_item->>'producto_id')::UUID,
      (v_item->>'cantidad')::NUMERIC,
      (v_item->>'precio_unitario')::NUMERIC,
      v_subtotal_item
    );
    PERFORM registrar_movimiento_stock(
      (v_item->>'producto_id')::UUID, 'salida',
      (v_item->>'cantidad')::INT, 'venta', v_venta_id, 'venta'
    );
  END LOOP;

  RETURN v_venta_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 28. FUNCION: crear_orden
-- ============================================================
CREATE OR REPLACE FUNCTION crear_orden(
  p_cliente_id UUID,
  p_vehiculo_id UUID,
  p_km_ingreso INT,
  p_items JSONB,
  p_descuento NUMERIC DEFAULT 0,
  p_notas TEXT DEFAULT NULL,
  p_proximo_cambio_km INT DEFAULT NULL,
  p_proximo_cambio_fecha DATE DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_orden_id UUID;
  v_subtotal NUMERIC := 0;
  v_item JSONB;
  v_subtotal_item NUMERIC;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_subtotal_item := (v_item->>'cantidad')::NUMERIC * (v_item->>'precio_unitario')::NUMERIC;
    v_subtotal := v_subtotal + v_subtotal_item;
  END LOOP;

  INSERT INTO ordenes (
    cliente_id, vehiculo_id, km_ingreso, subtotal, descuento, total, saldo, notas
  ) VALUES (
    p_cliente_id, p_vehiculo_id, p_km_ingreso,
    v_subtotal, p_descuento, v_subtotal - p_descuento, v_subtotal - p_descuento, p_notas
  ) RETURNING id INTO v_orden_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_subtotal_item := (v_item->>'cantidad')::NUMERIC * (v_item->>'precio_unitario')::NUMERIC;
    INSERT INTO orden_items (orden_id, producto_id, servicio_id, descripcion, cantidad, precio_unitario, subtotal)
    VALUES (
      v_orden_id,
      NULLIF(v_item->>'producto_id', '')::UUID,
      NULLIF(v_item->>'servicio_id', '')::UUID,
      v_item->>'descripcion',
      (v_item->>'cantidad')::NUMERIC,
      (v_item->>'precio_unitario')::NUMERIC,
      v_subtotal_item
    );
    IF v_item->>'producto_id' IS NOT NULL AND v_item->>'producto_id' != '' THEN
      PERFORM registrar_movimiento_stock(
        (v_item->>'producto_id')::UUID, 'salida',
        (v_item->>'cantidad')::INT, 'servicio', v_orden_id, 'orden'
      );
    END IF;
  END LOOP;

  UPDATE vehiculos
  SET km_actual = GREATEST(km_actual, p_km_ingreso),
      proximo_cambio_km = COALESCE(p_proximo_cambio_km, proximo_cambio_km),
      proximo_cambio_fecha = COALESCE(p_proximo_cambio_fecha, proximo_cambio_fecha)
  WHERE id = p_vehiculo_id;

  RETURN v_orden_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 29. FUNCION: registrar_pago
-- ============================================================
CREATE OR REPLACE FUNCTION registrar_pago(
  p_cliente_id UUID,
  p_monto NUMERIC,
  p_medio VARCHAR,
  p_tipo VARCHAR DEFAULT 'cobro',
  p_venta_id UUID DEFAULT NULL,
  p_orden_id UUID DEFAULT NULL,
  p_notas TEXT DEFAULT NULL,
  p_referencia_externa VARCHAR DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_pago_id UUID;
  v_monto_restante NUMERIC;
  v_deuda RECORD;
BEGIN
  IF p_monto <= 0 THEN
    RAISE EXCEPTION 'El monto debe ser mayor a 0';
  END IF;

  INSERT INTO pagos (cliente_id, tipo, medio, monto, venta_id, orden_id, notas, referencia_externa)
  VALUES (p_cliente_id, p_tipo, p_medio, p_monto, p_venta_id, p_orden_id, p_notas, p_referencia_externa)
  RETURNING id INTO v_pago_id;

  IF p_venta_id IS NOT NULL THEN PERFORM recalcular_estado_venta(p_venta_id); END IF;
  IF p_orden_id IS NOT NULL THEN PERFORM recalcular_estado_orden(p_orden_id); END IF;

  IF p_tipo = 'abono' AND p_venta_id IS NULL AND p_orden_id IS NULL THEN
    v_monto_restante := p_monto;

    FOR v_deuda IN
      SELECT 'venta' AS origen, id, saldo, fecha FROM ventas
      WHERE cliente_id = p_cliente_id AND saldo > 0
      UNION ALL
      SELECT 'orden' AS origen, id, saldo, fecha FROM ordenes
      WHERE cliente_id = p_cliente_id AND saldo > 0
      ORDER BY fecha ASC
    LOOP
      EXIT WHEN v_monto_restante <= 0;

      IF v_monto_restante >= v_deuda.saldo THEN
        INSERT INTO pagos (cliente_id, tipo, medio, monto, venta_id, orden_id, notas)
        VALUES (p_cliente_id, 'cobro', p_medio, v_deuda.saldo,
          CASE WHEN v_deuda.origen = 'venta' THEN v_deuda.id ELSE NULL END,
          CASE WHEN v_deuda.origen = 'orden' THEN v_deuda.id ELSE NULL END,
          'Aplicado desde abono #' || v_pago_id);

        v_monto_restante := v_monto_restante - v_deuda.saldo;

        IF v_deuda.origen = 'venta' THEN PERFORM recalcular_estado_venta(v_deuda.id);
        ELSE PERFORM recalcular_estado_orden(v_deuda.id); END IF;
      ELSE
        INSERT INTO pagos (cliente_id, tipo, medio, monto, venta_id, orden_id, notas)
        VALUES (p_cliente_id, 'cobro', p_medio, v_monto_restante,
          CASE WHEN v_deuda.origen = 'venta' THEN v_deuda.id ELSE NULL END,
          CASE WHEN v_deuda.origen = 'orden' THEN v_deuda.id ELSE NULL END,
          'Aplicado desde abono #' || v_pago_id);

        IF v_deuda.origen = 'venta' THEN PERFORM recalcular_estado_venta(v_deuda.id);
        ELSE PERFORM recalcular_estado_orden(v_deuda.id); END IF;

        v_monto_restante := 0;
      END IF;
    END LOOP;
  END IF;

  RETURN v_pago_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 30. FUNCION: generar_tarea_proximo_cambio (trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION generar_tarea_proximo_cambio()
RETURNS TRIGGER AS $$
DECLARE
  v_vehiculo RECORD;
  v_km_proximo INT;
  v_fecha_proxima DATE;
  v_km_actual INT;
  v_dias_aviso INT;
BEGIN
  IF NEW.estado != 'completado' OR OLD.estado = 'completado' THEN
    RETURN NEW;
  END IF;

  SELECT v.*, c.nombre AS cliente_nombre, c.telefono
  INTO v_vehiculo
  FROM vehiculos v
  JOIN clientes c ON c.id = v.cliente_id
  WHERE v.id = NEW.vehiculo_id;

  IF v_vehiculo IS NULL THEN RETURN NEW; END IF;

  v_km_actual := COALESCE(NEW.km_ingreso, v_vehiculo.km_actual, 0);
  v_km_proximo := v_km_actual + COALESCE(v_vehiculo.intervalo_km, 10000);
  v_fecha_proxima := (CURRENT_DATE + (COALESCE(v_vehiculo.intervalo_meses, 6) || ' months')::INTERVAL)::DATE;

  UPDATE vehiculos
  SET km_actual = v_km_actual,
      proximo_cambio_km = v_km_proximo,
      proximo_cambio_fecha = v_fecha_proxima
  WHERE id = NEW.vehiculo_id;

  v_dias_aviso := CASE v_vehiculo.tipo_uso
    WHEN 'taxi' THEN 7
    WHEN 'uber' THEN 7
    WHEN 'remis' THEN 7
    WHEN 'flota' THEN 30
    WHEN 'empresa' THEN 30
    ELSE 15
  END;

  INSERT INTO tareas (
    tipo, titulo, descripcion,
    cliente_id, vehiculo_id, orden_id,
    prioridad, fecha_vencimiento
  ) VALUES (
    'recordatorio_cambio',
    'Recordar cambio de aceite a ' || v_vehiculo.cliente_nombre,
    'Vehiculo: ' || COALESCE(v_vehiculo.marca,'') || ' ' || COALESCE(v_vehiculo.modelo,'') ||
    ' (' || COALESCE(v_vehiculo.placa,'s/placa') || ')' || E'\n' ||
    'Proximo cambio: ' || v_fecha_proxima || ' o a los ' || v_km_proximo || ' km',
    v_vehiculo.cliente_id,
    NEW.vehiculo_id,
    NEW.id,
    CASE v_vehiculo.tipo_uso
      WHEN 'taxi' THEN 'alta'
      WHEN 'uber' THEN 'alta'
      WHEN 'remis' THEN 'alta'
      WHEN 'flota' THEN 'media'
      ELSE 'baja'
    END,
    v_fecha_proxima - (v_dias_aviso || ' days')::INTERVAL
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orden_completada_crea_tarea
  AFTER UPDATE ON ordenes
  FOR EACH ROW
  WHEN (OLD.estado IS DISTINCT FROM NEW.estado)
  EXECUTE FUNCTION generar_tarea_proximo_cambio();


-- ============================================================
-- 31. VISTAS
-- ============================================================
CREATE OR REPLACE VIEW v_saldos_clientes AS
SELECT
  c.id AS cliente_id,
  c.nombre,
  c.telefono,
  c.permite_cuenta_corriente,
  c.limite_credito,
  COALESCE(deudas.total_deudas, 0) AS total_deudas,
  COALESCE(pagos.total_abonos, 0) AS total_abonos,
  COALESCE(deudas.total_deudas, 0) - COALESCE(pagos.total_abonos, 0) AS saldo
FROM clientes c
LEFT JOIN (
  SELECT cliente_id, SUM(total) AS total_deudas FROM (
    SELECT cliente_id, total FROM ventas WHERE estado_pago != 'pagada'
    UNION ALL
    SELECT cliente_id, total FROM ordenes WHERE estado_pago != 'pagada'
  ) t GROUP BY cliente_id
) deudas ON deudas.cliente_id = c.id
LEFT JOIN (
  SELECT cliente_id, SUM(monto) AS total_abonos FROM pagos WHERE tipo = 'abono' GROUP BY cliente_id
) pagos ON pagos.cliente_id = c.id
WHERE c.activo = TRUE;

CREATE OR REPLACE VIEW v_stock_bajo AS
SELECT * FROM productos WHERE activo = TRUE AND stock <= stock_minimo;


-- ============================================================
-- 32. DESHABILITAR RLS (desarrollo)
-- ============================================================
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculos DISABLE ROW LEVEL SECURITY;
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE servicios DISABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_stock DISABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos DISABLE ROW LEVEL SECURITY;
ALTER TABLE presupuesto_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes DISABLE ROW LEVEL SECURITY;
ALTER TABLE orden_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE pagos DISABLE ROW LEVEL SECURITY;
ALTER TABLE tareas DISABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas_recordatorio DISABLE ROW LEVEL SECURITY;
ALTER TABLE tareas_historial DISABLE ROW LEVEL SECURITY;
ALTER TABLE contactos DISABLE ROW LEVEL SECURITY;
ALTER TABLE turnos DISABLE ROW LEVEL SECURITY;
ALTER TABLE promociones DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_descuentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_mensajes DISABLE ROW LEVEL SECURITY;


-- ============================================================
-- 33. DATOS SEED
-- ============================================================

-- Servicios típicos
INSERT INTO servicios (nombre, precio) VALUES
  ('Cambio de aceite + filtro', 25000),
  ('Cambio de filtro de aire', 8000),
  ('Cambio de filtro de combustible', 12000),
  ('Cambio de filtro de cabina', 10000),
  ('Revisión general', 5000);

-- Productos típicos
INSERT INTO productos (codigo, nombre, tipo, marca, medida, precio_costo, precio_venta, stock, stock_minimo) VALUES
  ('ACE-10W40-1L', 'Aceite 10W-40 Sintetico 1L', 'aceite', 'Shell', '10W-40', 3500, 6000, 20, 5),
  ('ACE-10W40-4L', 'Aceite 10W-40 Sintetico 4L', 'aceite', 'Shell', '10W-40', 12000, 20000, 15, 3),
  ('ACE-15W40-1L', 'Aceite 15W-40 Mineral 1L', 'aceite', 'YPF', '15W-40', 2000, 3500, 30, 5),
  ('FIL-ACE-001', 'Filtro de aceite universal', 'filtro', 'Tecnocar', NULL, 800, 1500, 25, 5),
  ('FIL-AIR-001', 'Filtro de aire universal', 'filtro', 'Tecnocar', NULL, 1000, 1800, 20, 5),
  ('FIL-COM-001', 'Filtro de combustible universal', 'filtro', 'Tecnocar', NULL, 1200, 2000, 15, 3),
  ('FIL-CAB-001', 'Filtro de cabina universal', 'filtro', 'Tecnocar', NULL, 1500, 2500, 10, 3),
  ('BAT-12V-50', 'Bateria 12V 50Ah', 'repuesto', 'Willard', '12V', 45000, 65000, 5, 1),
  ('BOM-ACE-001', 'Bomba de aceite', 'repuesto', 'Generica', NULL, 8000, 14000, 3, 1);


-- ============================================================
-- 34. VERIFICACION FINAL
-- ============================================================
SELECT 'clientes' as tabla, COUNT(*)::int as total FROM clientes
UNION ALL SELECT 'vehiculos', COUNT(*)::int FROM vehiculos
UNION ALL SELECT 'productos', COUNT(*)::int FROM productos
UNION ALL SELECT 'servicios', COUNT(*)::int FROM servicios
UNION ALL SELECT 'presupuestos', COUNT(*)::int FROM presupuestos
UNION ALL SELECT 'ordenes', COUNT(*)::int FROM ordenes
UNION ALL SELECT 'ventas', COUNT(*)::int FROM ventas
UNION ALL SELECT 'pagos', COUNT(*)::int FROM pagos
UNION ALL SELECT 'tareas', COUNT(*)::int FROM tareas
UNION ALL SELECT 'plantillas_recordatorio', COUNT(*)::int FROM plantillas_recordatorio
UNION ALL SELECT 'contactos', COUNT(*)::int FROM contactos
UNION ALL SELECT 'turnos', COUNT(*)::int FROM turnos
UNION ALL SELECT 'promociones', COUNT(*)::int FROM promociones
UNION ALL SELECT 'whatsapp_conversaciones', COUNT(*)::int FROM whatsapp_conversaciones
UNION ALL SELECT 'whatsapp_mensajes', COUNT(*)::int FROM whatsapp_mensajes
ORDER BY tabla;