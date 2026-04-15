"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Save, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

const schema = z.object({
  numero_contenedor: z.string().min(4, "Requerido"),
  fecha_llegada: z.string().min(1, "Requerido"),
  fob_usd: z.coerce.number().min(0),
  flete_usd: z.coerce.number().min(0),
  seguro_usd: z.coerce.number().min(0),
  tasa_cambio: z.coerce.number().min(1),
  notas: z.string().optional(),
  detalles: z.array(z.object({
    producto_id: z.string().min(1, "Requerido"),
    cantidad_recibida: z.coerce.number().min(0.01),
    costo_unitario_eur: z.coerce.number().min(0),
  })).min(1, "Agrega al menos un producto"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  productos: { id: string; sku: string; nombre: string; unidad: string }[];
}

export function RecepcionLoteForm({ productos }: Props) {
  const router = useRouter();
  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
    control,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fecha_llegada: new Date().toISOString().split("T")[0],
      fob_usd: 0, flete_usd: 0, seguro_usd: 0, tasa_cambio: 3.75,
      detalles: [{ producto_id: "", cantidad_recibida: 0, costo_unitario_eur: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "detalles" });

  const fob = watch("fob_usd") || 0;
  const flete = watch("flete_usd") || 0;
  const seguro = watch("seguro_usd") || 0;
  const cif = fob + flete + seguro;

  const onSubmit = async (data: FormData) => {
    const supabase = createClient();

    // Insert lote
    const { data: lote, error: errLote } = await supabase
      .from("lotes_recepcion")
      .insert({
        numero_contenedor: data.numero_contenedor,
        fecha_llegada: data.fecha_llegada,
        fob_usd: data.fob_usd,
        flete_usd: data.flete_usd,
        seguro_usd: data.seguro_usd,
        tasa_cambio: data.tasa_cambio,
        notas: data.notas || null,
        total_volumen_m3: null,
        total_peso_kg: null,
      })
      .select("id")
      .single();

    if (errLote || !lote) { toast.error(errLote?.message); return; }

    // Insert detalles
    const detalles = data.detalles.map((d) => ({
      lote_id: lote.id,
      producto_id: d.producto_id,
      cantidad_recibida: d.cantidad_recibida,
      costo_unitario_eur: d.costo_unitario_eur,
    }));

    const { error: errDet } = await supabase.from("lotes_detalle").insert(detalles);
    if (errDet) { toast.error(errDet.message); return; }

    toast.success("Lote registrado. Stock actualizado automáticamente.");
    router.push("/dashboard/inventario");
    router.refresh();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/inventario"><ChevronLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recepción de Lote</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Registra el contenedor recibido</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos del contenedor */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Datos del contenedor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>N° Contenedor *</Label>
              <Input placeholder="MSKU1234567" {...register("numero_contenedor")} />
              {errors.numero_contenedor && <p className="text-xs text-destructive">{errors.numero_contenedor.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Fecha de llegada *</Label>
              <Input type="date" {...register("fecha_llegada")} />
            </div>
            <div className="space-y-1.5">
              <Label>FOB (USD)</Label>
              <Input type="number" step="0.01" min="0" {...register("fob_usd")} />
            </div>
            <div className="space-y-1.5">
              <Label>Flete (USD)</Label>
              <Input type="number" step="0.01" min="0" {...register("flete_usd")} />
            </div>
            <div className="space-y-1.5">
              <Label>Seguro (USD)</Label>
              <Input type="number" step="0.01" min="0" {...register("seguro_usd")} />
            </div>
            <div className="space-y-1.5">
              <Label>Tasa cambio USD/PEN</Label>
              <Input type="number" step="0.01" min="1" {...register("tasa_cambio")} />
            </div>
          </div>

          {/* CIF preview */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 text-sm">
            <span className="text-muted-foreground">CIF Calculado:</span>
            <span className="font-bold font-mono text-primary">$ {formatNumber(cif)}</span>
          </div>

          <div className="space-y-1.5">
            <Label>Notas</Label>
            <Textarea rows={2} placeholder="Observaciones del lote..." {...register("notas")} />
          </div>
        </div>

        {/* Productos del lote */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Productos recibidos</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ producto_id: "", cantidad_recibida: 0, costo_unitario_eur: 0 })}
            >
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>

          {fields.map((field, idx) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,auto] gap-3 items-end p-4 rounded-lg bg-muted/20 border">
              <div className="space-y-1.5">
                <Label>Producto *</Label>
                <Select
                  onValueChange={(v) => setValue(`detalles.${idx}.producto_id`, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nombre} ({p.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Cantidad</Label>
                <Input type="number" step="0.01" min="0" placeholder="0" {...register(`detalles.${idx}.cantidad_recibida`)} />
              </div>
              <div className="space-y-1.5">
                <Label>Costo EUR/ud</Label>
                <Input type="number" step="0.01" min="0" placeholder="0.00" {...register(`detalles.${idx}.costo_unitario_eur`)} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => remove(idx)}
                disabled={fields.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {errors.detalles && (
            <p className="text-xs text-destructive">{errors.detalles.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" variant="brand" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Registrar lote
          </Button>
        </div>
      </form>
    </div>
  );
}
