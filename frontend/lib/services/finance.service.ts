/**
 * Servicio de Finanzas
 * Consume los endpoints de bancos y movimientos del backend Laravel
 */
import { apiClient } from "../api";
import type {
  BankAccount,
  BankTransaction,
  Movement,
  FinanceSummary,
  BankAccountType,
  BankAccountStatus,
  MovementType,
  MovementStatus,
} from "../types/finance.types";
import type { PaginatedResponse } from "../types/api.types";

// Transformar tipos de cuenta para el API
const transformAccountType = (type: string): BankAccountType => {
  const validTypes: BankAccountType[] = ["checking", "savings", "credit"];
  return validTypes.includes(type as BankAccountType) ? (type as BankAccountType) : "checking";
};

const transformAccountStatus = (status: string): BankAccountStatus => {
  const validStatuses: BankAccountStatus[] = ["active", "inactive", "blocked"];
  return validStatuses.includes(status as BankAccountStatus) ? (status as BankAccountStatus) : "active";
};

const transformMovementType = (type: string): MovementType => {
  const validTypes: MovementType[] = ["income", "expense", "transfer"];
  return validTypes.includes(type as MovementType) ? (type as MovementType) : "income";
};

const transformMovementStatus = (status: string): MovementStatus => {
  const validStatuses: MovementStatus[] = ["completed", "pending", "cancelled"];
  return validStatuses.includes(status as MovementStatus) ? (status as MovementStatus) : "pending";
};

// Datos mock para desarrollo
const mockBankAccounts: BankAccount[] = [
  {
    id: 1,
    bank: "BBVA",
    name: "Cuenta Principal",
    description: "Cuenta operativa principal",
    accountNumber: "1234567890",
    clabe: "012180001234567890",
    type: "checking",
    currency: "MXN",
    balance: 1250000.5,
    availableBalance: 1200000.0,
    status: "active",
    lastMovement: "2024-01-15",
  },
  {
    id: 2,
    bank: "Santander",
    name: "Cuenta de Nómina",
    description: "Cuenta para pagos de nómina",
    accountNumber: "9876543210",
    clabe: "012180009876543210",
    type: "checking",
    currency: "MXN",
    balance: 450000.75,
    availableBalance: 450000.75,
    status: "active",
    lastMovement: "2024-01-14",
  },
  {
    id: 3,
    bank: "Banorte",
    name: "Cuenta de Inversión",
    description: "Cuenta para inversiones a plazo",
    accountNumber: "5555666677",
    clabe: "012180005555666677",
    type: "savings",
    currency: "MXN",
    balance: 2500000.0,
    availableBalance: 2500000.0,
    status: "active",
    lastMovement: "2024-01-10",
  },
];

const mockMovements: Movement[] = [
  {
    id: 1,
    date: "2024-01-15",
    type: "income",
    category: "Ventas",
    description: "Pago de cliente ABC",
    reference: "FAC-2024-001",
    bankAccountId: 1,
    amount: 50000.0,
    balance: 1300000.5,
    status: "completed",
  },
  {
    id: 2,
    date: "2024-01-14",
    type: "expense",
    category: "Proveedores",
    description: "Pago a proveedor XYZ",
    reference: "PAG-2024-001",
    bankAccountId: 1,
    amount: 25000.0,
    balance: 1250000.5,
    status: "completed",
  },
  {
    id: 3,
    date: "2024-01-13",
    type: "transfer",
    category: "Nómina",
    description: "Transferencia a cuenta de nómina",
    reference: "TRF-2024-001",
    bankAccountId: 1,
    amount: 150000.0,
    balance: 1275000.5,
    status: "completed",
  },
  {
    id: 4,
    date: "2024-01-12",
    type: "income",
    category: "Otros",
    description: "Intereses bancarios",
    reference: "INT-2024-001",
    bankAccountId: 2,
    amount: 500.75,
    balance: 450500.75,
    status: "completed",
  },
  {
    id: 5,
    date: "2024-01-11",
    type: "expense",
    category: "Operativos",
    description: "Gastos operativos",
    reference: "GOP-2024-001",
    bankAccountId: 1,
    amount: 500.0,
    balance: 1425000.5,
    status: "completed",
  },
];

