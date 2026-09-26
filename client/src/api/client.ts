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
  },
  dashboard: {
    getSummary: () => request('/dashboard/summary'),
    getOperations: (params?: { type?: string; status?: string; warehouse?: string; category?: string; search?: string }) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return request(`/dashboard/operations${query ? `?${query}` : ''}`);
    },
    getBottlenecks: () => request('/dashboard/bottlenecks'),
    getFilters: () => request('/dashboard/filters')
  },
  receipts: {
    getReceipts: (params?: { search?: string; status?: string }) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return request(`/receipts${query ? `?${query}` : ''}`);
    },
    getReceiptById: (id: string) => request(`/receipts/${id}`),
    createReceipt: (body: {
      partnerContact: string;
      sourceLocation?: string;
      destLocation?: string;
      scheduleDate: string;
      responsibleName?: string;
      lines: Array<{ productName: string; sku?: string; demandQty: number; uom?: string }>;
    }) => request('/receipts', { method: 'POST', body: JSON.stringify(body) }),
    updateStatus: (id: string, status: 'DRAFT' | 'READY' | 'DONE') =>
      request(`/receipts/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    dockAcceptance: (id: string, targetLocation: string) =>
      request(`/receipts/${id}/dock-accept`, { method: 'POST', body: JSON.stringify({ targetLocation }) }),
    getGRN: (id: string) => request(`/receipts/${id}/grn`)
  }
};
