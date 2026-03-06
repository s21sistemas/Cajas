"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, User, Menu, LogOut, Settings, User as UserIcon, AlertCircle, CheckCircle, Info } from "lucide-react";
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
import { notificationsService, type AppNotification } from "@/lib/services/notifications.service";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // Cargar notificaciones
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await notificationsService.getAll(5);
        setNotifications(response.data || []);
        setUnreadCount(response.total - (response.to - response.from + 1) || 0);
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    loadNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "low_stock":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "maintenance_reminder":
        return <Settings className="h-4 w-4 text-blue-500" />;
      case "production_alert":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Hace un momento";
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} hora(s)`;
    return `Hace ${Math.floor(diffInSeconds / 86400)} día(s)`;
  };

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
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificaciones</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {unreadCount} nuevas
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {loadingNotifications ? (
              <div className="p-4 text-center text-muted-foreground">Cargando...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No hay notificaciones
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {getNotificationIcon(notification.data?.type || 'info')}
                    <span className="font-medium text-sm">
                      {notification.data?.title || 'Notificación'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground pl-6">
                    {notification.data?.message || ''}
                  </span>
                  <span className="text-[10px] text-muted-foreground pl-6">
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="justify-center text-primary text-sm cursor-pointer"
              onClick={() => router.push('/notificaciones')}
            >
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
