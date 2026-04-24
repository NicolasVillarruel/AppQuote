-- ============================================================
-- AppQuote — 002 Add Tasa USD
-- Run in Supabase SQL Editor to add the USD exchange rate column
-- ============================================================

ALTER TABLE public.cotizaciones
ADD COLUMN IF NOT EXISTS tasa_cambio_usd_pen numeric(8,4) not null default 3.75;
