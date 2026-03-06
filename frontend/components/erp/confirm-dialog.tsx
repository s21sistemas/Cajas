"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm?: () => Promise<void> | void;
  showPinInput?: boolean;
  pinPlaceholder?: string;
  onConfirmWithPin?: (pin: string) => Promise<void> | void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  onConfirm,
  showPinInput = false,
  pinPlaceholder = "Ingrese PIN",
  onConfirmWithPin,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState("");

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (showPinInput && onConfirmWithPin) {
        await onConfirmWithPin(pin);
      } else if (onConfirm) {
        await onConfirm();
      }
    } finally {
      setLoading(false);
      setPin("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setPin("");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {showPinInput && (
          <div className="py-2">
            <Input
              type="password"
              placeholder={pinPlaceholder}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={6}
              className="text-center tracking-widest font-mono"
              autoFocus
            />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={loading || (showPinInput && pin.length === 0)}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
