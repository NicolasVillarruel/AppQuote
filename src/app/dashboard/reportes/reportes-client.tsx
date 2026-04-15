"use client";

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area, Cell,
} from "recharts";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  FileText, CheckCircle2, TrendingUp, DollarSign,
  BarChart3, Package,
} from "lucide-react";

interface Props {
  chartEstados: { mes: string; borrador: number; enviada: number; aceptada: number; rechazada: number; total: number }[];
  chartRevenue: { mes: string; total: number; aceptado: number }[];
  chartMargen: { mes: string; margen: number }[];
  topProductos: { name: string; nombre: string; cantidad: number; revenue: number }[];
  kpis: { total: number; aceptadas: number; tasaAcept: number; revenueTotal: number; margenProm: number };
}

const COLORS = ["#844ea3", "#1d3a84", "#59a779", "#fabf2a", "#d52974", "#f1762a", "#06b6d4", "#8b5cf6"];

function KpiCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/60 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
    color: "hsl(var(--foreground))",
  },
};

export function ReportesClient({ chartEstados, chartRevenue, chartMargen, topProductos, kpis }: Props) {
  const hasData = kpis.total > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes y Análisis</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Últimos 6 meses — Datos en tiempo real
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard icon={FileText} label="Cotizaciones totales" value={String(kpis.total)} color="bg-brand-purple" />
        <KpiCard icon={CheckCircle2} label="Aceptadas" value={String(kpis.aceptadas)} sub={`Tasa ${kpis.tasaAcept}%`} color="bg-brand-green" />
        <KpiCard icon={TrendingUp} label="Margen promedio" value={`${kpis.margenProm}%`} color="bg-brand-blue" />
        <KpiCard icon={DollarSign} label="Revenue total" value={formatCurrency(kpis.revenueTotal)} sub="Todas las cotizaciones" color="bg-brand-orange" />
        <KpiCard icon={BarChart3} label="Productos distintos" value={String(topProductos.length)} color="bg-brand-pink" />
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-16 text-center">
          <BarChart3 className="w-12 h-12 text-primary/30 mx-auto mb-4" />
          <p className="font-semibold text-muted-foreground">Sin datos para mostrar</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Crea tu primera cotización para ver las métricas aquí
          </p>
        </div>
      ) : (
        <>
          {/* Charts row 1 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Cotizaciones por estado */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div>
                <h2 className="font-semibold">Cotizaciones por Estado</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Embudo de conversión mensual</p>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartEstados} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="aceptada" name="Aceptada" fill="#59a779" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="enviada" name="Enviada" fill="#1d3a84" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="borrador" name="Borrador" fill="#9ca3af" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="rechazada" name="Rechazada" fill="#d52974" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue mensual */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div>
                <h2 className="font-semibold">Revenue Mensual (S/)</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Total vs. aceptadas</p>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartRevenue} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#844ea3" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#844ea3" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradAcept" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#59a779" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#59a779" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `S/${(v / 1000).toFixed(0)}k`} />
                  <Tooltip {...tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Area type="monotone" dataKey="total" name="Total cotizado" stroke="#844ea3" fill="url(#gradTotal)" strokeWidth={2} dot={{ r: 3 }} />
                  <Area type="monotone" dataKey="aceptado" name="Aceptadas" stroke="#59a779" fill="url(#gradAcept)" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Margen promedio */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div>
                <h2 className="font-semibold">Margen Promedio (%)</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Evolución mensual</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartMargen} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                  <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}%`, "Margen"]} />
                  <Line type="monotone" dataKey="margen" name="Margen" stroke="#fabf2a" strokeWidth={2.5} dot={{ r: 4, fill: "#fabf2a" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top productos */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-orange" />
                <h2 className="font-semibold">Top Productos Cotizados</h2>
              </div>
              {topProductos.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={topProductos}
                    layout="vertical"
                    margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `S/${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={60} />
                    <Tooltip {...tooltipStyle} formatter={(v: number) => formatCurrency(v)} labelFormatter={(l) => topProductos.find((p) => p.name === l)?.nombre ?? l} />
                    <Bar dataKey="revenue" name="Revenue S/" radius={[0, 4, 4, 0]}>
                      {topProductos.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                  Sin datos de productos
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
