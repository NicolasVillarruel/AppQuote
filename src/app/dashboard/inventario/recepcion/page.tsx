import { createClient } from "@/lib/supabase/server";
import { RecepcionLoteForm } from "./recepcion-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Recepción de Lote" };

export default async function RecepcionPage() {
  const supabase = await createClient();
  const { data: productos } = await supabase
    .from("productos")
    .select("id, sku, nombre, unidad")
    .eq("activo", true)
    .order("nombre");

  return <RecepcionLoteForm productos={productos ?? []} />;
}
