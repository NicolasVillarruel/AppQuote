"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { MoreHorizontal, Eye, FileDown, Send, Check, X, Copy } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function CotizacionActions({
  cotizacionId,
  estado,
}: {
  cotizacionId: string;
  estado: string;
}) {
  const router = useRouter();

  const cambiarEstado = async (nuevoEstado: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("cotizaciones")
      .update({ estado: nuevoEstado })
      .eq("id", cotizacionId);
    if (error) { toast.error(error.message); return; }
    toast.success(`Estado cambiado a "${nuevoEstado}"`);
    router.refresh();
  };

  const generarPDF = async () => {
    toast.loading("Generando PDF...", { id: "pdf" });
    try {
      const res = await fetch(`/api/cotizaciones/${cotizacionId}/pdf`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("PDF generado", { id: "pdf" });
      window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e.message, { id: "pdf" });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/cotizaciones/${cotizacionId}`}>
            <Eye className="w-4 h-4" />
            Ver detalle
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={generarPDF}>
          <FileDown className="w-4 h-4" />
          Generar / descargar PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
        {estado !== "enviada" && (
          <DropdownMenuItem onClick={() => cambiarEstado("enviada")}>
            <Send className="w-4 h-4" />
            Marcar como enviada
          </DropdownMenuItem>
        )}
        {estado !== "aceptada" && (
          <DropdownMenuItem onClick={() => cambiarEstado("aceptada")}>
            <Check className="w-4 h-4" />
            Marcar como aceptada
          </DropdownMenuItem>
        )}
        {estado !== "rechazada" && (
          <DropdownMenuItem onClick={() => cambiarEstado("rechazada")} className="text-destructive focus:text-destructive">
            <X className="w-4 h-4" />
            Marcar como rechazada
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
