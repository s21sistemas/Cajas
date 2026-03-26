import { api } from '@/lib/api';

export const clientAuthService = {
  // Generate approval link for a client (requires system authentication)
  generateApprovalLink: async (data: {
    client_id: number;
    sale_id?: number;
    quote_id?: number;
  }): Promise<{ approval_url: string; expires_at: string }> => {
    return api.post('/client/generate-approval-link', data);
  },

  // Login as client
  login: async (email: string, password: string): Promise<any> => {
    return api.post('/client/login', { email, password });
  },

  // Set password for client (first time)
  setPassword: async (token: string, password: string, passwordConfirmation: string): Promise<any> => {
    return api.post('/client/set-password', {
      token,
      password,
      password_confirmation: passwordConfirmation,
    });
  },

  // Get approval info from token
  getApprovalInfo: async (token: string): Promise<any> => {
    return api.get(`/client/approval-info?token=${token}`);
  },

  // Upload document and approve
  approveDocument: async (
    token: string,
    type: 'sale' | 'quote',
    id: number,
    document: File,
    notes?: string
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('type', type);
    formData.append('id', id.toString());
    formData.append('document', document);
    if (notes) {
      formData.append('notes', notes);
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/approve-document`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al aprobar documento');
    }

    return response.json();
  },
};
