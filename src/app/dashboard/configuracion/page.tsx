import type { Metadata } from "next";
import { Settings, Building2 } from "lucide-react";

export const metadata: Metadata = { title: "Configuración" };

export default function ConfiguracionPage() {
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ajustes generales del sistema
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">Datos de la empresa</h2>
            <p className="text-xs text-muted-foreground">Se muestran en las cotizaciones PDF</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Nombre empresa", placeholder: "Mi Empresa SAC" },
            { label: "RUC", placeholder: "20123456789" },
            { label: "Dirección", placeholder: "Av. Principal 123, Lima" },
            { label: "Teléfono", placeholder: "+51 1 234 5678" },
            { label: "Email de contacto", placeholder: "contacto@empresa.com" },
            { label: "Web / Instagram", placeholder: "www.empresa.com" },
          ].map((f) => (
            <div key={f.label} className="space-y-1.5">
              <label className="text-sm font-medium">{f.label}</label>
              <input
                placeholder={f.placeholder}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          ))}
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            💡 Esta pantalla está lista para conectarse a una tabla{" "}
            <code className="bg-muted px-1 rounded">configuracion_empresa</code> en Supabase.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Parámetros por defecto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Tasa EUR/PEN por defecto", placeholder: "3.85" },
            { label: "Tasa USD/PEN por defecto", placeholder: "3.75" },
            { label: "Margen por defecto (%)", placeholder: "20" },
            { label: "Validez cotización (días)", placeholder: "30" },
          ].map((f) => (
            <div key={f.label} className="space-y-1.5">
              <label className="text-sm font-medium">{f.label}</label>
              <input
                type="number"
                placeholder={f.placeholder}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
