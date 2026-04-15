import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatDate, formatNumber } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tarifas de Flete" };

export default async function TarifasFletePageWrapper() {
  const supabase = await createClient();
  const { data: tarifas } = await supabase
    .from("tarifas_flete")
    .select("*")
    .order("fecha_desde", { ascending: false });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tarifas de Flete</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tarifas marítimas Europa → Callao
          </p>
        </div>
        <Button variant="brand" size="sm" asChild>
          <Link href="/dashboard/costos/flete/nueva">
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
                <TableHead>Vigencia</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Naviera</TableHead>
                <TableHead className="text-right">Ocean EUR</TableHead>
                <TableHead className="text-right">Origin EUR</TableHead>
                <TableHead className="text-right">Pick Up EUR</TableHead>
                <TableHead className="text-right">Seguro %</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tarifas.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="text-sm">
                    {formatDate(t.fecha_desde)}
                    {t.fecha_hasta ? ` → ${formatDate(t.fecha_hasta)}` : " → Vigente"}
                  </TableCell>
                  <TableCell><Badge variant="outline">{t.tipo}</Badge></TableCell>
                  <TableCell className="text-sm">{t.naviera ?? "—"}</TableCell>
                  <TableCell className="text-right font-mono text-sm">€ {formatNumber(t.ocean_freight_eur)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">€ {formatNumber(t.origin_charge_eur)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">€ {formatNumber(t.pick_up_eur)}</TableCell>
                  <TableCell className="text-right text-sm">{formatNumber(t.seguro_usd, 2)}%</TableCell>
                  <TableCell>
                    {t.activo
                      ? <Badge variant="success">Activa</Badge>
                      : <Badge variant="draft">Inactiva</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <Ship className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="font-semibold text-muted-foreground">Sin tarifas registradas</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Ejecuta el SQL de seed data para cargar las tarifas iniciales</p>
          </div>
        )}
      </div>
    </div>
  );
}
