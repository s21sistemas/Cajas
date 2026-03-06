import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Clock, Truck, Package, CheckCircle, XCircle } from "lucide-react";
import type { OrderPedidoStats } from "@/lib/types/order-pedido.types";

interface OrdenPedidoStatsCardsProps {
  stats: OrderPedidoStats;
}

export function OrdenPedidoStatsCards({ stats }: OrdenPedidoStatsCardsProps) {
  const cards = [
    {
      title: "Total",
      value: stats.total,
      icon: <ClipboardList className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pendientes",
      value: stats.pending,
      icon: <Clock className="h-5 w-5" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Asignadas",
      value: stats.assigned,
      icon: <Truck className="h-5 w-5" />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Recogidas",
      value: stats.picked_up,
      icon: <Package className="h-5 w-5" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Entregadas",
      value: stats.delivered,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Canceladas",
      value: stats.cancelled,
      icon: <XCircle className="h-5 w-5" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-md ${card.bgColor}`}>
                <span className={card.color}>{card.icon}</span>
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
