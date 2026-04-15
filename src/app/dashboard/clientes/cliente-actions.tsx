"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, FilePlus2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ClienteActions({ clienteId }: { clienteId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este cliente? Esta acción no se puede deshacer."))
      return;
    const supabase = createClient();
    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id", clienteId);
    if (error) {
      toast.error("Error al eliminar: " + error.message);
    } else {
      toast.success("Cliente eliminado");
      router.refresh();
    }
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
          <Link href={`/dashboard/clientes/${clienteId}/editar`}>
            <Pencil className="w-4 h-4" />
            Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/cotizaciones/nueva?cliente=${clienteId}`}>
            <FilePlus2 className="w-4 h-4" />
            Nueva cotización
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
