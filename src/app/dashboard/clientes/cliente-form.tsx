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
import type { Cliente } from "@/types/database";

const schema = z.object({
  nombre: z.string().min(2, "Nombre requerido"),
  empresa: z.string().optional(),
  ruc: z
    .string()
    .optional()
    .refine((v) => !v || v.length === 11, "RUC debe tener 11 dígitos"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  notas: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ClienteForm({ cliente }: { cliente?: Cliente }) {
  const router = useRouter();
  const isEditing = !!cliente;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: cliente
      ? {
          nombre: cliente.nombre,
          empresa: cliente.empresa ?? "",
          ruc: cliente.ruc ?? "",
          email: cliente.email ?? "",
          telefono: cliente.telefono ?? "",
          direccion: cliente.direccion ?? "",
          ciudad: cliente.ciudad ?? "",
          notas: cliente.notas ?? "",
        }
      : { ciudad: "Lima" },
  });

  const onSubmit = async (data: FormData) => {
    const supabase = createClient();
    const payload = {
      nombre: data.nombre,
      empresa: data.empresa || null,
      ruc: data.ruc || null,
      email: data.email || null,
      telefono: data.telefono || null,
      direccion: data.direccion || null,
      ciudad: data.ciudad || null,
      notas: data.notas || null,
    };

    if (isEditing) {
      const { error } = await supabase
        .from("clientes")
        .update(payload)
        .eq("id", cliente.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Cliente actualizado");
    } else {
      const { error } = await supabase.from("clientes").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Cliente creado exitosamente");
    }
    router.push("/dashboard/clientes");
    router.refresh();
  };

  const Field = ({
    label,
    name,
    placeholder,
    type = "text",
  }: {
    label: string;
    name: keyof FormData;
    placeholder?: string;
    type?: string;
  }) => (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={errors[name] ? "border-destructive" : ""}
      />
      {errors[name] && (
        <p className="text-xs text-destructive">{errors[name]?.message}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nombre *" name="nombre" placeholder="Juan Pérez" />
        <Field label="Empresa" name="empresa" placeholder="Constructora SAC" />
        <Field label="RUC" name="ruc" placeholder="20123456789" />
        <Field label="Ciudad" name="ciudad" placeholder="Lima" />
        <Field label="Email" name="email" type="email" placeholder="contacto@empresa.com" />
        <Field label="Teléfono" name="telefono" placeholder="+51 999 000 111" />
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="direccion">Dirección</Label>
          <Input
            id="direccion"
            placeholder="Av. Principal 123, Miraflores"
            {...register("direccion")}
          />
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="notas">Notas</Label>
          <Textarea
            id="notas"
            placeholder="Observaciones adicionales..."
            rows={3}
            {...register("notas")}
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="brand" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isEditing ? "Guardar cambios" : "Crear cliente"}
        </Button>
      </div>
    </form>
  );
}
