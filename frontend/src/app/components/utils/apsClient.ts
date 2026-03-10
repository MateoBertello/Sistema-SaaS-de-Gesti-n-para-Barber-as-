import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

interface FetchOptions extends RequestInit {
  successMessage?: string;
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { successMessage, ...customOptions } = options;
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...customOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...customOptions.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
       localStorage.clear();
       window.location.href = '/';
       throw new Error("Sesión expirada");
    }
    const errorText = await response.text();
    const errorMessage = errorText ? (JSON.parse(errorText).error || errorText) : 'Error';
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }

  // 🛡️ SOLUCIÓN AL ERROR DE JSON: Leemos texto y parseamos si existe
  const text = await response.text();
  const data = text ? JSON.parse(text) : {}; 

  if (successMessage) toast.success(successMessage);
  return data as T;
}