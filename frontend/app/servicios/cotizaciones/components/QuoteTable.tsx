"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Eye, Pencil, Trash2, Mail, FileDown } from "lucide-react";
import type { Quote, QuoteStatus } from "@/lib/types";

interface QuoteTableProps {
  quotes: Quote[];
  search: string;
  onSearchChange: (value: string) => void;
  onView: (quote: Quote) => void;
  onEdit: (quote: Quote) => void;
  onDelete: (quote: Quote) => void;
  onSendEmail?: (quote: Quote) => void;
  onDownloadPdf?: (quote: Quote) => void;
  loading?: boolean;
  currentPage: number;
  lastPage: number;
  totalQuotes: number;
  onPageChange: (page: number) => void;
  formatCurrency: (value: number) => string;
  formatDate: (dateStr: string) => string;
}

const getStatusBadge = (status: QuoteStatus) => {
  const variants: Record<string, string> = {
    draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    approved: "bg-green-500/20 text-green-400 border-green-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    expired: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };
  const labels: Record<string, string> = {
    draft: "Borrador",
    sent: "Enviada",
    approved: "Aprobada",
    rejected: "Rechazada",
    expired: "Expirada",
  };
  return <Badge className={variants[status]}>{labels[status]}</Badge>;
};

export function QuoteTable({
  quotes,
  search,
  onSearchChange,
  onView,
  onEdit,
  onDelete,
  onSendEmail,
  onDownloadPdf,
  loading = false,
  currentPage,
  lastPage,
  totalQuotes,
  onPageChange,
  formatCurrency,
  formatDate,
}: QuoteTableProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-foreground">Lista de Cotizaciones</CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cotización..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-input border-border"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Cotización</TableHead>
                <TableHead className="text-muted-foreground">Cliente</TableHead>
                <TableHead className="text-muted-foreground">Título</TableHead>
                <TableHead className="text-muted-foreground">Items</TableHead>
                <TableHead className="text-muted-foreground">Total</TableHead>
                <TableHead className="text-muted-foreground">Válido hasta</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : quotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay cotizaciones registradas.
                  </TableCell>
                </TableRow>
              ) : (
                quotes.map((quote) => (
                  <TableRow key={quote.id} className="border-border">
                    <TableCell className="font-mono text-sm text-foreground">
                      {quote.code}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {quote.client?.name || (quote as any).clientName || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Por: {quote.createdBy}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground max-w-[200px] truncate">
                      {quote.title}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {(quote as any).itemsCount || (quote as any).items_count || 0}
                    </TableCell>
                    <TableCell className="text-foreground font-medium">
                      {formatCurrency(quote.total)}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {formatDate(quote.validUntil)}
                    </TableCell>
                    <TableCell>{getStatusBadge(quote.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(quote)}>
                            <Eye className="h-4 w-4 mr-2" /> Ver detalle
                          </DropdownMenuItem>
                          {onDownloadPdf && (
                            <DropdownMenuItem onClick={() => onDownloadPdf(quote)}>
                              <FileDown className="h-4 w-4 mr-2" /> Descargar PDF
                            </DropdownMenuItem>
                          )}
                          {onSendEmail && quote.status !== 'sent' && quote.status !== 'approved' && quote.status !== 'rejected' && (
                            <DropdownMenuItem onClick={() => onSendEmail(quote)}>
                              <Mail className="h-4 w-4 mr-2" /> Enviar por correo
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onEdit(quote)}>
                            <Pencil className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDelete(quote)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalQuotes > 0 && (
          <div className="flex items-center justify-between border-t pt-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {quotes.length} de {totalQuotes} cotizaciones
            </p>
            {lastPage > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  Página {currentPage} de {lastPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === lastPage || loading}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
