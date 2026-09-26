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
  fulfillment: {
    getDeliveries: (params?: { search?: string; status?: string }) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return request(`/fulfillment/deliveries${query ? `?${query}` : ''}`);
    },
    getDeliveryById: (id: string) => request(`/fulfillment/deliveries/${id}`),
    createDelivery: (body: {
      partnerContact: string;
      deliveryAddress: string;
      scheduleDate: string;
      responsibleName?: string;
      lines: Array<{ productName: string; sku?: string; demandQty: number; rackLocation?: string; uom?: string }>;
    }) => request('/fulfillment/deliveries', { method: 'POST', body: JSON.stringify(body) }),
    updateDeliveryStatus: (id: string, status: 'DRAFT' | 'WAITING' | 'READY' | 'DONE') =>
      request(`/fulfillment/deliveries/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    getPickingRoute: (id: string) => request(`/fulfillment/deliveries/${id}/picking-route`),
    getInternalTransfers: () => request('/fulfillment/transfers'),
    createInternalTransfer: (body: {
      sourceLocation: string;
      destLocation: string;
      scheduleDate: string;
      responsibleName?: string;
      lines: Array<{ productName: string; sku?: string; demandQty: number; uom?: string }>;
    }) => request('/fulfillment/transfers', { method: 'POST', body: JSON.stringify(body) }),
    updateTransferStatus: (id: string, status: 'DRAFT' | 'READY' | 'DONE') =>
      request(`/fulfillment/transfers/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    getAdjustments: () => request('/fulfillment/adjustments'),
    createAdjustment: (body: {
      location: string;
      productName: string;
      sku?: string;
      recordedQty: number;
      countedQty: number;
      reasonTag: 'Damaged' | 'Theft' | 'Expired' | 'Misplaced' | 'Data Correction';
      responsibleName?: string;
    }) => request('/fulfillment/adjustments', { method: 'POST', body: JSON.stringify(body) })
  }
};
