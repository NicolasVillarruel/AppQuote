-- ============================================================
-- AppQuote — 001 Initial Schema
-- Run in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── usuarios (extends auth.users) ───────────────────────────────────────────
create table if not exists public.usuarios (
  id          uuid primary key references auth.users(id) on delete cascade,
  nombre      text not null,
  email       text not null,
  rol         text not null default 'vendedor' check (rol in ('admin', 'vendedor')),
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── clientes ────────────────────────────────────────────────────────────────
create table if not exists public.clientes (
  id          uuid primary key default uuid_generate_v4(),
  nombre      text not null,
  empresa     text,
  ruc         text,
  direccion   text,
  email       text,
  telefono    text,
  ciudad      text default 'Lima',
  notas       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_clientes_nombre on public.clientes(nombre);
create index if not exists idx_clientes_ruc    on public.clientes(ruc);

-- ─── productos ───────────────────────────────────────────────────────────────
create table if not exists public.productos (
  id                   uuid primary key default uuid_generate_v4(),
  sku                  text not null unique,
  nombre               text not null,
  descripcion          text,
  unidad               text not null default 'm2' check (unidad in ('m2', 'unidad', 'ml')),
  volumen_m3_unitario  numeric(10,4) not null default 0,
  peso_kg_unitario     numeric(10,4) not null default 0,
  precio_eur_unitario  numeric(12,4) not null default 0,
  stock_actual         numeric(12,4) not null default 0,
  partida_arancelaria  text,
  activo               boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists idx_productos_sku    on public.productos(sku);
create index if not exists idx_productos_activo on public.productos(activo);

-- ─── historial_precios_productos ─────────────────────────────────────────────
create table if not exists public.historial_precios_productos (
  id                   uuid primary key default uuid_generate_v4(),
  producto_id          uuid not null references public.productos(id) on delete cascade,
  fecha                date not null default current_date,
  precio_eur_unitario  numeric(12,4) not null,
  notas                text
);

create index if not exists idx_hist_precios_prod on public.historial_precios_productos(producto_id, fecha desc);

-- ─── tarifas_flete ───────────────────────────────────────────────────────────
create table if not exists public.tarifas_flete (
  id                         uuid primary key default uuid_generate_v4(),
  fecha_desde                date not null,
  fecha_hasta                date,
  ocean_freight_eur          numeric(12,2) not null default 0,
  origin_charge_eur          numeric(12,2) not null default 0,
  pick_up_eur                numeric(12,2) not null default 0,
  seguro_usd                 numeric(12,2) not null default 0,
  naviera                    text,
  transit_time_dias          integer,
  free_days                  integer default 14,
  tipo                       text not null default '40ST'
                               check (tipo in ('20ST', '40ST', '40HC', '45HC')),
  notas                      text,
  peso_max_kg                numeric(10,2),
  volumen_max_m3             numeric(10,2),
  surcharge_sobrepeso_eur    numeric(12,2) default 0,
  surcharge_feriado_porcentaje numeric(5,2) default 0,
  activo                     boolean not null default true,
  created_at                 timestamptz not null default now()
);

create index if not exists idx_tarifas_flete_vigente
  on public.tarifas_flete(fecha_desde desc, activo);

-- ─── costos_importacion ──────────────────────────────────────────────────────
create table if not exists public.costos_importacion (
  id                         uuid primary key default uuid_generate_v4(),
  fecha_desde                date not null,
  fecha_hasta                date,
  igv_porcentaje             numeric(5,2) not null default 18,
  ipm_pen                    numeric(12,2) not null default 0,
  percepcion_igv_porcentaje  numeric(5,2) not null default 3.5,
  transporte_interno_usd     numeric(12,2) not null default 0,
  gestion_almacen_usd        numeric(12,2) not null default 0,
  visto_bueno_usd            numeric(12,2) not null default 0,
  gate_in_usd                numeric(12,2) not null default 0,
  gestion_operativa_usd      numeric(12,2) not null default 0,
  comision_usd               numeric(12,2) not null default 0,
  igv_servicios_porcentaje   numeric(5,2) not null default 18,
  notas                      text,
  activo                     boolean not null default true,
  created_at                 timestamptz not null default now()
);

create index if not exists idx_costos_imp_vigente
  on public.costos_importacion(fecha_desde desc, activo);

-- ─── tarifas_transporte_local ─────────────────────────────────────────────
create table if not exists public.tarifas_transporte_local (
  id                  uuid primary key default uuid_generate_v4(),
  zona                text not null,
  precio_por_m3_pen   numeric(12,2) not null default 0,
  minimo_pen          numeric(12,2) not null default 0,
  fecha_desde         date not null,
  fecha_hasta         date,
  activo              boolean not null default true,
  created_at          timestamptz not null default now()
);

create index if not exists idx_trans_local_zona
  on public.tarifas_transporte_local(zona, fecha_desde desc);

-- ─── lotes_recepcion ──────────────────────────────────────────────────────────
create table if not exists public.lotes_recepcion (
  id                        uuid primary key default uuid_generate_v4(),
  numero_contenedor         text not null unique,
  fecha_llegada             date not null,
  fob_usd                   numeric(14,2) not null default 0,
  flete_usd                 numeric(14,2) not null default 0,
  seguro_usd                numeric(14,2) not null default 0,
  cif_usd                   numeric(14,2) generated always as (fob_usd + flete_usd + seguro_usd) stored,
  tasa_cambio               numeric(8,4) not null default 3.75,
  total_volumen_m3          numeric(10,4),
  total_peso_kg             numeric(10,2),
  costo_flete_total_eur     numeric(14,2),
  costo_importacion_total_pen numeric(16,2),
  notas                     text,
  created_at                timestamptz not null default now()
);

-- ─── lotes_detalle ────────────────────────────────────────────────────────────
create table if not exists public.lotes_detalle (
  id                 uuid primary key default uuid_generate_v4(),
  lote_id            uuid not null references public.lotes_recepcion(id) on delete cascade,
  producto_id        uuid not null references public.productos(id),
  cantidad_recibida  numeric(12,4) not null,
  costo_unitario_eur numeric(12,4) not null default 0,
  created_at         timestamptz not null default now()
);

create index if not exists idx_lotes_detalle_lote    on public.lotes_detalle(lote_id);
create index if not exists idx_lotes_detalle_producto on public.lotes_detalle(producto_id);

-- ─── cotizaciones ─────────────────────────────────────────────────────────────
create table if not exists public.cotizaciones (
  id                          uuid primary key default uuid_generate_v4(),
  numero_cotizacion           text not null unique,
  cliente_id                  uuid not null references public.clientes(id),
  usuario_id                  uuid not null references public.usuarios(id),
  direccion_obra              text,
  zona_transporte             text,
  estado                      text not null default 'borrador'
                                check (estado in ('borrador','enviada','aceptada','rechazada','vencida')),
  tasa_cambio_eur_pen         numeric(8,4) not null default 3.75,
  tasa_cambio_usd_pen         numeric(8,4) not null default 3.75,
  total_volumen_m3            numeric(10,4) not null default 0,
  total_peso_kg               numeric(10,2) not null default 0,
  subtotal_material_pen       numeric(16,2) not null default 0,
  subtotal_flete_pen          numeric(16,2) not null default 0,
  subtotal_aduana_pen         numeric(16,2) not null default 0,
  subtotal_transporte_local_pen numeric(16,2) not null default 0,
  margen_porcentaje           numeric(5,2) not null default 20,
  subtotal_con_margen_pen     numeric(16,2) not null default 0,
  igv_venta_pen               numeric(16,2) not null default 0,
  total_final_pen             numeric(16,2) not null default 0,
  pdf_url                     text,
  pdf_generado_en             timestamptz,
  notas                       text,
  validez_dias                integer not null default 30,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists idx_cotizaciones_cliente on public.cotizaciones(cliente_id);
create index if not exists idx_cotizaciones_usuario on public.cotizaciones(usuario_id);
create index if not exists idx_cotizaciones_estado  on public.cotizaciones(estado);
create index if not exists idx_cotizaciones_fecha   on public.cotizaciones(created_at desc);

-- ─── detalles_cotizacion ──────────────────────────────────────────────────────
create table if not exists public.detalles_cotizacion (
  id                    uuid primary key default uuid_generate_v4(),
  cotizacion_id         uuid not null references public.cotizaciones(id) on delete cascade,
  producto_id           uuid not null references public.productos(id),
  lote_id               uuid references public.lotes_recepcion(id),
  cantidad              numeric(12,4) not null,
  precio_eur_snapshot   numeric(12,4) not null,
  volumen_m3_snapshot   numeric(10,4) not null default 0,
  peso_kg_snapshot      numeric(10,4) not null default 0,
  subtotal_material_pen numeric(16,2) not null default 0,
  created_at            timestamptz not null default now()
);

create index if not exists idx_det_cotizacion on public.detalles_cotizacion(cotizacion_id);
