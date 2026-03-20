import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

// Utility functions for transforming data
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function transformKeys(obj: any, transformer: (str: string) => string): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item, transformer));
  }

  const transformed: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = transformer(key);
    transformed[newKey] = transformKeys(value, transformer);
  }
  return transformed;
}

// API Client Configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Important for Sanctum cookies
});

// Request Interceptor - Add auth token and transform request data
apiClient.interceptors.request.use(
  (config) => {
    // Add operator token if available (for operator routes)
    const operatorToken = localStorage.getItem('operator_token');
    const authToken = localStorage.getItem('auth_token');
    
    // Prefer operator token for operator routes
    const token = operatorToken || authToken;
    console.log('[API Request]', config.url, 'Token:', token ? token.substring(0, 20) + '...' : 'Missing');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Transform request data to snake_case
    if (config.data && typeof config.data === 'object') {
      config.data = transformKeys(config.data, toSnakeCase);
    }

    // Transform query params to snake_case
    if (config.params && typeof config.params === 'object') {
      config.params = transformKeys(config.params, toSnakeCase);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Transform response data and handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Skip transformation for binary responses (PDF, images, etc.)
    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('application/pdf') || contentType.includes('application/octet-stream') || contentType.includes('blob')) {
      return response;
    }
    
    // Transform response data to camelCase
    if (response.data && typeof response.data === 'object') {
      response.data = transformKeys(response.data, toCamelCase);
    }
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        // Check if it's an operator session
        const isOperator = window.location.pathname.startsWith('/operador');
        
        // Only clear auth data and redirect if there's a token (meaning user was logged in)
        const hasAuthToken = localStorage.getItem('auth_token');
        const hasOperatorToken = localStorage.getItem('operator_token');
        
        if (hasAuthToken || hasOperatorToken) {
          // Clear auth data only if user had a token (was logged in)
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          localStorage.removeItem('operator_token');
          localStorage.removeItem('operator_user');
          
          // Redirect to appropriate login
          if (typeof window !== 'undefined') {
            if (isOperator) {
              window.location.href = '/operador/login';
            } else if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
        }
        // If no token, it means user was trying to access a public route without auth - don't redirect
      }
      
      // Server responded with error status
      const apiError: ApiError = {
        message: data?.message || data?.error || 'Error en la petición',
        errors: data?.errors,
        status,
      };
      throw apiError;
    } else if (error.request) {
      // Request was made but no response received
      throw {
        message: 'No se pudo conectar con el servidor',
        status: 0,
      } as ApiError;
    } else {
      // Something else happened
      throw {
        message: error.message || 'Error desconocido',
        status: 0,
      } as ApiError;
    }
  }
);

// API Methods
export const api = {
  // GET request
  get: <T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.get(url, { ...config, params }).then(res => res.data);
  },

  // POST request
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.post(url, data, config).then(res => res.data);
  },

  // PUT request
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.put(url, data, config).then(res => res.data);
  },

  // PATCH request
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.patch(url, data, config).then(res => res.data);
  },

  // DELETE request
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.delete(url, config).then(res => res.data);
  },
};

// Auth-specific methods
export const authApi = {
  // Login - returns token
  login: (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/login', credentials);
  },

  // Logout
  logout: (): Promise<void> => {
    return api.post('/logout');
  },

  // Get current user (requires token)
  getCurrentUser: (): Promise<AuthUser> => {
    return api.get<AuthUser>('/user');
  },

  // Register
  register: (data: { name: string; email: string; password: string }): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/register', data);
  },
};

// Operator-specific auth methods
export interface OperatorUser {
  id: number;
  employeeCode: string;
  name: string;
  shift: string;
  specialty: string;
}

export interface OperatorAuthResponse {
  operator: OperatorUser;
  token: string;
}

export const operatorAuthApi = {
  // Login with employee_code
  login: (employeeCode: string): Promise<OperatorAuthResponse> => {
    return api.post<OperatorAuthResponse>('/operator/login', { employee_code: employeeCode });
  },

  // Logout
  logout: (): Promise<void> => {
    return api.post('/operator/logout');
  },

  // Get current operator
  getCurrentOperator: (): Promise<OperatorUser> => {
    return api.get<OperatorUser>('/operator/user');
  },
};

// Export the client for advanced usage
export { apiClient };
export default api;