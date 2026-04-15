"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function NuevaTarifaFletePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fecha_desde: new Date().toISOString().split("T")[0],
    fecha_hasta: "",
    naviera: "",
    tipo: "FCL 20'",
    ocean_freight_eur: "",
    origin_charge_eur: "",
    pick_up_eur: "",
    seguro_usd: "0.50",
    volumen_max_m3: "28",
    activo: true,
  });

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ocean_freight_eur || !form.origin_charge_eur || !form.pick_up_eur) {
      toast.error("Completa todos los valores de tarifa");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("tarifas_flete").insert({
      fecha_desde: form.fecha_desde,
      fecha_hasta: form.fecha_hasta || null,
      naviera: form.naviera || null,
      tipo: form.tipo,
      ocean_freight_eur: parseFloat(form.ocean_freight_eur),
      origin_charge_eur: parseFloat(form.origin_charge_eur),
      pick_up_eur: parseFloat(form.pick_up_eur),
      seguro_usd: parseFloat(form.seguro_usd),
      volumen_max_m3: parseFloat(form.volumen_max_m3),
      activo: form.activo,
    });
    setSaving(false);
    if (error) { toast.error("Error: " + error.message); return; }
    toast.success("Tarifa de flete creada");
    router.push("/dashboard/costos/flete");
    router.refresh();
  };

  return (
    <div className="max-w-xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/costos/flete"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Tarifa de Flete</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Tarifa marítima Europa → Callao</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center">
            <Ship className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-semibold">Datos de la tarifa</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tipo">Tipo de contenedor</Label>
            <select
              id="tipo"
              value={form.tipo}
              onChange={(e) => set("tipo", e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {["FCL 20'", "FCL 40'", "FCL 40' HC", "LCL"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="naviera">Naviera</Label>
            <Input id="naviera" placeholder="MSC, Maersk..." value={form.naviera} onChange={(e) => set("naviera", e.target.value)} />
          </div>
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
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Costos EUR por contenedor</h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="ocean">Ocean Freight (€)</Label>
            <Input id="ocean" type="number" step="0.01" min="0" required placeholder="1200" value={form.ocean_freight_eur} onChange={(e) => set("ocean_freight_eur", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="origin">Origin Charge (€)</Label>
            <Input id="origin" type="number" step="0.01" min="0" required placeholder="350" value={form.origin_charge_eur} onChange={(e) => set("origin_charge_eur", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pickup">Pick Up (€)</Label>
            <Input id="pickup" type="number" step="0.01" min="0" required placeholder="150" value={form.pick_up_eur} onChange={(e) => set("pick_up_eur", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="seguro">Seguro (% sobre CIF USD)</Label>
            <Input id="seguro" type="number" step="0.01" min="0" max="5" placeholder="0.50" value={form.seguro_usd} onChange={(e) => set("seguro_usd", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="volmax">Volumen máximo contenedor (m³)</Label>
            <Input id="volmax" type="number" step="0.1" min="1" placeholder="28" value={form.volumen_max_m3} onChange={(e) => set("volumen_max_m3", e.target.value)} />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
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
            <Link href="/dashboard/costos/flete">Cancelar</Link>
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
