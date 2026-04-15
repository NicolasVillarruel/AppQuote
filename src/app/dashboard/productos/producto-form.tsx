"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Producto } from "@/types/database";

const schema = z.object({
  sku: z.string().min(2, "SKU requerido"),
  nombre: z.string().min(2, "Nombre requerido"),
  descripcion: z.string().optional(),
  unidad: z.enum(["m2", "unidad", "ml"]),
  volumen_m3_unitario: z.coerce.number().min(0),
  peso_kg_unitario: z.coerce.number().min(0),
  precio_eur_unitario: z.coerce.number().min(0, "Precio requerido"),
  partida_arancelaria: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ProductoForm({ producto }: { producto?: Producto }) {
  const router = useRouter();
  const isEditing = !!producto;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: producto
      ? {
          sku: producto.sku,
          nombre: producto.nombre,
          descripcion: producto.descripcion ?? "",
          unidad: producto.unidad,
          volumen_m3_unitario: producto.volumen_m3_unitario,
          peso_kg_unitario: producto.peso_kg_unitario,
          precio_eur_unitario: producto.precio_eur_unitario,
          partida_arancelaria: producto.partida_arancelaria ?? "",
        }
      : { unidad: "m2", volumen_m3_unitario: 0, peso_kg_unitario: 0, precio_eur_unitario: 0 },
  });

  const onSubmit = async (data: FormData) => {
    const supabase = createClient();
    const payload = {
      ...data,
      descripcion: data.descripcion || null,
      partida_arancelaria: data.partida_arancelaria || null,
    };

    if (isEditing) {
      const { error } = await supabase.from("productos").update(payload).eq("id", producto.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Producto actualizado");
    } else {
      const { error } = await supabase.from("productos").insert({ ...payload, activo: true, stock_actual: 0 });
      if (error) { toast.error(error.message); return; }
      toast.success("Producto creado");
    }
    router.push("/dashboard/productos");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SKU */}
        <div className="space-y-1.5">
          <Label htmlFor="sku">SKU *</Label>
          <Input id="sku" placeholder="PNL-ALU-4MM" {...register("sku")} />
          {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
        </div>

        {/* Unidad */}
        <div className="space-y-1.5">
          <Label>Unidad de medida *</Label>
          <Select
            defaultValue={watch("unidad")}
            onValueChange={(v) => setValue("unidad", v as "m2" | "unidad" | "ml")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="m2">m² (metro cuadrado)</SelectItem>
              <SelectItem value="unidad">Unidad</SelectItem>
              <SelectItem value="ml">ml (metro lineal)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Nombre */}
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="nombre">Nombre del producto *</Label>
          <Input id="nombre" placeholder="Panel Aluminio Compuesto 4mm" {...register("nombre")} />
          {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
        </div>

        {/* Precio EUR */}
        <div className="space-y-1.5">
          <Label htmlFor="precio_eur_unitario">Precio EUR / unidad *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
            <Input
              id="precio_eur_unitario"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="pl-7"
              {...register("precio_eur_unitario")}
            />
          </div>
          {errors.precio_eur_unitario && <p className="text-xs text-destructive">{errors.precio_eur_unitario.message}</p>}
        </div>

        {/* Partida arancelaria */}
        <div className="space-y-1.5">
          <Label htmlFor="partida_arancelaria">Partida arancelaria</Label>
          <Input id="partida_arancelaria" placeholder="7606.12.99.00" {...register("partida_arancelaria")} />
        </div>

        {/* Volumen */}
        <div className="space-y-1.5">
          <Label htmlFor="volumen_m3_unitario">Volumen m³ / unidad</Label>
          <Input
            id="volumen_m3_unitario"
            type="number"
            step="0.0001"
            min="0"
            placeholder="0.0040"
            {...register("volumen_m3_unitario")}
          />
          {errors.volumen_m3_unitario && <p className="text-xs text-destructive">{errors.volumen_m3_unitario.message}</p>}
        </div>

        {/* Peso */}
        <div className="space-y-1.5">
          <Label htmlFor="peso_kg_unitario">Peso kg / unidad</Label>
          <Input
            id="peso_kg_unitario"
            type="number"
            step="0.01"
            min="0"
            placeholder="5.80"
            {...register("peso_kg_unitario")}
          />
        </div>

        {/* Descripción */}
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea id="descripcion" rows={3} placeholder="Características técnicas..." {...register("descripcion")} />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="brand" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditing ? "Guardar cambios" : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}
