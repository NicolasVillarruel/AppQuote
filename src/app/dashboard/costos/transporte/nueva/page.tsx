"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { ZONAS_TRANSPORTE } from "@/lib/utils";
import Link from "next/link";

export default function NuevaTarifaTransportePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    zona: "",
    precio_por_m3_pen: "",
    minimo_pen: "",
    fecha_desde: new Date().toISOString().split("T")[0],
    fecha_hasta: "",
    activo: true,
  });

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.zona) { toast.error("Selecciona una zona"); return; }
    if (!form.precio_por_m3_pen || !form.minimo_pen) { toast.error("Completa los precios"); return; }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("tarifas_transporte_local").insert({
      zona: form.zona,
      precio_por_m3_pen: parseFloat(form.precio_por_m3_pen),
      minimo_pen: parseFloat(form.minimo_pen),
      fecha_desde: form.fecha_desde,
      fecha_hasta: form.fecha_hasta || null,
      activo: form.activo,
    });
    setSaving(false);
    if (error) { toast.error("Error: " + error.message); return; }
    toast.success("Tarifa de transporte creada");
    router.push("/dashboard/costos/transporte");
    router.refresh();
  };

  return (
    <div className="max-w-lg space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/costos/transporte"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Tarifa de Transporte</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Tarifa de entrega por zona Lima / Callao</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-semibold">Datos de la tarifa</h2>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="zona">Zona de entrega *</Label>
          <select
            id="zona"
            value={form.zona}
            onChange={(e) => set("zona", e.target.value)}
            required
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Seleccionar zona...</option>
            {ZONAS_TRANSPORTE.map((z) => (
              <option key={z.value} value={z.value}>{z.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="precio_m3">Precio por m³ (S/)</Label>
            <div className="relative">
              <Input
                id="precio_m3"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="120"
                value={form.precio_por_m3_pen}
                onChange={(e) => set("precio_por_m3_pen", e.target.value)}
                className="pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">S/</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="minimo">Mínimo (S/)</Label>
            <div className="relative">
              <Input
                id="minimo"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="300"
                value={form.minimo_pen}
                onChange={(e) => set("minimo_pen", e.target.value)}
                className="pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">S/</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="t_desde">Fecha desde *</Label>
            <Input id="t_desde" type="date" required value={form.fecha_desde} onChange={(e) => set("fecha_desde", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t_hasta">Fecha hasta (vacío = vigente)</Label>
            <Input id="t_hasta" type="date" value={form.fecha_hasta} onChange={(e) => set("fecha_hasta", e.target.value)} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="activo"
            type="checkbox"
            className="rounded"
            checked={form.activo}
            onChange={(e) => set("activo", e.target.checked)}
          />
          <Label htmlFor="activo">Marcar como tarifa activa</Label>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="ghost" asChild>
            <Link href="/dashboard/costos/transporte">Cancelar</Link>
          </Button>
          <Button type="submit" variant="brand" disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar tarifa
          </Button>
        </div>
      </form>
    </div>
  );
}
