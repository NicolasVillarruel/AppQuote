-- ============================================================
-- AppQuote — 004 Seed Data
-- ============================================================

-- ─── Tarifa de flete ejemplo ──────────────────────────────────────────────────
insert into public.tarifas_flete (
  fecha_desde, ocean_freight_eur, origin_charge_eur, pick_up_eur,
  seguro_usd, naviera, transit_time_dias, free_days, tipo,
  peso_max_kg, volumen_max_m3, notas
) values (
  '2025-01-01', 2800, 450, 180,
  1.5, 'MSC', 28, 14, '40ST',
  26000, 67.5,
  'Tarifa base 2025 — Barcelona a Callao'
) on conflict do nothing;

-- ─── Costos importación ejemplo ───────────────────────────────────────────────
insert into public.costos_importacion (
  fecha_desde, igv_porcentaje, ipm_pen, percepcion_igv_porcentaje,
  transporte_interno_usd, gestion_almacen_usd, visto_bueno_usd,
  gate_in_usd, gestion_operativa_usd, comision_usd,
  igv_servicios_porcentaje, notas
) values (
  '2025-01-01', 18, 2, 3.5,
  350, 280, 120,
  80, 200, 150,
  18,
  'Costos vigentes 2025 — Aduana Callao'
) on conflict do nothing;

-- ─── Tarifas transporte local ─────────────────────────────────────────────────
insert into public.tarifas_transporte_local (zona, precio_por_m3_pen, minimo_pen, fecha_desde) values
  ('lima_centro',  45, 150, '2025-01-01'),
  ('lima_norte',   52, 180, '2025-01-01'),
  ('lima_sur',     55, 180, '2025-01-01'),
  ('lima_este',    50, 165, '2025-01-01'),
  ('callao',       38, 130, '2025-01-01'),
  ('provincia',   120, 500, '2025-01-01')
on conflict do nothing;

-- ─── Productos ejemplo ────────────────────────────────────────────────────────
insert into public.productos (sku, nombre, descripcion, unidad, volumen_m3_unitario, peso_kg_unitario, precio_eur_unitario, stock_actual, partida_arancelaria) values
  ('PNL-ALU-4MM', 'Panel Aluminio Compuesto 4mm', 'Panel ACM 4mm — apto para fachadas ventiladas, acabado estándar', 'm2', 0.004, 5.8, 28.50, 120, '7606.12.99.00'),
  ('PNL-ALU-6MM', 'Panel Aluminio Compuesto 6mm', 'Panel ACM 6mm — mayor rigidez para grandes paños', 'm2', 0.006, 8.2, 38.00, 85, '7606.12.99.00'),
  ('PNL-GRC-PRE', 'Panel GRC Prefabricado', 'Panel de hormigón reforzado con fibra de vidrio, acabado liso', 'm2', 0.08, 45.0, 65.00, 40, '6810.91.00.00'),
  ('PNL-HPL-8MM', 'Panel HPL Fenólico 8mm', 'Panel HPL de alta presión para exteriores, clase A1 fuego', 'm2', 0.008, 12.5, 52.00, 60, '4411.12.00.00'),
  ('PER-ALU-U', 'Perfil Aluminio U 60x40', 'Perfil de aluminio anodizado para sistemas de subestructura', 'ml', 0.0028, 1.2, 8.50, 500, '7604.29.90.00')
on conflict (sku) do nothing;
