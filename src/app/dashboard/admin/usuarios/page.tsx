import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { UserCog } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gestión de Usuarios" };

export default async function UsuariosAdminPage() {
  const supabase = await createClient();
  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("*")
    .order("nombre");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Administra los accesos al sistema
        </p>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {usuarios && usuarios.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {u.nombre[0].toUpperCase()}
                        </span>
                      </div>
                      <p className="font-medium text-sm">{u.nombre}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.rol === "admin" ? "purple" : "info"}>
                      {u.rol === "admin" ? "Administrador" : "Vendedor"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.activo ? "success" : "draft"}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <UserCog className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="font-semibold text-muted-foreground">Sin usuarios registrados</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Los usuarios se crean automáticamente al registrarse en Supabase Auth
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
