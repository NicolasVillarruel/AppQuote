"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Import } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function NuevoCostoImportacionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fecha_desde: new Date().toISOString().split("T")[0],
    fecha_hasta: "",
    igv_porcentaje: "16",
    ipm_pen: "0",
    percepcion_igv_porcentaje: "3.5",
    transporte_interno_usd: "350",
    gestion_almacen_usd: "200",
    visto_bueno_usd: "80",
    gate_in_usd: "60",
    gestion_operativa_usd: "150",
    comision_usd: "250",
    igv_servicios_porcentaje: "18",
    activo: true,
  });

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("costos_importacion").insert({
      fecha_desde: form.fecha_desde,
      fecha_hasta: form.fecha_hasta || null,
      igv_porcentaje: parseFloat(form.igv_porcentaje),
      ipm_pen: parseFloat(form.ipm_pen),
      percepcion_igv_porcentaje: parseFloat(form.percepcion_igv_porcentaje),
      transporte_interno_usd: parseFloat(form.transporte_interno_usd),
      gestion_almacen_usd: parseFloat(form.gestion_almacen_usd),
      visto_bueno_usd: parseFloat(form.visto_bueno_usd),
      gate_in_usd: parseFloat(form.gate_in_usd),
      gestion_operativa_usd: parseFloat(form.gestion_operativa_usd),
      comision_usd: parseFloat(form.comision_usd),
      igv_servicios_porcentaje: parseFloat(form.igv_servicios_porcentaje),
      activo: form.activo,
    });
    setSaving(false);
    if (error) { toast.error("Error: " + error.message); return; }
    toast.success("Costos de importación guardados");
    router.push("/dashboard/costos/importacion");
    router.refresh();
  };

  const field = (id: keyof typeof form, label: string, placeholder: string, suffix?: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          step="0.01"
          min="0"
          placeholder={placeholder}
          value={form[id] as string}
          onChange={(e) => set(id, e.target.value)}
          className={suffix ? "pr-10" : ""}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/costos/importacion"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevos Costos de Importación</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Tasas aduaneras y servicios logísticos</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center">
            <Import className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-semibold">Vigencia</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fecha_desde">Fecha desde *</Label>
            <Input id="fecha_desde" type="date" required value={form.fecha_desde} onChange={(e) => set("fecha_desde", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fecha_hasta">Fecha hasta (vacío = vigente)</Label>
            <Input id="fecha_hasta" type="date" value={form.fecha_hasta} onChange={(e) => set("fecha_hasta", e.target.value)} />
          </div>
        </div>

        <div className="h-px bg-border" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tasas Aduaneras</h3>
        <div className="grid grid-cols-3 gap-4">
          {field("igv_porcentaje", "IGV Aduana (%)", "16", "%")}
          {field("ipm_pen", "IPM (S/)", "0", "S/")}
          {field("percepcion_igv_porcentaje", "Percepción IGV (%)", "3.5", "%")}
        </div>

        <div className="h-px bg-border" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Servicios Logísticos (USD por contenedor)</h3>
        <div className="grid grid-cols-2 gap-4">
          {field("transporte_interno_usd", "Transporte interno", "350", "$")}
          {field("gestion_almacen_usd", "Gestión almacén", "200", "$")}
          {field("visto_bueno_usd", "Visto bueno", "80", "$")}
          {field("gate_in_usd", "Gate in", "60", "$")}
          {field("gestion_operativa_usd", "Gestión operativa", "150", "$")}
          {field("comision_usd", "Comisión agente", "250", "$")}
        </div>

        <div className="h-px bg-border" />
        {field("igv_servicios_porcentaje", "IGV sobre servicios (%)", "18", "%")}

        <div className="flex items-center gap-2">
          <input
            id="activo"
            type="checkbox"
            className="rounded"
            checked={form.activo}
            onChange={(e) => set("activo", e.target.checked)}
          />
          <Label htmlFor="activo">Marcar como costos activos</Label>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="ghost" asChild>
            <Link href="/dashboard/costos/importacion">Cancelar</Link>
          </Button>
          <Button type="submit" variant="brand" disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar costos
          </Button>
        </div>
      </form>
    </div>
  );
}