export const financeService = {
  // Bandera para modo demo - deshabilitado para usar backend
  _useDemo: false,

  /**
   * Obtener lista de cuentas bancarias para selects (solo id, bank y name)
   */
  async getBankAccountsSelectList(): Promise<{ id: number; bank: string; name: string }[]> {
    if (this._useDemo) {
      return mockBankAccounts.map(a => ({ id: a.id, bank: a.bank, name: a.name }));
    }

    const response = await apiClient.get<{ id: number; bank: string; name: string }[]>("/bank-accounts");
    return response.data;
  },

  /**
   * Obtener todas las cuentas bancarias
   */
  async getBankAccounts(): Promise<PaginatedResponse<BankAccount>> {
    if (this._useDemo) {
      return {
        data: mockBankAccounts,
        currentPage: 1,
        lastPage: 1,
        perPage: 15,
        total: mockBankAccounts.length,
        from: 0,
        to: mockBankAccounts.length,
      };
    }

    const response = await apiClient.get<PaginatedResponse<BankAccount>>("/bank-accounts");
    return response.data;
  },

  /**
   * Obtener lista de cuentas bancarias para selects (solo id, bank y name)
   */
  async getBankAccountsSelectList(): Promise<{ id: number; bank: string; name: string }[]> {
    if (this._useDemo) {
      return mockBankAccounts.map(a => ({ id: a.id, bank: a.bank, name: a.name }));
    }

    const response = await apiClient.get<{ id: number; bank: string; name: string }[]>("/bank-accounts");
    return response.data;
  },

  /**
   * Obtener una cuenta bancaria por ID
   */
  async getBankAccount(id: number): Promise<BankAccount | null> {
    if (this._useDemo) {
      return mockBankAccounts.find((a) => a.id === id) || null;
    }

    try {
      const response = await apiClient.get<BankAccount>(`/bank-accounts/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Crear una nueva cuenta bancaria
   */
  async createBankAccount(data: Partial<BankAccount>): Promise<BankAccount> {
    if (this._useDemo) {
      const newAccount: BankAccount = {
        id: mockBankAccounts.length + 1,
        bank: data.bank || "",
        name: data.name || "",
        description: data.description,
        accountNumber: data.accountNumber,
        clabe: data.clabe,
        type: transformAccountType(data.type || "checking"),
        currency: data.currency || "MXN",
        balance: data.balance || 0,
        availableBalance: data.availableBalance || 0,
        status: transformAccountStatus(data.status || "active"),
        lastMovement: new Date().toISOString().split("T")[0],
      };
      mockBankAccounts.push(newAccount);
      return newAccount;
    }

    const response = await apiClient.post<BankAccount>("/bank-accounts", data);
    return response.data;
  },

  /**
   * Actualizar una cuenta bancaria
   */
  async updateBankAccount(id: number, data: Partial<BankAccount>): Promise<BankAccount | null> {
    if (this._useDemo) {
      const index = mockBankAccounts.findIndex((a) => a.id === id);
      if (index === -1) return null;
      mockBankAccounts[index] = { ...mockBankAccounts[index], ...data };
      return mockBankAccounts[index];
    }

    try {
      const response = await apiClient.put<BankAccount>(`/bank-accounts/${id}`, data);
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Eliminar una cuenta bancaria
   */
  async deleteBankAccount(id: number): Promise<boolean> {
    if (this._useDemo) {
      const index = mockBankAccounts.findIndex((a) => a.id === id);
      if (index === -1) return false;
      mockBankAccounts.splice(index, 1);
      return true;
    }

    try {
      await apiClient.delete(`/bank-accounts/${id}`);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Obtener movimientos de una cuenta
   */
  async getMovements(params?: {
    bankAccountId?: number;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Movement>> {
    if (this._useDemo) {
      let filtered = [...mockMovements];
      if (params?.bankAccountId) {
        filtered = filtered.filter((m) => m.bankAccountId === params.bankAccountId);
      }
      if (params?.type) {
        filtered = filtered.filter((m) => m.type === params.type);
      }
      if (params?.status) {
        filtered = filtered.filter((m) => m.status === params.status);
      }
      return {
        data: filtered,
        currentPage: 1,
        lastPage: 1,
        perPage: 15,
        total: filtered.length,
        from: 0,
        to: filtered.length,
      };
    }

    const response = await apiClient.get<PaginatedResponse<Movement>>("/movements", { params });
    return response.data;
  },

  /**
   * Obtener todos los movimientos
   */
  async getAllMovements(): Promise<PaginatedResponse<Movement>> {
    if (this._useDemo) {
      return {
        data: mockMovements,
        currentPage: 1,
        lastPage: 1,
        perPage: 15,
        total: mockMovements.length,
        from: 0,
        to: mockMovements.length,
      };
    }

    const response = await apiClient.get<PaginatedResponse<Movement>>("/movements");
    return response.data;
  },

  /**
   * Crear un nuevo movimiento
   */
  async createMovement(data: Partial<Movement>): Promise<Movement> {
    if (this._useDemo) {
      const newMovement: Movement = {
        id: mockMovements.length + 1,
        date: data.date || new Date().toISOString().split("T")[0],
        type: transformMovementType(data.type || "income"),
        category: data.category,
        description: data.description || "",
        reference: data.reference,
        bankAccountId: data.bankAccountId,
        amount: data.amount || 0,
        balance: data.balance || 0,
        status: transformMovementStatus(data.status || "pending"),
      };
      mockMovements.push(newMovement);
      return newMovement;
    }

    const response = await apiClient.post<Movement>("/movements", data);
    return response.data;
  },

  /**
   * Actualizar un movimiento
   */
  async updateMovement(id: number, data: Partial<Movement>): Promise<Movement | null> {
    if (this._useDemo) {
      const index = mockMovements.findIndex((m) => m.id === id);
      if (index === -1) return null;
      mockMovements[index] = { ...mockMovements[index], ...data };
      return mockMovements[index];
    }

    try {
      const response = await apiClient.put<Movement>(`/movements/${id}`, data);
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Eliminar un movimiento
   */
  async deleteMovement(id: number): Promise<boolean> {
    if (this._useDemo) {
      const index = mockMovements.findIndex((m) => m.id === id);
      if (index === -1) return false;
      mockMovements.splice(index, 1);
      return true;
    }

    try {
      await apiClient.delete(`/movements/${id}`);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Obtener resumen financiero
   */
  async getFinanceSummary(): Promise<FinanceSummary> {
    if (this._useDemo) {
      const totalIncome = mockMovements
        .filter((m) => m.type === "income")
        .reduce((sum, m) => sum + m.amount, 0);
      const totalExpense = mockMovements
        .filter((m) => m.type === "expense")
        .reduce((sum, m) => sum + m.amount, 0);
      const pendingMovements = mockMovements.filter((m) => m.status === "pending").length;

      return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        accountsCount: mockBankAccounts.length,
        pendingMovements,
      };
    }

    const response = await apiClient.get<FinanceSummary>("/finance/summary");
    return response.data;
  },

  /**
   * Obtener transacciones bancarias
   */
  async getBankTransactions(): Promise<PaginatedResponse<BankTransaction>> {
    if (this._useDemo) {
      const transactions: BankTransaction[] = mockMovements.map((m): BankTransaction => ({
        id: m.id,
        date: m.date,
        reference: m.reference || "",
        description: m.description || "",
        type: m.type as "income" | "expense" | "transfer",
        amount: m.amount,
        balance: m.balance,
        bank: "General",
        category: m.category || "",
      }));
      return {
        data: transactions,
        currentPage: 1,
        lastPage: 1,
        perPage: 15,
        total: transactions.length,
        from: 0,
        to: transactions.length,
      };
    }

    const response = await apiClient.get<PaginatedResponse<BankTransaction>>("/bank-transactions");
    return response.data;
  },
};

/**
 * Servicio separado para cuentas bancarias (select lists)
 */
export const bankAccountsService = {
  getAll: async () => {
    const response = await apiClient.get<any[]>("/bank-accounts");
    return response.data;
  },
};
