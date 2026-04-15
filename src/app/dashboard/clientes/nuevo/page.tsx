import { ClienteForm } from "../cliente-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nuevo Cliente" };

export default function NuevoClientePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/clientes">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Cliente</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Registra los datos del cliente
          </p>
        </div>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <ClienteForm />
      </div>
    </div>
  );
}
