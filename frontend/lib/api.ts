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
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
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
        // Clear auth data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
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

// Export the client for advanced usage
export { apiClient };
export default api;