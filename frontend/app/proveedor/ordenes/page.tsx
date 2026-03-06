"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { orderPedidoService } from "@/lib/services/order-pedido.service";
import { authApi } from "@/lib/api";
import type { OrderPedido, OrderPedidoStatus } from "@/lib/types/order-pedido.types";
import { Clock, MapPin, Package, Camera, LogOut, RefreshCw } from "lucide-react";

export default function ProveedorOrdenesPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderPedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  // Pick up dialog
  const [pickUpOpen, setPickUpOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderPedido | null>(null);
  
  // Deliver dialog
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [deliveryPhoto, setDeliveryPhoto] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { per_page: 50 };
      if (statusFilter) {
        params.status = statusFilter;
      }
      const response = await orderPedidoService.getMyOrders(params);
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const checkAuth = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/proveedor/login");
      return;
    }
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch {
      localStorage.removeItem("auth_token");
      router.push("/proveedor/login");
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, statusFilter, fetchOrders]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/proveedor/login");
  };

  const handlePickUp = async () => {
    if (!selectedOrder) return;
    try {
      await orderPedidoService.pickUp(selectedOrder.id);
      setPickUpOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error("Error picking up order:", error);
    }
  };

  const handleDeliver = async () => {
    if (!selectedOrder) return;
    try {
      await orderPedidoService.deliver(selectedOrder.id, {
        delivery_photo: deliveryPhoto || undefined,
      });
      setDeliverOpen(false);
      setSelectedOrder(null);
      setDeliveryPhoto("");
      setDeliveryNotes("");
      fetchOrders();
    } catch (error) {
      console.error("Error delivering order:", error);
    }
  };

  const openPickUp = (order: OrderPedido) => {
    setSelectedOrder(order);
    setPickUpOpen(true);
  };

  const openDeliver = (order: OrderPedido) => {
    setSelectedOrder(order);
    setDeliverOpen(true);
  };

  const statusColors: Record<OrderPedidoStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    assigned: "bg-blue-100 text-blue-800",
    picked_up: "bg-orange-100 text-orange-800",
    in_transit: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<OrderPedidoStatus, string> = {
    pending: "Pendiente",
    assigned: "Asignada",
    picked_up: "Recogida",
    in_transit: "En tránsito",
    delivered: "Entregada",
    cancelled: "Cancelada",
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Mis Órdenes de Pedido</h1>
            <p className="text-sm text-gray-500">Bienvenido, {user.name}</p>
          </div>
          <Button variant="outline" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <select
            className="px-3 py-2 border rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="assigned">Asignada</option>
            <option value="picked_up">Recogida</option>
            <option value="in_transit">En tránsito</option>
            <option value="delivered">Entregada</option>
          </select>
          <Button variant="outline" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No hay órdenes asignadas
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{order.order_number}</CardTitle>
                    <Badge className={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Client & Address */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">{order.client_name || "Sin cliente"}</p>
                      <p className="text-sm text-gray-500">{order.delivery_address || "Sin dirección"}</p>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="flex items-start gap-2">
                    <Package className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Productos:</p>
                      <ul className="text-sm text-gray-500">
                        {order.items?.map((item, idx) => (
                          <li key={idx}>
                            {item.quantity}x {item.product_name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Times */}
                  {order.picked_up_at && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      Recogida: {new Date(order.picked_up_at).toLocaleString("es-MX")}
                    </div>
                  )}
                  {order.delivered_at && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Clock className="h-4 w-4" />
                      Entregada: {new Date(order.delivered_at).toLocaleString("es-MX")}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex gap-2">
                    {order.status === "assigned" && (
                      <Button size="sm" onClick={() => openPickUp(order)}>
                        <Package className="h-4 w-4 mr-2" />
                        Registrar Recogida
                      </Button>
                    )}
                    {(order.status === "picked_up" || order.status === "in_transit") && (
                      <Button size="sm" onClick={() => openDeliver(order)}>
                        <Camera className="h-4 w-4 mr-2" />
                        Registrar Entrega
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Pick Up Dialog */}
      <Dialog open={pickUpOpen} onOpenChange={setPickUpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Recogida</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              ¿Confirmas que has recogido la orden <strong>{selectedOrder?.order_number}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              Se registrará la hora actual como hora de recogida.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPickUpOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handlePickUp}>
                Confirmar Recogida
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deliver Dialog */}
      <Dialog open={deliverOpen} onOpenChange={setDeliverOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Entrega</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Foto de evidencia (URL)</Label>
              <Input
                value={deliveryPhoto}
                onChange={(e) => setDeliveryPhoto(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Notas adicionales..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeliverOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleDeliver}>
                Confirmar Entrega
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
