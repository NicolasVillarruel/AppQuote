import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { ReportesClient } from "./reportes-client";

export const metadata: Metadata = { title: "Reportes y Análisis" };

export default async function ReportesPage() {
  const supabase = await createClient();

  // Cotizaciones de los últimos 6 meses agrupadas por mes y estado
  const { data: cotizaciones } = await supabase
    .from("cotizaciones")
    .select("id, estado, total_final_pen, margen_porcentaje, created_at")
    .gte("created_at", new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString())
    .order("created_at", { ascending: true });

  // Top productos en cotizaciones
  const { data: detalles } = await supabase
    .from("detalles_cotizacion")
    .select("producto_id, cantidad, subtotal_material_pen, productos(nombre, sku)")
    .limit(200);

  // Procesar: cotizaciones por mes
  const mesesMap: Record<string, { mes: string; borrador: number; enviada: number; aceptada: number; rechazada: number; total: number }> = {};
  const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  (cotizaciones ?? []).forEach((c) => {
    const d = new Date(c.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = `${MESES[d.getMonth()]} ${d.getFullYear()}`;
    if (!mesesMap[key]) {
      mesesMap[key] = { mes: label, borrador: 0, enviada: 0, aceptada: 0, rechazada: 0, total: 0 };
    }
    mesesMap[key][c.estado as keyof typeof mesesMap[string]] = (mesesMap[key][c.estado as keyof typeof mesesMap[string]] as number ?? 0) + 1;
    mesesMap[key].total += 1;
  });
  const chartEstados = Object.values(mesesMap);

  // Procesar: totales por mes (revenue)
  const revenueMap: Record<string, { mes: string; total: number; aceptado: number }> = {};
  (cotizaciones ?? []).forEach((c) => {
    const d = new Date(c.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = `${MESES[d.getMonth()]} ${d.getFullYear()}`;
    if (!revenueMap[key]) revenueMap[key] = { mes: label, total: 0, aceptado: 0 };
    revenueMap[key].total += c.total_final_pen ?? 0;
    if (c.estado === "aceptada") revenueMap[key].aceptado += c.total_final_pen ?? 0;
  });
  const chartRevenue = Object.values(revenueMap);

  // Procesar: márgenes promedio por mes
  const margenMap: Record<string, { mes: string; margen: number; count: number }> = {};
  (cotizaciones ?? []).forEach((c) => {
    if (!c.margen_porcentaje) return;
    const d = new Date(c.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = `${MESES[d.getMonth()]} ${d.getFullYear()}`;
    if (!margenMap[key]) margenMap[key] = { mes: label, margen: 0, count: 0 };
    margenMap[key].margen += c.margen_porcentaje;
    margenMap[key].count += 1;
  });
  const chartMargen = Object.values(margenMap).map((m) => ({
    mes: m.mes,
    margen: Math.round((m.margen / m.count) * 10) / 10,
  }));

  // Procesar: top productos
  const prodMap: Record<string, { nombre: string; sku: string; cantidad: number; revenue: number }> = {};
  (detalles ?? []).forEach((d: any) => {
    const id = d.producto_id;
    if (!prodMap[id]) {
      prodMap[id] = {
        nombre: d.productos?.nombre ?? "Desconocido",
        sku: d.productos?.sku ?? "",
        cantidad: 0,
        revenue: 0,
      };
    }
    prodMap[id].cantidad += d.cantidad ?? 0;
    prodMap[id].revenue += d.subtotal_material_pen ?? 0;
  });
  const topProductos = Object.values(prodMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
    .map((p) => ({ name: p.sku || p.nombre.slice(0, 12), nombre: p.nombre, cantidad: Math.round(p.cantidad * 10) / 10, revenue: Math.round(p.revenue) }));

  // KPIs resumen
  const total = cotizaciones?.length ?? 0;
  const aceptadas = cotizaciones?.filter((c) => c.estado === "aceptada").length ?? 0;
  const tasaAcept = total > 0 ? Math.round((aceptadas / total) * 100) : 0;
  const revenueTotal = cotizaciones?.reduce((a, c) => a + (c.total_final_pen ?? 0), 0) ?? 0;
  const margenProm = cotizaciones && cotizaciones.length > 0
    ? Math.round(cotizaciones.reduce((a, c) => a + (c.margen_porcentaje ?? 0), 0) / cotizaciones.length * 10) / 10
    : 0;

  return (
    <ReportesClient
      chartEstados={chartEstados}
      chartRevenue={chartRevenue}
      chartMargen={chartMargen}
      topProductos={topProductos}
      kpis={{ total, aceptadas, tasaAcept, revenueTotal, margenProm }}
    />
  );
}
