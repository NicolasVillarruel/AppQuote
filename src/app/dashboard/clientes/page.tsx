import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Search, Building2, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Metadata } from "next";
import { ClienteActions } from "./cliente-actions";

export const metadata: Metadata = { title: "Clientes" };

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; ciudad?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("clientes")
    .select("*")
    .order("nombre", { ascending: true });

  if (params.q) {
    query = query.or(
      `nombre.ilike.%${params.q}%,empresa.ilike.%${params.q}%,ruc.ilike.%${params.q}%`
    );
  }
  if (params.ciudad) {
    query = query.eq("ciudad", params.ciudad);
  }

  const { data: clientes } = await query;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {clientes?.length ?? 0} clientes registrados
          </p>
        </div>
        <Button variant="brand" size="sm" asChild>
          <Link href="/dashboard/clientes/nuevo">
            <Plus className="w-4 h-4" />
            Nuevo cliente
          </Link>
        </Button>
      </div>

      {/* Search + filters */}
      <form method="GET" className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Buscar por nombre, empresa o RUC..."
            className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">
          Buscar
        </Button>
        {params.q && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/clientes">Limpiar</Link>
          </Button>
        )}
      </form>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {clientes && clientes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Cliente / Empresa</TableHead>
                <TableHead>RUC</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead className="w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((c) => (
                <TableRow key={c.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{c.nombre}</p>
                        {c.empresa && (
                          <p className="text-xs text-muted-foreground">
                            {c.empresa}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">
                      {c.ruc ?? <span className="text-muted-foreground">—</span>}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      {c.email && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {c.email}
                        </div>
                      )}
                      {c.telefono && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {c.telefono}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.ciudad ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {c.ciudad}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <ClienteActions clienteId={c.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <Building2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="font-semibold text-muted-foreground">
              {params.q ? "Sin resultados para tu búsqueda" : "Aún no hay clientes"}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {params.q
                ? "Intenta con otro término"
                : "Agrega tu primer cliente para comenzar"}
            </p>
            {!params.q && (
              <Button variant="brand" size="sm" className="mt-4" asChild>
                <Link href="/dashboard/clientes/nuevo">
                  <Plus className="w-4 h-4" />
                  Agregar cliente
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
