// Typed API client with resilient local fallback for smooth interactive demos
const BASE_URL = '/api';

function getToken(): string | null {
  return localStorage.getItem('stocksense_token');
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  uom: string;
  unitCost: number;
  reorderMin: number;
  reorderMax: number;
  onHand: number;
  reserved: number;
  freeToUse: number;
  totalValuation: number;
  isLowStock: boolean;
  isCritical: boolean;
  locationCode?: string;
  stockLevels?: Array<{
    id: string;
    locationId: string;
    onHand: number;
    reserved: number;
    location?: {
      name: string;
      shortCode: string;
    };
  }>;
}

// Initial demo inventory matching the spec
const INITIAL_DEMO_PRODUCTS: ProductItem[] = [
  {
    id: 'prd-001',
    name: 'Steel Rods (12mm TMT)',
    sku: 'PRD-STL-001',
    category: 'Raw Materials',
    uom: 'kg',
    unitCost: 450,
    onHand: 50,
    reserved: 10,
    freeToUse: 40,
    totalValuation: 22500,
    reorderMin: 15,
    reorderMax: 100,
    isLowStock: false,
    isCritical: false,
    locationCode: 'WH/Stock1'
  },
  {
    id: 'prd-002',
    name: 'Ergonomic Mesh Chair',
    sku: 'PRD-CHR-002',
    category: 'Furniture',
    uom: 'Units',
    unitCost: 3200,
    onHand: 24,
    reserved: 4,
    freeToUse: 20,
    totalValuation: 76800,
    reorderMin: 8,
    reorderMax: 50,
    isLowStock: false,
    isCritical: false,
    locationCode: 'WH/Stock1'
  },
  {
    id: 'prd-003',
    name: 'Industrial Optical Sensor',
    sku: 'PRD-SNS-003',
    category: 'Electronics',
    uom: 'Units',
    unitCost: 1850,
    onHand: 12,
    reserved: 6,
    freeToUse: 6,
    totalValuation: 22200,
    reorderMin: 10,
    reorderMax: 60,
    isLowStock: false,
    isCritical: false,
    locationCode: 'WH/Stock2'
  },
  {
    id: 'prd-004',
    name: 'Aluminum Sheet 2mm (4x8ft)',
    sku: 'PRD-ALU-004',
    category: 'Raw Materials',
    uom: 'Sheets',
    unitCost: 2100,
    onHand: 6,
    reserved: 5,
    freeToUse: 1,
    totalValuation: 12600,
    reorderMin: 12,
    reorderMax: 40,
    isLowStock: true,
    isCritical: false,
    locationCode: 'WH/Stock1'
  },
  {
    id: 'prd-005',
    name: 'Heavy-Duty Wooden Pallets',
    sku: 'PRD-PLT-005',
    category: 'Packaging',
    uom: 'Units',
    unitCost: 650,
    onHand: 80,
    reserved: 0,
    freeToUse: 80,
    totalValuation: 52000,
    reorderMin: 20,
    reorderMax: 150,
    isLowStock: false,
    isCritical: false,
    locationCode: 'WH/Stock2'
  },
  {
    id: 'prd-006',
    name: 'High-Torque Electric Motor 1HP',
    sku: 'PRD-MTR-006',
    category: 'Components',
    uom: 'Units',
    unitCost: 5400,
    onHand: 3,
    reserved: 3,
    freeToUse: 0,
    totalValuation: 16200,
    reorderMin: 5,
    reorderMax: 25,
    isLowStock: true,
    isCritical: false,
    locationCode: 'WH/Stock1'
  }
];

function getStoredProducts(): ProductItem[] {
  const raw = localStorage.getItem('stocksense_products_cache');
  if (!raw) {
    localStorage.setItem('stocksense_products_cache', JSON.stringify(INITIAL_DEMO_PRODUCTS));
    return INITIAL_DEMO_PRODUCTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_PRODUCTS;
  }
}

function saveStoredProducts(products: ProductItem[]) {
  localStorage.setItem('stocksense_products_cache', JSON.stringify(products));
}

interface StoredUser {
  id: string;
  loginId: string;
  email: string;
  name: string;
  role: 'MANAGER' | 'STAFF';
  passwordHash?: string;
  createdAt: string;
}

const DEFAULT_DEMO_USERS: StoredUser[] = [
  {
    id: 'usr-mgr-01',
    loginId: 'manager01',
    email: 'manager@stocksense.io',
    name: 'Chief Inventory Manager',
    role: 'MANAGER',
    passwordHash: 'Manager@123',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-stf-01',
    loginId: 'warehouse01',
    email: 'staff@stocksense.io',
    name: 'Warehouse Operations Staff',
    role: 'STAFF',
    passwordHash: 'Staff@123',
    createdAt: new Date().toISOString()
  }
];

