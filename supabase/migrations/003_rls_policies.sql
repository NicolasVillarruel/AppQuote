-- ============================================================
-- AppQuote — 003 Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table public.usuarios               enable row level security;
alter table public.clientes               enable row level security;
alter table public.productos              enable row level security;
alter table public.historial_precios_productos enable row level security;
alter table public.tarifas_flete          enable row level security;
alter table public.costos_importacion     enable row level security;
alter table public.tarifas_transporte_local enable row level security;
alter table public.lotes_recepcion        enable row level security;
alter table public.lotes_detalle          enable row level security;
alter table public.cotizaciones           enable row level security;
alter table public.detalles_cotizacion    enable row level security;

-- ─── Helper function: get current user role ───────────────────────────────────
create or replace function public.get_my_role()
returns text language sql security definer stable as $$
  select rol from public.usuarios where id = auth.uid();
$$;

-- ─── usuarios: everyone can read their own row, admin reads all ──────────────
create policy "usuarios: self read"
  on public.usuarios for select
  using (id = auth.uid() or public.get_my_role() = 'admin');

create policy "usuarios: admin write"
  on public.usuarios for all
  using (public.get_my_role() = 'admin');

-- ─── clientes: authenticated users read/write ─────────────────────────────────
create policy "clientes: authenticated read"
  on public.clientes for select
  using (auth.role() = 'authenticated');

create policy "clientes: authenticated write"
  on public.clientes for insert
  with check (auth.role() = 'authenticated');

create policy "clientes: authenticated update"
  on public.clientes for update
  using (auth.role() = 'authenticated');

create policy "clientes: admin delete"
  on public.clientes for delete
  using (public.get_my_role() = 'admin');

-- ─── productos: authenticated read, admin write ──────────────────────────────
create policy "productos: authenticated read"
  on public.productos for select
  using (auth.role() = 'authenticated');

create policy "productos: admin write"
  on public.productos for all
  using (public.get_my_role() = 'admin');

-- ─── historial_precios: authenticated read ───────────────────────────────────
create policy "historial_precios: authenticated read"
  on public.historial_precios_productos for select
  using (auth.role() = 'authenticated');

-- ─── tarifas y costos: authenticated read, admin write ───────────────────────
create policy "tarifas_flete: read"  on public.tarifas_flete for select using (auth.role() = 'authenticated');
create policy "tarifas_flete: write" on public.tarifas_flete for all    using (public.get_my_role() = 'admin');

create policy "costos_imp: read"  on public.costos_importacion for select using (auth.role() = 'authenticated');
create policy "costos_imp: write" on public.costos_importacion for all    using (public.get_my_role() = 'admin');

create policy "trans_local: read"  on public.tarifas_transporte_local for select using (auth.role() = 'authenticated');
create policy "trans_local: write" on public.tarifas_transporte_local for all    using (public.get_my_role() = 'admin');

-- ─── lotes: authenticated read, admin write ──────────────────────────────────
create policy "lotes_rec: read"  on public.lotes_recepcion for select using (auth.role() = 'authenticated');
create policy "lotes_rec: write" on public.lotes_recepcion for all    using (public.get_my_role() = 'admin');
create policy "lotes_det: read"  on public.lotes_detalle   for select using (auth.role() = 'authenticated');
create policy "lotes_det: write" on public.lotes_detalle   for all    using (public.get_my_role() = 'admin');

-- ─── cotizaciones: vendedor ve las suyas, admin ve todas ─────────────────────
create policy "cotizaciones: self or admin"
  on public.cotizaciones for select
  using (usuario_id = auth.uid() or public.get_my_role() = 'admin');

create policy "cotizaciones: insert own"
  on public.cotizaciones for insert
  with check (usuario_id = auth.uid());

create policy "cotizaciones: update own or admin"
  on public.cotizaciones for update
  using (usuario_id = auth.uid() or public.get_my_role() = 'admin');

create policy "cotizaciones: admin delete"
  on public.cotizaciones for delete
  using (public.get_my_role() = 'admin');

-- ─── detalles_cotizacion: inherit cotizacion access ──────────────────────────
create policy "det_cot: read"
  on public.detalles_cotizacion for select
  using (
    exists (
      select 1 from public.cotizaciones c
      where c.id = cotizacion_id
        and (c.usuario_id = auth.uid() or public.get_my_role() = 'admin')
    )
  );

create policy "det_cot: write"
  on public.detalles_cotizacion for insert
  with check (
    exists (
      select 1 from public.cotizaciones c
      where c.id = cotizacion_id
        and c.usuario_id = auth.uid()
    )
  );

create policy "det_cot: delete"
  on public.detalles_cotizacion for delete
  using (
    exists (
      select 1 from public.cotizaciones c
      where c.id = cotizacion_id
        and (c.usuario_id = auth.uid() or public.get_my_role() = 'admin')
    )
  );

-- ─── Storage: bucket cotizaciones ────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('cotizaciones', 'cotizaciones', false)
on conflict do nothing;

create policy "cotizaciones storage: authenticated read"
  on storage.objects for select
  using (bucket_id = 'cotizaciones' and auth.role() = 'authenticated');

create policy "cotizaciones storage: authenticated upload"
  on storage.objects for insert
  with check (bucket_id = 'cotizaciones' and auth.role() = 'authenticated');
