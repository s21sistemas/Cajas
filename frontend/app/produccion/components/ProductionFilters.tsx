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
}

export function ProductionFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  onCreateClick,
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
  );
}
