// Typed API client — single source for all HTTP calls to the backend
const BASE_URL = '/api';

function getToken(): string | null {
  return localStorage.getItem('stocksense_token');
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const json = await response.json();
  return json;
}

export const api = {
  auth: {
    register: (body: {
      loginId: string;
      email: string;
      name: string;
      role: string;
      password: string;
      confirmPassword: string;
    }) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

    login: (body: { loginId: string; password: string }) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

    forgotPassword: (body: { emailOrLoginId: string }) =>
      request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),

    resetPassword: (body: {
      emailOrLoginId: string;
      otp: string;
      newPassword: string;
      confirmPassword: string;
    }) =>
      request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),

    getMe: () => request('/auth/me')
  }
};
