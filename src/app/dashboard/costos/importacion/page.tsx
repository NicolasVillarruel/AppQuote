import { createClient } from "@/lib/supabase/server";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency, formatNumber } from "@/lib/utils";
import { Import, Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Costos de Importación" };

export default async function CostosImportacionPage() {
  const supabase = await createClient();
  const { data: costos } = await supabase
    .from("costos_importacion")
    .select("*")
    .order("fecha_desde", { ascending: false });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Costos de Importación</h1>
          <p className="text-muted-foreground text-sm mt-1">
            IGV, derechos aduaneros y servicios logísticos
          </p>
        </div>
        <Button variant="brand" size="sm" asChild>
          <Link href="/dashboard/costos/importacion/nueva">
            <Plus className="w-4 h-4" />
            Nuevos costos
          </Link>
        </Button>
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        {costos && costos.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Vigencia</TableHead>
                <TableHead className="text-right">IGV %</TableHead>
                <TableHead className="text-right">Percepción %</TableHead>
                <TableHead className="text-right">Transporte Int.</TableHead>
                <TableHead className="text-right">Gestión+Almacén</TableHead>
                <TableHead className="text-right">Comisión USD</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costos.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="text-sm">
                    {formatDate(c.fecha_desde)}
                    {c.fecha_hasta ? ` → ${formatDate(c.fecha_hasta)}` : " → Vigente"}
                  </TableCell>
                  <TableCell className="text-right">{c.igv_porcentaje}%</TableCell>
                  <TableCell className="text-right">{c.percepcion_igv_porcentaje}%</TableCell>
                  <TableCell className="text-right font-mono text-sm">$ {formatNumber(c.transporte_interno_usd)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    $ {formatNumber(c.gestion_almacen_usd + c.gestion_operativa_usd)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">$ {formatNumber(c.comision_usd)}</TableCell>
                  <TableCell>
                    {c.activo
                      ? <Badge variant="success">Activo</Badge>
                      : <Badge variant="draft">Inactivo</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Import className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="font-semibold text-muted-foreground">Sin costos de importación</p>
          </div>
        )}
      </div>
    </div>
  );
}
