"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, User, Menu, LogOut, Settings, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/auth.context";
import { useToast } from "@/components/erp/action-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const notifications = [
  {
    id: 1,
    title: "Stock bajo: Lamina Corrugada BC",
    description: "Solo quedan 80 laminas (minimo: 200)",
    time: "Hace 5 min",
    type: "warning",
  },
  {
    id: 2,
    title: "Pegadora en mantenimiento",
    description: "Mantenimiento preventivo programado",
    time: "Hace 1 hora",
    type: "info",
  },
  {
    id: 3,
    title: "Orden de produccion completada",
    description: "OT-2024-145 - Caja Corrugada 40x30x20",
    time: "Hace 2 horas",
    type: "success",
  },
];

export function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      showToast('success', 'Sesión cerrada', 'Has cerrado sesión correctamente');
      router.push('/login');
    } catch (error) {
      // Even if logout fails, redirect to login
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-background border-b border-border">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="w-64 pl-9 bg-secondary border-0"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificaciones</span>
              <Badge variant="secondary" className="text-[10px]">
                3 nuevas
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      notification.type === "warning"
                        ? "bg-warning"
                        : notification.type === "success"
                          ? "bg-success"
                          : "bg-primary"
                    }`}
                  />
                  <span className="font-medium text-sm">
                    {notification.title}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground pl-4">
                  {notification.description}
                </span>
                <span className="text-[10px] text-muted-foreground pl-4">
                  {notification.time}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary text-sm">
              Ver todas las notificaciones
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user?.name || 'Usuario'}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.roles?.join(', ') || 'Sin rol asignado'}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/perfil')}>
              <UserIcon className="mr-2 h-4 w-4" />
              Mi Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/configuracion')}>
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
