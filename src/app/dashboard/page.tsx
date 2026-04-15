import { createClient } from "@/lib/supabase/server";
import {
  FileText,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Package,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate, QUOTE_STATES } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

// ─── Stats card ──────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  trend?: { value: number; label: string };
}) {
  return (
    <div className="rounded-xl border bg-card p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend.value >= 0 ? "text-brand-green" : "text-brand-pink"
            }`}
          >
            {trend.value >= 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground/60 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ─── State badge ─────────────────────────────────────────────────────────────
function StateBadge({ estado }: { estado: string }) {
  const map: Record<string, "success" | "info" | "warning" | "pink" | "draft"> = {
    aceptada: "success",
    enviada: "info",
    borrador: "draft",
    rechazada: "pink",
    vencida: "warning",
  };
  const labels: Record<string, string> = {
    aceptada: "Aceptada",
    enviada: "Enviada",
    borrador: "Borrador",
    rechazada: "Rechazada",
    vencida: "Vencida",
  };
  return (
    <Badge variant={map[estado] ?? "draft"}>{labels[estado] ?? estado}</Badge>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const supabase = await createClient();

  // Parallel queries
  const [
    { count: totalCots },
    { count: aceptadas },
    { data: ultimas },
    { data: stockBajo },
  ] = await Promise.all([
    supabase
      .from("cotizaciones")
      .select("*", { count: "exact", head: true })
      .gte(
        "created_at",
        new Date(new Date().setDate(1)).toISOString()
      ),
    supabase
      .from("cotizaciones")
      .select("*", { count: "exact", head: true })
      .eq("estado", "aceptada")
      .gte(
        "created_at",
        new Date(new Date().setDate(1)).toISOString()
      ),
    supabase
      .from("cotizaciones")
      .select(
        "id, numero_cotizacion, estado, total_final_pen, created_at, clientes(nombre, empresa)"
      )
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("productos")
      .select("id, sku, nombre, stock_actual")
      .lt("stock_actual", 10)
      .eq("activo", true)
      .limit(5),
  ]);

  const tasa = ((aceptadas ?? 0) / Math.max(totalCots ?? 1, 1)) * 100;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Resumen del mes —{" "}
            {new Date().toLocaleDateString("es-PE", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Button variant="brand" size="sm" asChild>
          <Link href="/dashboard/cotizaciones/nueva">
            <Plus className="w-4 h-4" />
            Nueva Cotización
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Cotizaciones del mes"
          value={totalCots ?? 0}
          icon={FileText}
          color="bg-brand-purple"
          trend={{ value: 12, label: "vs mes anterior" }}
        />
        <StatCard
          title="Cotizaciones aceptadas"
          value={aceptadas ?? 0}
          subtitle={`Tasa de aceptación: ${tasa.toFixed(0)}%`}
          icon={CheckCircle2}
          color="bg-brand-green"
          trend={{ value: 8, label: "vs mes anterior" }}
        />
        <StatCard
          title="Margen promedio"
          value="23.4%"
          subtitle="Sobre cotizaciones aceptadas"
          icon={TrendingUp}
          color="bg-brand-blue"
          trend={{ value: 2, label: "vs mes anterior" }}
        />
        <StatCard
          title="Productos stock bajo"
          value={stockBajo?.length ?? 0}
          subtitle="Con menos de 10 unidades"
          icon={AlertTriangle}
          color="bg-brand-orange"
        />
      </div>

      {/* Main content: Recent quotes + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent quotes */}
        <div className="xl:col-span-2 rounded-xl border bg-card">
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="font-semibold">Últimas cotizaciones</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Actividad reciente
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/cotizaciones">Ver todas</Link>
            </Button>
          </div>

          {ultimas && ultimas.length > 0 ? (
            <div className="divide-y divide-border">
              {ultimas.map((cot: any) => (
                <Link
                  key={cot.id}
                  href={`/dashboard/cotizaciones/${cot.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                        {cot.numero_cotizacion}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(cot.clientes as any)?.empresa ||
                          (cot.clientes as any)?.nombre ||
                          "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold">
                        {formatCurrency(cot.total_final_pen)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(cot.created_at)}
                      </p>
                    </div>
                    <StateBadge estado={cot.estado} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <FileText className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Aún no hay cotizaciones este mes
              </p>
              <Button variant="brand" size="sm" className="mt-4" asChild>
                <Link href="/dashboard/cotizaciones/nueva">
                  <Plus className="w-4 h-4" />
                  Crear primera cotización
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Right column: alerts */}
        <div className="space-y-4">
          {/* Stock alerts */}
          <div className="rounded-xl border bg-card">
            <div className="flex items-center gap-2 p-5 border-b">
              <AlertTriangle className="w-4 h-4 text-brand-orange" />
              <h3 className="font-semibold text-sm">Stock bajo</h3>
            </div>
            {stockBajo && stockBajo.length > 0 ? (
              <div className="divide-y divide-border">
                {stockBajo.map((prod: any) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {prod.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {prod.sku}
                      </p>
                    </div>
                    <Badge variant="warning" className="flex-shrink-0">
                      {prod.stock_actual} uds
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center px-4">
                <Package className="w-8 h-8 text-brand-green mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  Todo el stock está bien
                </p>
              </div>
            )}
            <div className="p-3 border-t">
              <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                <Link href="/dashboard/productos">Ver inventario completo</Link>
              </Button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-sm mb-3">Acciones rápidas</h3>
            {[
              {
                label: "Nueva cotización",
                href: "/dashboard/cotizaciones/nueva",
                variant: "brand" as const,
              },
              {
                label: "Agregar cliente",
                href: "/dashboard/clientes/nuevo",
                variant: "outline" as const,
              },
              {
                label: "Registrar lote",
                href: "/dashboard/inventario/recepcion",
                variant: "outline" as const,
              },
            ].map((action) => (
              <Button
                key={action.href}
                variant={action.variant}
                size="sm"
                className="w-full"
                asChild
              >
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
