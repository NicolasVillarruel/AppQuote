import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CotizacionActions } from "./cotizacion-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cotizaciones" };

const ESTADO_VARIANT: Record<string, "success" | "info" | "warning" | "pink" | "draft"> = {
  aceptada: "success",
  enviada: "info",
  borrador: "draft",
  rechazada: "pink",
  vencida: "warning",
};

const ESTADO_LABEL: Record<string, string> = {
  aceptada: "Aceptada",
  enviada: "Enviada",
  borrador: "Borrador",
  rechazada: "Rechazada",
  vencida: "Vencida",
};

export default async function CotizacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("cotizaciones")
    .select("id, numero_cotizacion, estado, total_final_pen, created_at, margen_porcentaje, clientes(nombre, empresa)")
    .order("created_at", { ascending: false });

  if (params.q) {
    query = query.ilike("numero_cotizacion", `%${params.q}%`);
  }
  if (params.estado) {
    query = query.eq("estado", params.estado);
  }

  const { data: cotizaciones } = await query;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cotizaciones</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {cotizaciones?.length ?? 0} registros encontrados
          </p>
        </div>
        <Button variant="brand" size="sm" asChild>
          <Link href="/dashboard/cotizaciones/nueva">
            <Plus className="w-4 h-4" />
            Nueva cotización
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Buscar por número..."
            className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <select
          name="estado"
          defaultValue={params.estado}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Todos los estados</option>
          <option value="borrador">Borrador</option>
          <option value="enviada">Enviada</option>
          <option value="aceptada">Aceptada</option>
          <option value="rechazada">Rechazada</option>
          <option value="vencida">Vencida</option>
        </select>
        <Button type="submit" variant="outline" size="sm">Filtrar</Button>
        {(params.q || params.estado) && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/cotizaciones">Limpiar</Link>
          </Button>
        )}
      </form>

      <div className="rounded-xl border bg-card overflow-hidden">
        {cotizaciones && cotizaciones.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>N° Cotización</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Margen</TableHead>
                <TableHead className="text-right">Total PEN</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-20">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cotizaciones.map((c: any) => (
                <TableRow key={c.id} className="group">
                  <TableCell>
                    <Link
                      href={`/dashboard/cotizaciones/${c.id}`}
                      className="font-mono text-sm font-semibold text-primary hover:underline"
                    >
                      {c.numero_cotizacion}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {c.clientes?.empresa || c.clientes?.nombre || "—"}
                      </p>
                      {c.clientes?.empresa && (
                        <p className="text-xs text-muted-foreground">{c.clientes.nombre}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ESTADO_VARIANT[c.estado] ?? "draft"}>
                      {ESTADO_LABEL[c.estado] ?? c.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {c.margen_porcentaje}%
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    {formatCurrency(c.total_final_pen)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(c.created_at)}
                  </TableCell>
                  <TableCell>
                    <CotizacionActions cotizacionId={c.id} estado={c.estado} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="font-semibold text-muted-foreground">
              {params.q || params.estado ? "Sin resultados" : "Aún no hay cotizaciones"}
            </p>
            {!params.q && !params.estado && (
              <Button variant="brand" size="sm" className="mt-4" asChild>
                <Link href="/dashboard/cotizaciones/nueva">
                  <Plus className="w-4 h-4" />
                  Crear cotización
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
