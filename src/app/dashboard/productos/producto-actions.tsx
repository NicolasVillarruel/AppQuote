"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, History } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function ProductoActions({ productoId }: { productoId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("¿Desactivar este producto? No se eliminará, solo se ocultará."))
      return;
    const supabase = createClient();
    const { error } = await supabase
      .from("productos")
      .update({ activo: false })
      .eq("id", productoId);
    if (error) { toast.error(error.message); return; }
    toast.success("Producto desactivado");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/productos/${productoId}/editar`}>
            <Pencil className="w-4 h-4" />
            Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4" />
          Desactivar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
