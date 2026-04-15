import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Package, AlertTriangle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ProductoActions } from "./producto-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Productos" };

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; unidad?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  if (params.q) {
    query = query.or(
      `nombre.ilike.%${params.q}%,sku.ilike.%${params.q}%`
    );
  }
  if (params.unidad) {
    query = query.eq("unidad", params.unidad);
  }

  const { data: productos } = await query;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Catálogo de paneles y perfiles
          </p>
        </div>
        <Button variant="brand" size="sm" asChild>
          <Link href="/dashboard/productos/nuevo">
            <Plus className="w-4 h-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Buscar por nombre o SKU..."
            className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <select
          name="unidad"
          defaultValue={params.unidad}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Todas las unidades</option>
          <option value="m2">m²</option>
          <option value="unidad">Unidad</option>
          <option value="ml">ml</option>
        </select>
        <Button type="submit" variant="outline" size="sm">Filtrar</Button>
        {(params.q || params.unidad) && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/productos">Limpiar</Link>
          </Button>
        )}
      </form>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {productos && productos.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>SKU / Producto</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead className="text-right">Precio EUR</TableHead>
                <TableHead className="text-right">Vol. m³/ud</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="w-20">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map((p) => (
                <TableRow key={p.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{p.nombre}</p>
                        <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {p.unidad}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    € {formatNumber(p.precio_eur_unitario)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatNumber(p.volumen_m3_unitario, 4)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {p.stock_actual < 10 && (
                        <AlertTriangle className="w-3.5 h-3.5 text-brand-orange" />
                      )}
                      <span
                        className={`text-sm font-semibold ${
                          p.stock_actual < 10
                            ? "text-brand-orange"
                            : "text-foreground"
                        }`}
                      >
                        {formatNumber(p.stock_actual, 0)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ProductoActions productoId={p.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <Package className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="font-semibold text-muted-foreground">
              {params.q ? "Sin resultados" : "Aún no hay productos"}
            </p>
            {!params.q && (
              <Button variant="brand" size="sm" className="mt-4" asChild>
                <Link href="/dashboard/productos/nuevo">
                  <Plus className="w-4 h-4" />
                  Agregar producto
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
