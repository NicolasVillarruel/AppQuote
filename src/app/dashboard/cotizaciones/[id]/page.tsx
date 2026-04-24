import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate, formatNumber, ZONAS_TRANSPORTE } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileDown, MessageCircle, Mail, Send, Check, X } from "lucide-react";
import Link from "next/link";
import { DetalleCotizacionActions } from "./detalle-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Detalle de Cotización" };

const ESTADO_VARIANT: Record<string, "success" | "info" | "warning" | "pink" | "draft"> = {
  aceptada: "success", enviada: "info", borrador: "draft", rechazada: "pink", vencida: "warning",
};
const ESTADO_LABEL: Record<string, string> = {
  aceptada: "Aceptada", enviada: "Enviada", borrador: "Borrador", rechazada: "Rechazada", vencida: "Vencida",
};

export default async function DetalleCotizacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cot } = await supabase
    .from("cotizaciones")
    .select(`
      *,
      clientes(*),
      usuarios(nombre, email),
      detalles_cotizacion(*, productos(sku, nombre, unidad))
    `)
    .eq("id", id)
    .single();

  if (!cot) notFound();

  const zonaLabel = ZONAS_TRANSPORTE.find((z) => z.value === cot.zona_transporte)?.label;
  const waMsg = encodeURIComponent(
    `Hola ${(cot.clientes as any)?.nombre}, le enviamos la cotización ${cot.numero_cotizacion} por un total de ${formatCurrency(cot.total_final_pen)}. Válida por ${cot.validez_dias} días.`
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/cotizaciones"><ChevronLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono">{cot.numero_cotizacion}</h1>
              <Badge variant={ESTADO_VARIANT[cot.estado] ?? "draft"}>
                {ESTADO_LABEL[cot.estado] ?? cot.estado}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              Creada el {formatDate(cot.created_at)} · Válida {cot.validez_dias} días
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <DetalleCotizacionActions cotizacionId={cot.id} pdfUrl={cot.pdf_url} />
          {(cot.clientes as any)?.telefono && (
            <Button variant="success" size="sm" asChild>
              <a href={`https://wa.me/${(cot.clientes as any).telefono}?text=${waMsg}`} target="_blank">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </Button>
          )}
          {(cot.clientes as any)?.email && (
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${(cot.clientes as any).email}?subject=Cotización ${cot.numero_cotizacion}`}>
                <Mail className="w-4 h-4" />
                Email
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Top info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Client */}
        <div className="rounded-xl border bg-card p-5 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Cliente</p>
          <p className="font-semibold">{(cot.clientes as any)?.nombre}</p>
          {(cot.clientes as any)?.empresa && (
            <p className="text-sm text-muted-foreground">{(cot.clientes as any).empresa}</p>
          )}
          {(cot.clientes as any)?.ruc && (
            <p className="text-xs text-muted-foreground font-mono">RUC: {(cot.clientes as any).ruc}</p>
          )}
        </div>

        {/* Obra */}
        <div className="rounded-xl border bg-card p-5 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Obra</p>
          <p className="font-semibold text-sm">{cot.direccion_obra || "Sin especificar"}</p>
          {zonaLabel && <p className="text-sm text-muted-foreground">{zonaLabel}</p>}
          <div className="pt-3 mt-3 border-t border-border/40">
            <p className="text-xs text-muted-foreground">TC Referencial: EUR/PEN {formatNumber(cot.tasa_cambio_eur_pen, 3)}</p>
            <p className="text-[10px] text-muted-foreground/70">Fecha TC: {formatDate(cot.created_at)}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-xl border bg-card p-5 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Resumen</p>
          <p className="font-semibold">{formatCurrency(cot.total_final_pen)}</p>
          <p className="text-sm text-muted-foreground">
            {formatNumber(cot.total_volumen_m3, 3)} m³ · {formatNumber(cot.total_peso_kg, 1)} kg
          </p>
          <p className="text-xs text-brand-green">Margen: {cot.margen_porcentaje}%</p>
        </div>
      </div>

      {/* Products table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-semibold">Líneas de productos</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 text-left">
              <th className="px-4 py-3 text-muted-foreground font-semibold">Producto</th>
              <th className="px-4 py-3 text-muted-foreground font-semibold text-right">Cant.</th>
              <th className="px-4 py-3 text-muted-foreground font-semibold text-right">Precio EUR</th>
              <th className="px-4 py-3 text-muted-foreground font-semibold text-right">Subtotal PEN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(cot.detalles_cotizacion as any[])?.map((det: any) => (
              <tr key={det.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <p className="font-medium">{det.productos?.nombre}</p>
                  <p className="text-xs text-muted-foreground font-mono">{det.productos?.sku}</p>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatNumber(det.cantidad, 2)} {det.productos?.unidad}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  € {formatNumber(det.precio_eur_snapshot)}
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold">
                  {formatCurrency(det.subtotal_material_pen)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cost breakdown */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-semibold">Desglose de costos y precio</h2>
        </div>
        <div className="p-5 space-y-1 max-w-md">
          {[
            { label: "Material", value: cot.subtotal_material_pen },
            { label: "Flete Internacional", value: cot.subtotal_flete_pen },
            { label: "Derechos Aduaneros", value: cot.subtotal_aduana_pen },
            { label: "Transporte Local", value: cot.subtotal_transporte_local_pen },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-sm py-1.5">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-mono">{formatCurrency(row.value)}</span>
            </div>
          ))}
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between text-sm py-1.5">
            <span className="text-muted-foreground">Margen {cot.margen_porcentaje}%</span>
            <span className="font-mono text-brand-green">+ {formatCurrency(cot.subtotal_con_margen_pen - (cot.subtotal_material_pen + cot.subtotal_flete_pen + cot.subtotal_aduana_pen + cot.subtotal_transporte_local_pen))}</span>
          </div>
          <div className="flex justify-between text-sm py-1.5">
            <span className="text-muted-foreground">Subtotal con margen</span>
            <span className="font-mono font-semibold">{formatCurrency(cot.subtotal_con_margen_pen)}</span>
          </div>
          <div className="flex justify-between text-sm py-1.5">
            <span className="text-muted-foreground">IGV 18%</span>
            <span className="font-mono">+ {formatCurrency(cot.igv_venta_pen)}</span>
          </div>
          <div className="h-px bg-primary/30 my-2" />
          <div className="flex justify-between font-bold text-lg py-2 text-primary">
            <span>TOTAL</span>
            <span className="font-mono">{formatCurrency(cot.total_final_pen)}</span>
          </div>
        </div>
      </div>

      {cot.notas && (
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Notas internas</p>
          <p className="text-sm">{cot.notas}</p>
        </div>
      )}
    </div>
  );
}
