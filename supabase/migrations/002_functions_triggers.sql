-- ============================================================
-- AppQuote — 002 Functions & Triggers
-- ============================================================

-- ─── Trigger: updated_at automático ──────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_clientes_updated_at
  before update on public.clientes
  for each row execute function public.set_updated_at();

create trigger trg_productos_updated_at
  before update on public.productos
  for each row execute function public.set_updated_at();

create trigger trg_cotizaciones_updated_at
  before update on public.cotizaciones
  for each row execute function public.set_updated_at();

-- ─── Trigger: actualizar stock al insertar lotes_detalle ─────────────────────
create or replace function public.actualizar_stock_producto()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update public.productos
    set stock_actual = stock_actual + new.cantidad_recibida,
        updated_at   = now()
    where id = new.producto_id;
  elsif tg_op = 'DELETE' then
    update public.productos
    set stock_actual = greatest(0, stock_actual - old.cantidad_recibida),
        updated_at   = now()
    where id = old.producto_id;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger trg_lote_detalle_stock
  after insert or delete on public.lotes_detalle
  for each row execute function public.actualizar_stock_producto();

-- ─── Trigger: historial de precios al actualizar precio del producto ──────────
create or replace function public.registrar_historial_precio()
returns trigger language plpgsql as $$
begin
  if old.precio_eur_unitario is distinct from new.precio_eur_unitario then
    insert into public.historial_precios_productos(producto_id, fecha, precio_eur_unitario, notas)
    values (new.id, current_date, new.precio_eur_unitario, 'Actualización automática');
  end if;
  return new;
end;
$$;

create trigger trg_producto_precio_historial
  after update on public.productos
  for each row execute function public.registrar_historial_precio();

-- ─── Función: generar número de cotización ────────────────────────────────────
create or replace function public.generar_numero_cotizacion()
returns text language plpgsql as $$
declare
  v_year  text := to_char(now(), 'YYYY');
  v_seq   integer;
  v_num   text;
begin
  select coalesce(max(
    cast(split_part(numero_cotizacion, '-', 3) as integer)
  ), 0) + 1
  into v_seq
  from public.cotizaciones
  where numero_cotizacion like 'COT-' || v_year || '-%';

  v_num := 'COT-' || v_year || '-' || lpad(v_seq::text, 4, '0');
  return v_num;
end;
$$;

create or replace function public.set_numero_cotizacion()
returns trigger language plpgsql as $$
begin
  if new.numero_cotizacion is null or new.numero_cotizacion = '' then
    new.numero_cotizacion := public.generar_numero_cotizacion();
  end if;
  return new;
end;
$$;

create trigger trg_numero_cotizacion
  before insert on public.cotizaciones
  for each row execute function public.set_numero_cotizacion();

-- ─── Función: crear usuario en public.usuarios tras signup ───────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.usuarios(id, nombre, email, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'rol', 'vendedor')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
