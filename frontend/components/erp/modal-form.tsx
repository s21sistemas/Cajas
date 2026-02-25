"use client";

import React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "tel" | "date" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string | number;
}

interface ModalFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string | number>) => void;
  title: string;
  fields: FieldConfig[];
  initialData?: Record<string, string | number>;
  submitLabel?: string;
  isLoading?: boolean;
}

export function ModalForm({
  open,
  onClose,
  onSubmit,
  title,
  fields,
  initialData,
  submitLabel = "Guardar",
  isLoading = false,
}: ModalFormProps) {
  const [formData, setFormData] = useState<Record<string, string | number>>({});

  useEffect(() => {
    if (open) {
      const initial: Record<string, string | number> = {};
      fields.forEach((field) => {
        if (initialData && initialData[field.name] !== undefined) {
          initial[field.name] = initialData[field.name];
        } else if (field.defaultValue !== undefined) {
          initial[field.name] = field.defaultValue;
        } else {
          initial[field.name] = "";
        }
      });
      setFormData(initial);
    }
  }, [open, fields, initialData]);

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {fields.map((field) => (
              <div key={field.name} className="grid gap-2">
                <Label htmlFor={field.name} className="text-foreground">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {field.type === "select" ? (
                  <Select
                    value={String(formData[field.name] || "")}
                    onValueChange={(value) => handleChange(field.name, value)}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder={field.placeholder || "Seleccionar..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    value={String(formData[field.name] || "")}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="bg-input border-border min-h-[80px]"
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    value={String(formData[field.name] || "")}
                    onChange={(e) =>
                      handleChange(
                        field.name,
                        field.type === "number" ? Number(e.target.value) : e.target.value
                      )
                    }
                    placeholder={field.placeholder}
                    required={field.required}
                    className="bg-input border-border"
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Confirmation dialog
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[400px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground py-4">{description}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Procesando..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// View detail dialog
interface ViewDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: { label: string; value: React.ReactNode }[];
}

export function ViewDialog({ open, onClose, title, data }: ViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {data.map((item, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2 items-start">
              <span className="text-sm text-muted-foreground">{item.label}:</span>
              <span className="text-sm text-foreground col-span-2">{item.value}</span>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
