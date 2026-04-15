import { createClient } from "@/lib/supabase/server";
import { NuevaCotizacionWizard } from "./nueva-cotizacion-wizard";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nueva Cotización" };

export default async function NuevaCotizacionPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [
    { data: clientes },
    { data: productos },
    { data: tarifaFlete },
    { data: costoImp },
    { data: tarifasTransporte },
  ] = await Promise.all([
    supabase.from("clientes").select("id, nombre, empresa").order("nombre"),
    supabase.from("productos").select("id, sku, nombre, unidad, precio_eur_unitario, volumen_m3_unitario, peso_kg_unitario, stock_actual").eq("activo", true).order("nombre"),
    supabase.from("tarifas_flete").select("*").eq("activo", true).order("fecha_desde", { ascending: false }).limit(1).single(),
    supabase.from("costos_importacion").select("*").eq("activo", true).order("fecha_desde", { ascending: false }).limit(1).single(),
    supabase.from("tarifas_transporte_local").select("*").eq("activo", true),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/cotizaciones">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Cotización</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Completa los pasos para generar la cotización
          </p>
        </div>
      </div>

      <NuevaCotizacionWizard
        clientes={clientes ?? []}
        productos={productos ?? []}
        tarifaFlete={tarifaFlete ?? null}
        costoImportacion={costoImp ?? null}
        tarifasTransporte={tarifasTransporte ?? []}
        clienteIdInicial={params.cliente}
      />
    </div>
  );
}
