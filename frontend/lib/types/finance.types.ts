/**
 * Tipos para el módulo de Finanzas
 * Bancos y Movimientos
 */

// Tipo de cuenta bancaria
export type BankAccountType = "checking" | "savings" | "credit";
export type BankAccountStatus = "active" | "inactive" | "blocked";

// Cuenta bancaria
export interface BankAccount {
  id: number;
  bank: string;
  name: string;
  description?: string;
  accountNumber?: string;
  clabe?: string;
  type: BankAccountType;
  currency: string;
  balance: number;
  availableBalance: number;
  status: BankAccountStatus;
  lastMovement?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Tipo de movimiento bancario
export type BankTransactionType = "income" | "expense" | "transfer";

// Movimiento bancario crudo
export interface BankTransaction {
  id: number;
  date: string;
  reference?: string;
  description: string;
  type: BankTransactionType;
  amount: number;
  balance: number;
  bank: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Tipo de movimiento consolidado
export type MovementType = "income" | "expense" | "transfer";
export type MovementStatus = "completed" | "pending" | "cancelled";

// Movimiento consolidado
export interface Movement {
  id: number;
  date: string;
  type: MovementType;
  category?: string;
  description?: string;
  reference?: string;
  bankAccountId?: number;
  bankAccount?: BankAccount;
  amount: number;
  balance: number;
  status: MovementStatus;
  createdAt?: string;
  updatedAt?: string;
}

// Resumen financiero
export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  accountsCount: number;
  pendingMovements: number;
}
