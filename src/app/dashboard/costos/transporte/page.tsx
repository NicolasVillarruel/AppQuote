import { createClient } from "@/lib/supabase/server";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber, ZONAS_TRANSPORTE } from "@/lib/utils";
import { Truck, Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Transporte Local" };

export default async function TransporteLocalPage() {
  const supabase = await createClient();
  const { data: tarifas } = await supabase
    .from("tarifas_transporte_local")
    .select("*")
    .order("zona");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transporte Local</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tarifas de entrega por zona de Lima / Callao
          </p>
        </div>
        <Button variant="brand" size="sm" asChild>
          <Link href="/dashboard/costos/transporte/nueva">
            <Plus className="w-4 h-4" />
            Nueva tarifa
          </Link>
        </Button>
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        {tarifas && tarifas.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Zona</TableHead>
                <TableHead className="text-right">S/ por m³</TableHead>
                <TableHead className="text-right">Mínimo S/</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tarifas.map((t: any) => {
                const zona = ZONAS_TRANSPORTE.find(z => z.value === t.zona);
                return (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{zona?.label ?? t.zona}</TableCell>
                    <TableCell className="text-right font-mono">S/ {formatNumber(t.precio_por_m3_pen)}</TableCell>
                    <TableCell className="text-right font-mono">S/ {formatNumber(t.minimo_pen)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(t.fecha_desde)}
                      {t.fecha_hasta ? ` → ${formatDate(t.fecha_hasta)}` : " → Vigente"}
                    </TableCell>
                    <TableCell>
                      {t.activo
                        ? <Badge variant="success">Activa</Badge>
                        : <Badge variant="draft">Inactiva</Badge>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Truck className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="font-semibold text-muted-foreground">Sin tarifas de transporte</p>
          </div>
        )}
      </div>
    </div>
  );
}
