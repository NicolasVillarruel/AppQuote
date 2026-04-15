import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, PackagePlus, Container } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inventario — Lotes" };

export default async function InventarioPage() {
  const supabase = await createClient();
  const { data: lotes } = await supabase
    .from("lotes_recepcion")
    .select("*, lotes_detalle(id, cantidad_recibida, productos(nombre))")
    .order("fecha_llegada", { ascending: false });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventario — Lotes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Contenedores recibidos desde Europa
          </p>
        </div>
        <Button variant="brand" size="sm" asChild>
          <Link href="/dashboard/inventario/recepcion">
            <Plus className="w-4 h-4" />
            Registrar lote
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {lotes && lotes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Contenedor</TableHead>
                <TableHead>Llegada</TableHead>
                <TableHead className="text-right">FOB USD</TableHead>
                <TableHead className="text-right">CIF USD</TableHead>
                <TableHead className="text-right">Volumen m³</TableHead>
                <TableHead>Productos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lotes.map((lote: any) => (
                <TableRow key={lote.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Container className="w-4 h-4 text-brand-blue" />
                      <span className="font-mono font-semibold text-sm">{lote.numero_contenedor}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(lote.fecha_llegada)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">$ {formatNumber(lote.fob_usd)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">$ {formatNumber(lote.cif_usd)}</TableCell>
                  <TableCell className="text-right text-sm">
                    {lote.total_volumen_m3 ? `${formatNumber(lote.total_volumen_m3, 2)} m³` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="info">{lote.lotes_detalle?.length ?? 0} SKUs</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <PackagePlus className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="font-semibold text-muted-foreground">Sin lotes registrados</p>
            <Button variant="brand" size="sm" className="mt-4" asChild>
              <Link href="/dashboard/inventario/recepcion">
                <Plus className="w-4 h-4" />
                Registrar primer lote
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