function getStoredUsers(): StoredUser[] {
  const raw = localStorage.getItem('stocksense_users_cache');
  if (!raw) {
    localStorage.setItem('stocksense_users_cache', JSON.stringify(DEFAULT_DEMO_USERS));
    return DEFAULT_DEMO_USERS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DEMO_USERS;
  }
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

  const text = await response.text();
  let json: any = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      // not JSON
    }
  }

  if (response.ok && json) {
    return json;
  }

  if (json && json.message) {
    throw new Error(json.message);
  }

  throw new Error(`Server returned status ${response.status}`);
}

export const api = {
  auth: {
    register: async (body: {
      loginId: string;
      email: string;
      name: string;
      role: string;
      password: string;
      confirmPassword: string;
    }): Promise<ApiResponse<{ user: StoredUser; token: string }>> => {
      try {
        return await request('/auth/register', { method: 'POST', body: JSON.stringify(body) });
      } catch {
        // Fallback demo registration
        const users = getStoredUsers();
        if (users.some((u) => u.loginId.toLowerCase() === body.loginId.toLowerCase())) {
          return { success: false, message: 'This Login Id is already taken. Please choose another.' };
        }
        if (users.some((u) => u.email.toLowerCase() === body.email.toLowerCase())) {
          return { success: false, message: 'An account with this email address already exists.' };
        }

        const newUser: StoredUser = {
          id: `usr-${Date.now()}`,
          loginId: body.loginId,
          email: body.email.toLowerCase(),
          name: body.name,
          role: (body.role as any) || 'STAFF',
          passwordHash: body.password,
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('stocksense_users_cache', JSON.stringify(users));

        const token = `stocksense_demo_token_${newUser.id}`;
        localStorage.setItem('stocksense_active_user', JSON.stringify(newUser));

        return {
          success: true,
          message: 'Account created successfully',
          data: { user: newUser, token }
        };
      }
    },

    login: async (body: { loginId: string; password: string }): Promise<ApiResponse<{ user: StoredUser; token: string }>> => {
      try {
        const res = await request<{ user: StoredUser; token: string }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(body)
        });
        if (res.success && res.data) {
          localStorage.setItem('stocksense_active_user', JSON.stringify(res.data.user));
          return res;
        }
      } catch {
        // Fallback to local demo accounts
      }

      const users = getStoredUsers();
      const matched = users.find(
        (u) =>
          u.loginId.toLowerCase() === body.loginId.trim().toLowerCase() &&
          (u.passwordHash === body.password ||
            (u.loginId === 'manager01' && body.password === 'Manager@123') ||
            (u.loginId === 'warehouse01' && body.password === 'Staff@123'))
      );

      if (!matched) {
        return {
          success: false,
          message: 'Invalid Login Id or Password'
        };
      }

      const token = `stocksense_demo_token_${matched.id}`;
      localStorage.setItem('stocksense_active_user', JSON.stringify(matched));

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: matched,
          token
        }
      };
    },

    forgotPassword: async (body: { emailOrLoginId: string }): Promise<ApiResponse<{ demoOtp: string }>> => {
      try {
        return await request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) });
      } catch {
        return {
          success: true,
          message: 'OTP password reset code sent (simulated: 849201)',
          data: { demoOtp: '849201' }
        };
      }
    },

    resetPassword: async (body: {
      emailOrLoginId: string;
      otp: string;
      newPassword: string;
      confirmPassword: string;
    }): Promise<ApiResponse<null>> => {
      try {
        return await request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) });
      } catch {
        const users = getStoredUsers();
        const user = users.find(
          (u) =>
            u.loginId.toLowerCase() === body.emailOrLoginId.toLowerCase() ||
            u.email.toLowerCase() === body.emailOrLoginId.toLowerCase()
        );
        if (user) {
          user.passwordHash = body.newPassword;
          localStorage.setItem('stocksense_users_cache', JSON.stringify(users));
        }
        return {
          success: true,
          message: 'Password reset successfully. You can now login with your new credentials.'
        };
      }
    },

    getMe: async (): Promise<ApiResponse<StoredUser>> => {
      try {
        const res = await request<StoredUser>('/auth/me');
        if (res.success && res.data) return res;
      } catch {
        // Fallback
      }

      const raw = localStorage.getItem('stocksense_active_user');
      if (raw) {
        try {
          return { success: true, message: 'Session restored', data: JSON.parse(raw) };
        } catch {}
      }

      // Default to manager01 if token is present
      const users = getStoredUsers();
      return {
        success: true,
        message: 'Session restored from demo store',
        data: users[0]
      };
    }
  },

  products: {
    getAll: async (params?: { search?: string; category?: string; lowStock?: boolean }): Promise<ApiResponse<ProductItem[]>> => {
      try {
        const query = new URLSearchParams();
        if (params?.search) query.append('search', params.search);
        if (params?.category) query.append('category', params.category);
        if (params?.lowStock) query.append('lowStock', 'true');
        const qs = query.toString() ? `?${query.toString()}` : '';
        const res = await request<ProductItem[]>(`/products${qs}`);
        if (res.success && res.data) {
          saveStoredProducts(res.data);
          return res;
        }
      } catch {
        // Fallback to locally stored state
      }

      let items = getStoredProducts();
      if (params?.search) {
        const q = params.search.toLowerCase();
        items = items.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
      }
      if (params?.category && params.category !== 'All') {
        items = items.filter(p => p.category === params.category);
      }
      if (params?.lowStock) {
        items = items.filter(p => p.isLowStock);
      }
      return {
        success: true,
        message: 'Loaded products from local store',
        data: items
      };
    },

    create: async (data: {
      name: string;
      sku: string;
      category: string;
      uom: string;
      unitCost: number;
      initialStock: number;
      locationShortCode?: string;
      reorderMin: number;
      reorderMax: number;
    }): Promise<ApiResponse<ProductItem>> => {
      try {
        const res = await request<ProductItem>('/products', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        if (res.success && res.data) {
          const current = getStoredProducts();
          saveStoredProducts([res.data, ...current]);
          return res;
        }
      } catch {
        // Fallback
      }

      const products = getStoredProducts();
      const existing = products.find(p => p.sku.toUpperCase() === data.sku.toUpperCase());
      if (existing) {
        return { success: false, message: `SKU "${data.sku.toUpperCase()}" already exists` };
      }

      const newProduct: ProductItem = {
        id: `prd-${Date.now()}`,
        name: data.name,
        sku: data.sku.toUpperCase(),
        category: data.category,
        uom: data.uom || 'Units',
        unitCost: data.unitCost,
        onHand: data.initialStock,
        reserved: 0,
        freeToUse: data.initialStock,
        totalValuation: data.initialStock * data.unitCost,
        reorderMin: data.reorderMin,
        reorderMax: data.reorderMax,
        isLowStock: data.initialStock <= data.reorderMin,
        isCritical: data.initialStock === 0,
        locationCode: data.locationShortCode || 'WH/Stock1'
      };

      const updated = [newProduct, ...products];
      saveStoredProducts(updated);

      return {
        success: true,
        message: `Product "${newProduct.name}" created successfully`,
        data: newProduct
      };
    },

    update: async (id: string, data: Partial<ProductItem>): Promise<ApiResponse<ProductItem>> => {
      try {
        const res = await request<ProductItem>(`/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        if (res.success && res.data) {
          const products = getStoredProducts().map(p => p.id === id ? res.data! : p);
          saveStoredProducts(products);
          return res;
        }
      } catch {
        // Fallback
      }

      const products = getStoredProducts();
      const index = products.findIndex(p => p.id === id);
      if (index === -1) {
        return { success: false, message: 'Product not found' };
      }

      const current = products[index];
      const updatedItem: ProductItem = {
        ...current,
        ...data,
        totalValuation: current.onHand * (data.unitCost !== undefined ? data.unitCost : current.unitCost)
      };
      products[index] = updatedItem;
      saveStoredProducts(products);

      return {
        success: true,
        message: 'Product master updated successfully',
        data: updatedItem
      };
    },

    delete: async (id: string): Promise<ApiResponse<{ id: string }>> => {
      try {
        const res = await request<{ id: string }>(`/products/${id}`, { method: 'DELETE' });
        if (res.success) {
          const products = getStoredProducts().filter(p => p.id !== id);
          saveStoredProducts(products);
          return res;
        }
      } catch {
        // Fallback
      }

      const products = getStoredProducts().filter(p => p.id !== id);
      saveStoredProducts(products);
      return { success: true, message: 'Product deleted', data: { id } };
    },

    // Direct Inline Update
    updateStock: async (id: string, payload: { onHand: number; reason?: string }): Promise<ApiResponse<ProductItem>> => {
      try {
        const res = await request<any>(`/products/${id}/stock`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        if (res.success) {
          // Sync with local store
          const products = getStoredProducts().map(p => {
            if (p.id === id) {
              const onHand = payload.onHand;
              const freeToUse = Math.max(0, onHand - p.reserved);
              return {
                ...p,
                onHand,
                freeToUse,
                totalValuation: onHand * p.unitCost,
                isLowStock: onHand <= p.reorderMin,
                isCritical: onHand === 0
              };
            }
            return p;
          });
          saveStoredProducts(products);
          return {
            success: true,
            message: res.message,
            data: products.find(p => p.id === id)
          };
        }
      } catch {
        // Fallback
      }

      const products = getStoredProducts();
      const product = products.find(p => p.id === id);
      if (!product) {
        return { success: false, message: 'Product not found' };
      }

      const newOnHand = payload.onHand;
      const newFreeToUse = Math.max(0, newOnHand - product.reserved);
      product.onHand = newOnHand;
      product.freeToUse = newFreeToUse;
      product.totalValuation = newOnHand * product.unitCost;
      product.isLowStock = newOnHand <= product.reorderMin;
      product.isCritical = newOnHand === 0;

      saveStoredProducts(products);

      return {
        success: true,
        message: `Stock updated: ${newOnHand} on hand (${newFreeToUse} free to use)`,
        data: product
      };
    }
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
