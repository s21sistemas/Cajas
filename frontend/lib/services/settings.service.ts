import { api } from "@/lib/api";

export interface Settings {
  company?: {
    name?: string;
    rfc?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
  };
  production?: {
    defaultShift?: string;
    hoursPerShift?: number;
    breaksPerShift?: number;
    breakDuration?: number;
    overtimeMultiplier?: number;
    holidayMultiplier?: number;
    qualityThreshold?: number;
    scrapThreshold?: number;
    machinesDeletePin?: string;
  };
  notifications?: {
    emailAlerts?: boolean;
    lowStockAlerts?: boolean;
    maintenanceReminders?: boolean;
    productionAlerts?: boolean;
    hrNotifications?: boolean;
    dailyReports?: boolean;
    weeklyReports?: boolean;
  };
  system?: {
    language?: string;
    timezone?: string;
    dateFormat?: string;
    currency?: string;
    theme?: string;
    autoBackup?: boolean;
    backupFrequency?: string;
  };
}

class SettingsService {
  private resource = "/settings";

  async getAll(): Promise<Settings> {
    return await api.get<Settings>(this.resource);
  }

  async getByModule(module: string): Promise<any> {
    return await api.get<any>(`${this.resource}/${module}`);
  }

  async update(module: string, key: string, value: any): Promise<any> {
    return await api.put<any>(`${this.resource}/${module}/${key}`, { value });
  }

  async delete(module: string, key: string): Promise<void> {
    return await api.delete<void>(`${this.resource}/${module}/${key}`);
  }

  async uploadLogo(file: File): Promise<{ message: string; url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/settings/company/logo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Error al subir el logo');
    }
    
    return response.json();
  }

  async deleteLogo(): Promise<{ message: string }> {
    return await api.delete<{ message: string }>('/settings/company/logo');
  }
}

export const settingsService = new SettingsService();
