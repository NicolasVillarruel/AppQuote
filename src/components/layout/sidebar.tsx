"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  FileText,
  FilePlus2,
  Package,
  Warehouse,
  PackagePlus,
  Ship,
  Truck,
  Import,
  MapPin,
  BarChart3,
  Settings,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  Building2,
  Menu,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Nav structure ─────────────────────────────────────────────────────────
const navSections = [
  {
    title: "Principal",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    title: "Gestión Comercial",
    items: [
      { label: "Clientes", href: "/dashboard/clientes", icon: Users },
      {
        label: "Cotizaciones",
        href: "/dashboard/cotizaciones",
        icon: FileText,
      },
      {
        label: "Nueva Cotización",
        href: "/dashboard/cotizaciones/nueva",
        icon: FilePlus2,
        highlight: true,
      },
    ],
  },
  {
    title: "Catálogo y Stock",
    items: [
      { label: "Productos", href: "/dashboard/productos", icon: Package },
      { label: "Inventario", href: "/dashboard/inventario", icon: Warehouse },
      {
        label: "Recepción de Lotes",
        href: "/dashboard/inventario/recepcion",
        icon: PackagePlus,
      },
    ],
  },
  {
    title: "Costos y Tarifas",
    items: [
      {
        label: "Tarifas de Flete",
        href: "/dashboard/costos/flete",
        icon: Ship,
      },
      {
        label: "Costos de Importación",
        href: "/dashboard/costos/importacion",
        icon: Import,
      },
      {
        label: "Transporte Local",
        href: "/dashboard/costos/transporte",
        icon: Truck,
      },
    ],
  },
  {
    title: "Análisis",
    items: [
      { label: "Reportes", href: "/dashboard/reportes", icon: BarChart3 },
    ],
  },
  {
    title: "Administración",
    adminOnly: true,
    items: [
      {
        label: "Configuración",
        href: "/dashboard/configuracion",
        icon: Settings,
      },
      {
        label: "Usuarios",
        href: "/dashboard/admin/usuarios",
        icon: UserCog,
        adminOnly: true,
      },
    ],
  },
];

// ─── Props ──────────────────────────────────────────────────────────────────
interface SidebarProps {
  userEmail?: string;
  userRole?: string;
  userName?: string;
}

// ─── Nav item ───────────────────────────────────────────────────────────────
function NavItem({
  item,
  collapsed,
  active,
}: {
  item: (typeof navSections)[0]["items"][0];
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;
  const isHighlight = "highlight" in item && item.highlight;

  const content = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
        collapsed ? "justify-center px-2" : "",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
        isHighlight && !active &&
          "bg-gradient-to-r from-brand-purple/20 to-brand-blue/20 text-brand-purple border border-brand-purple/30 hover:from-brand-purple/30 hover:to-brand-blue/30",
        isHighlight && active &&
          "gradient-brand text-white border-0 shadow-md"
      )}
    >
      <Icon
        className={cn(
          "flex-shrink-0 transition-transform",
          collapsed ? "w-5 h-5" : "w-4 h-4",
          isHighlight && !active && "text-brand-purple"
        )}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

// ─── Main Sidebar ────────────────────────────────────────────────────────────
export function Sidebar({ userEmail, userRole, userName }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    router.push("/login");
    router.refresh();
  };

  // ── Sidebar content ────────────────────────────────────────────────────────
  const sidebarContent = (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-[280px]"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center h-16 border-b border-sidebar-border flex-shrink-0 px-4",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-sidebar-foreground truncate">
                  AppQuote
                </p>
                <p className="text-[10px] text-sidebar-foreground/50 truncate">
                  Cotizador de Fachadas
                </p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
          )}

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              title="Colapsar sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="flex justify-center py-2 border-b border-sidebar-border">
            <button
              onClick={() => setCollapsed(false)}
              className="p-1.5 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              title="Expandir sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 space-y-6 px-3">
          {navSections.map((section) => {
            // Filter admin sections
            const isAdminSection = "adminOnly" in section && section.adminOnly;
            if (isAdminSection && userRole !== "admin") return null;

            const visibleItems = section.items.filter((item) => {
              const isAdminItem = "adminOnly" in item && item.adminOnly;
              return !isAdminItem || userRole === "admin";
            });

            return (
              <div key={section.title}>
                {!collapsed && (
                  <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest px-3 mb-2">
                    {section.title}
                  </p>
                )}
                {collapsed && <div className="h-px bg-sidebar-border mx-2 mb-3" />}

                <div className="space-y-0.5">
                  {visibleItems.map((item) => (
                    <NavItem
                      key={item.href}
                      item={item}
                      collapsed={collapsed}
                      active={isActive(
                        item.href,
                        "exact" in item ? item.exact : false
                      )}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3 space-y-1 flex-shrink-0">
          {/* Theme toggle */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-full flex items-center justify-center p-2.5 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {theme === "dark" ? "Modo claro" : "Modo oscuro"}
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-sm font-medium"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {!collapsed && (theme === "dark" ? "Modo claro" : "Modo oscuro")}
            </button>
          )}

          {/* User info + logout */}
          {!collapsed ? (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent transition-colors group">
              <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {(userName || userEmail || "U")[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">
                  {userName || "Usuario"}
                </p>
                <p className="text-[10px] text-sidebar-foreground/50 truncate">
                  {userRole === "admin" ? "Administrador" : "Vendedor"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-sidebar-foreground/50 hover:text-destructive"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center p-2.5 rounded-lg text-sidebar-foreground/60 hover:text-destructive hover:bg-sidebar-accent transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Cerrar sesión</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-screen sticky top-0">{sidebarContent}</div>

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-background border border-border shadow-md"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed left-0 top-0 z-50 h-screen">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
