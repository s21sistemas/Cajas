"use client";

import { useAuth } from "@/contexts/auth.context";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Factory,
  Package,
  Cog,
  Users,
  Warehouse,
  Wrench,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Box,
  UserCog,
  ClipboardList,
  Landmark,
  UserCheck,
  Truck,
  Handshake,
  ShoppingCart,
  CheckCircle,
  CreditCard,
  DollarSign,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavSubItem {
  title: string;
  href: string;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  badge?: number;
  subItems?: NavSubItem[];
  permission?: string; // Permiso requerido para mostrar este item
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "General",
    items: [
      { title: "Dashboard", href: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
    ],
  },
  {
    title: "Produccion",
    items: [
      { title: "Produccion", href: "/produccion", icon: <Factory className="h-5 w-5" />, permission: "productions.view" },
      { title: "Control de Calidad", href: "/produccion/calidad", icon: <CheckCircle className="h-5 w-5" />, permission: "quality.view" },
      { title: "Panel Operador", href: "/produccion/operador", icon: <UserCog className="h-5 w-5" />, permission: "productions.view" },
      { title: "Procesos", href: "/procesos", icon: <Cog className="h-5 w-5" />, permission: "processes.view" },
      { title: "Tipo de proceso", href: "/procesos/tipo-proceso", icon: <Settings className="h-5 w-5" /> },
      { title: "Ordenes de Trabajo", href: "/ordenes-trabajo", icon: <ClipboardList className="h-5 w-5" />, permission: "workorders.view" },
    ],
  },
  {
    title: "Inventario",
    items: [
      { title: "Productos", href: "/productos", icon: <Package className="h-5 w-5" />, permission: "products.view" },
      { title: "Materiales", href: "/materiales", icon: <Box className="h-5 w-5" />, permission: "materials.view" },
      {
        title: "Almacen",
        icon: <Warehouse className="h-5 w-5" />,
        badge: 4,
        permission: "warehouse.view",
        subItems: [
          { title: "Ubicaciones", href: "/almacen/ubicaciones"},
          { title: "Materiales", href: "/almacen/materiales" },
          { title: "Producto Terminado", href: "/almacen/producto-terminado" },
          { title: "Movimientos", href: "/almacen/movimientos" },
        ],
      },
      { title: "Ordenes de Compra", href: "/ordenes-compra", icon: <ShoppingCart className="h-5 w-5" />, permission: "purchaseorders.view" },
    ],
  },
  {
    title: "Equipos",
    items: [
      { title: "Maquinas", href: "/maquinas", icon: <Cog className="h-5 w-5" />, permission: "machines.view" },
      { title: "Operadores", href: "/operadores", icon: <UserCog className="h-5 w-5" />, permission: "operators.view" },
    ],
  },
  {
    title: "Comercial",
    items: [
      {
        title: "Ventas",
        icon: <Handshake className="h-5 w-5" />,
        badge: 2,
        permission: "quotes.view",
        subItems: [
          { title: "Cotizaciones", href: "/servicios/cotizaciones" },
          { title: "Ventas", href: "/servicios/ventas" },
          { title: "Pagos", href: "/servicios/pagos" },
        ],
      },
      {
        title: "Clientes",
        icon: <UserCheck className="h-5 w-5" />,
        permission: "clients.view",
        badge: 3,
        subItems: [
          { title: "Clientes", href: "/clientes" },
          { title: "Sucursales", href: "/clientes/sucursales" },
          { title: "Estado de cuenta", href: "/clientes/estado-cuenta" },
        ],
      },
      {
        title: "Proveedores",
        icon: <Truck className="h-5 w-5" />,
        permission: "suppliers.view",
        badge: 2,
        subItems: [
          { title: "Proveedores", href: "/proveedores" },
          { title: "Estado de cuenta", href: "/proveedores/estado-cuenta" },
        ],
      },
    ],
  },
  {
    title: "Finanzas",
    items: [
      {
        title: "Finanzas",
        icon: <Landmark className="h-5 w-5" />,
        permission: "bankaccounts.view",
        badge: 3,
        subItems: [
          { title: "Bancos", href: "/finanzas/bancos" },
          { title: "Movimientos", href: "/finanzas/movimientos" },
          { title: "Estado de cuenta", href: "/finanzas/estado-cuenta" },
        ],
      },
    ],
  },
  {
    title: "RRHH",
    items: [
      {
        title: "Recursos Humanos",
        icon: <Users className="h-5 w-5" />,
        permission: "employees.view",
        badge: 12,
        subItems: [
          { title: "Empleados", href: "/recursos-humanos" },
          { title: "Incapacidades", href: "/recursos-humanos/incapacidades" },
          { title: "Tiempo extra", href: "/recursos-humanos/tiempo-extra" },
          { title: "Faltas", href: "/recursos-humanos/faltas" },
          { title: "Descuentos", href: "/recursos-humanos/descuentos" },
          { title: "Vacaciones", href: "/recursos-humanos/vacaciones" },
          { title: "Prestamos", href: "/recursos-humanos/prestamos" },
          { title: "Abonos", href: "/recursos-humanos/abonos" },
          { title: "Estado de cuenta", href: "/recursos-humanos/estado-cuenta" },
          { title: "Reportes", href: "/recursos-humanos/reportes" },
          { title: "Tipo de descuento", href: "/recursos-humanos/tipo-descuento" },
          { title: "Tipo de prestamo", href: "/recursos-humanos/tipo-prestamo" },
        ],
      },
    ],
  },
  {
    title: "Mantenimiento",
    items: [
      { title: "Mantenimiento", href: "/mantenimiento", icon: <Wrench className="h-5 w-5" />, permission: "maintenanceorders.view" },
    ],
  },
  {
    title: "Logistica",
    items: [
      {
        title: "Logistica",
        icon: <Truck className="h-5 w-5" />,
        permission: "vehicles.view",
        badge: 2,
        subItems: [
          { title: "Vehiculos", href: "/vehiculos" },
          { title: "Entregas", href: "/entregas" },
        ],
      },
    ],
  },
  {
    title: "Analisis",
    items: [
      { title: "Reportes", href: "/reportes", icon: <FileBarChart className="h-5 w-5" />, permission: "reports.view" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { title: "Configuracion", href: "/configuracion", icon: <Shield className="h-5 w-5" />, permission: "settings.view" },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const pathname = usePathname();
  const { hasPermission, user } = useAuth();

  // Función para verificar si un item debe mostrarse
  const shouldShowItem = (item: NavItem): boolean => {
    // Si no tiene permiso requerido, no mostrar
    if (item.permission && !hasPermission(item.permission)) {
      return false;
    }
    return true;
  };

  // Función para filtrar items de una sección
  const filterItems = (items: NavItem[]): NavItem[] => {
    return items.filter(shouldShowItem);
  };

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const isSubItemActive = (item: NavItem) => {
    if (item.subItems) {
      return item.subItems.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/'));
    }
    return false;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn("flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300", collapsed ? "w-16" : "w-64")}>
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Factory className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-semibold text-sidebar-foreground text-sm">VILLAZCO</span>
                <span className="text-[10px] text-muted-foreground">Sistema de Gestion</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {navSections.map((section) => {
            // Filtrar items de la sección según permisos
            const filteredItems = filterItems(section.items);
            
            // Si no hay items visibles en la sección, no mostrar la sección
            if (filteredItems.length === 0) {
              return null;
            }
            
            return (
              <div key={section.title} className="mb-4">
                {!collapsed && (
                  <h3 className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</h3>
                )}
                <ul className="space-y-1">
                  {filteredItems.map((item) => {
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const isActive = item.href ? pathname === item.href : isSubItemActive(item);
                  const isExpanded = expandedMenus.includes(item.title);

                  if (hasSubItems) {
                    return (
                      <li key={item.title}>
                        {collapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => toggleMenu(item.title)}
                                className={cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors w-full", isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50")}
                              >
                                <span className={cn(isActive ? "text-sidebar-primary" : "text-muted-foreground")}>{item.icon}</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="flex flex-col gap-1 p-2">
                              <span className="font-medium">{item.title}</span>
                              <div className="flex flex-col gap-1 mt-1">
                                {item.subItems?.map(sub => (
                                  <Link key={sub.href} href={sub.href} className={cn("text-xs px-2 py-1 rounded hover:bg-accent", pathname === sub.href && "bg-accent")}>{sub.title}</Link>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <>
                            <button
                              onClick={() => toggleMenu(item.title)}
                              className={cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors w-full", isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50")}
                            >
                              <span className={cn(isActive ? "text-sidebar-primary" : "text-muted-foreground")}>{item.icon}</span>
                              <span className="flex-1 text-left">{item.title}</span>
                              {item.badge && (
                                <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-medium rounded-full bg-primary text-primary-foreground mr-1">{item.badge}</span>
                              )}
                              <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                            </button>
                            {isExpanded && (
                              <ul className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-4">
                                {item.subItems?.map(sub => (
                                  <li key={sub.href}>
                                    <Link
                                      href={sub.href}
                                      className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors", pathname === sub.href || pathname.startsWith(sub.href + '/') ? "text-sidebar-primary bg-sidebar-accent/50" : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/30")}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                                      {sub.title}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </>
                        )}
                      </li>
                    );
                  }

                  const linkContent = (
                    <Link
                      href={item.href || "#"}
                      className={cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors", isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}
                    >
                      <span className={cn(isActive ? "text-sidebar-primary" : "text-muted-foreground")}>{item.icon}</span>
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-medium rounded-full bg-primary text-primary-foreground">{item.badge}</span>
                          )}
                        </>
                      )}
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <li key={item.href}>
                        <Tooltip>
                          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                          <TooltipContent side="right">{item.title}</TooltipContent>
                        </Tooltip>
                      </li>
                    );
                  }

                  return <li key={item.href}>{linkContent}</li>;
                })}
              </ul>
            </div>
          );
        })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2">
          {!collapsed && (
            <Link href="/configuracion" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <span>Configuracion</span>
            </Link>
          )}
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="w-full justify-center mt-2 text-muted-foreground hover:text-sidebar-foreground">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
