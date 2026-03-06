import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus } from 'lucide-react';

interface ProductionFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  onCreateClick: () => void;
  // Filtros: Cliente, Venta, Orden de Trabajo
  clients?: { id: number; name: string }[];
  selectedClient?: string;
  onClientChange?: (clientId: string) => void;
  sales?: { id: number; code: string }[];
  selectedSale?: string;
  onSaleChange?: (saleId: string) => void;
  workOrders?: { id: number; code: string }[];
  selectedWorkOrder?: string;
  onWorkOrderChange?: (workOrderId: string) => void;
}

export function ProductionFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  onCreateClick,
  clients = [],
  selectedClient,
  onClientChange,
  sales = [],
  selectedSale,
  onSaleChange,
  workOrders = [],
  selectedWorkOrder,
  onWorkOrderChange,
}: ProductionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar orden..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-secondary border-border text-foreground"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {/* Filtro por Orden de Trabajo */}
        {onWorkOrderChange && (
          <Select value={selectedWorkOrder} onValueChange={onWorkOrderChange}>
            <SelectTrigger className="w-40 bg-secondary border-border">
              <SelectValue placeholder="Todas las OT" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las OT</SelectItem>
              {workOrders.map((wo) => (
                <SelectItem key={wo.id} value={wo.id.toString()}>
                  {wo.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {/* Filtro por Cliente */}
        {onClientChange && (
          <Select value={selectedClient} onValueChange={onClientChange}>
            <SelectTrigger className="w-40 bg-secondary border-border">
              <SelectValue placeholder="Todos los clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los clientes</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {/* Filtro por Venta */}
        {onSaleChange && (
          <Select value={selectedSale} onValueChange={onSaleChange}>
            <SelectTrigger className="w-40 bg-secondary border-border">
              <SelectValue placeholder="Todas las ventas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ventas</SelectItem>
              {sales.map((sale) => (
                <SelectItem key={sale.id} value={sale.id.toString()}>
                  {sale.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {/* Filtro por Status */}
        <Select value={filterStatus} onValueChange={onFilterStatusChange}>
          <SelectTrigger className="w-40 bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="in_progress">En Proceso</SelectItem>
            <SelectItem value="paused">Pausado</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={onCreateClick} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Orden
        </Button>
      </div>
    </div>
  );
}
