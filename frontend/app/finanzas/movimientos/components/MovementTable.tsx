"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight } from "lucide-react";
import type { Movement } from "@/lib/types/finance.types";

interface MovementTableProps {
  movements: Movement[];
  formatCurrency: (amount: number, currency?: string) => string;
  onEdit: (movement: Movement) => void;
  onDelete: (id: number) => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "income":
      return <ArrowDownRight className="h-4 w-4 text-green-400" />;
    case "expense":
      return <ArrowUpRight className="h-4 w-4 text-red-400" />;
    case "transfer":
      return <ArrowLeftRight className="h-4 w-4 text-blue-400" />;
    default:
      return <ArrowLeftRight className="h-4 w-4" />;
  }
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case "income":
      return <Badge className="bg-green-500/20 text-green-400">Ingreso</Badge>;
    case "expense":
      return <Badge className="bg-red-500/20 text-red-400">Gasto</Badge>;
    case "transfer":
      return <Badge className="bg-blue-500/20 text-blue-400">Transferencia</Badge>;
    default:
      return <Badge>{type}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-500/20 text-green-400">Completado</Badge>;
    case "pending":
      return <Badge className="bg-yellow-500/20 text-yellow-400">Pendiente</Badge>;
    case "cancelled":
      return <Badge className="bg-red-500/20 text-red-400">Cancelado</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export function MovementTable({ movements, formatCurrency, onEdit, onDelete }: MovementTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border">
          <TableHead className="text-muted-foreground">Fecha</TableHead>
          <TableHead className="text-muted-foreground">Banco</TableHead>
          <TableHead className="text-muted-foreground">Cuenta</TableHead>
          <TableHead className="text-muted-foreground">Referencia</TableHead>
          <TableHead className="text-muted-foreground">Categoría</TableHead>
          <TableHead className="text-muted-foreground">Descripción</TableHead>
          <TableHead className="text-muted-foreground">Tipo</TableHead>
          <TableHead className="text-muted-foreground text-right">Monto</TableHead>
          <TableHead className="text-muted-foreground">Estado</TableHead>
          <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((movement: Movement) => (
          <TableRow key={movement.id} className="border-border">
            <TableCell className="text-muted-foreground">{formatDate(movement.date)}</TableCell>
            <TableCell className="text-muted-foreground">{movement.bankAccount?.bank}</TableCell>
            <TableCell className="text-muted-foreground">{movement.bankAccount?.clabe}</TableCell>
            <TableCell className="font-mono text-sm text-primary">{movement.reference}</TableCell>
            <TableCell className="text-muted-foreground">{movement.category}</TableCell>
            <TableCell className="text-foreground">{movement.description}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {getTypeIcon(movement.type)}
                {getTypeBadge(movement.type)}
              </div>
            </TableCell>
            <TableCell className={`text-right font-medium ${movement.type === "income" ? "text-green-400" : "text-red-400"}`}>
              {movement.type === "expense" ? "-" : "+"}{formatCurrency(movement.amount)}
            </TableCell>
            <TableCell>{getStatusBadge(movement.status)}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEdit(movement)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(movement.id)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-destructive">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
