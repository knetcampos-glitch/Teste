import type {
  ServiceOrderStatus,
  ServiceOrder,
  Customer,
  Equipment,
  GoogleReview,
  CompanySettings,
  AdminUser,
  PublicServiceRequest,
} from '../types/index.ts';

const TOKEN_KEY = 'techfix_admin_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Ocorreu um erro no servidor.');
  }

  return data;
}

export const api = {
  // Public
  getCompany: () => request<CompanySettings>('/api/public/company'),
  getReviews: () =>
    request<{
      rating: number;
      totalReviews: number;
      googleReviewUrl: string;
      reviews: GoogleReview[];
    }>('/api/public/reviews'),
  submitServiceRequest: (body: Partial<PublicServiceRequest>) =>
    request<{ success: boolean; message: string; request: PublicServiceRequest }>(
      '/api/public/service-request',
      { method: 'POST', body: JSON.stringify(body) }
    ),
  searchOrderPublic: (query: string, doc?: string) =>
    request<ServiceOrder>(
      `/api/public/os/search?q=${encodeURIComponent(query)}${doc ? `&doc=${encodeURIComponent(doc)}` : ''}`
    ),
  getOrderByCodePublic: (code: string) => request<ServiceOrder>(`/api/public/os/${encodeURIComponent(code)}`),
  budgetActionPublic: (code: string, action: 'Aprovar' | 'Recusar', clientName?: string, notes?: string) =>
    request<{ success: boolean; message: string; order: ServiceOrder }>(
      `/api/public/os/${encodeURIComponent(code)}/budget-action`,
      { method: 'POST', body: JSON.stringify({ action, clientName, notes }) }
    ),

  // Auth
  login: (username: string, password: string) =>
    request<{ token: string; user: AdminUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  getMe: () => request<AdminUser>('/api/auth/me'),
  logout: () => request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean; message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // Admin Dashboard
  getDashboard: () =>
    request<{
      totalCustomers: number;
      totalEquipments: number;
      totalOrders: number;
      activeOrdersCount: number;
      totalRevenue: number;
      countByStatus: Record<ServiceOrderStatus, number>;
      recentOrders: ServiceOrder[];
      newServiceRequestsCount: number;
    }>('/api/admin/dashboard'),

  // Admin Customers
  getCustomers: () => request<Customer[]>('/api/admin/customers'),
  createCustomer: (data: Partial<Customer>) =>
    request<Customer>('/api/admin/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: string, data: Partial<Customer>) =>
    request<Customer>(`/api/admin/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id: string) =>
    request<{ success: boolean }>(`/api/admin/customers/${id}`, { method: 'DELETE' }),

  // Admin Equipments
  getEquipments: (customerId?: string) =>
    request<Equipment[]>(`/api/admin/equipments${customerId ? `?customerId=${customerId}` : ''}`),
  createEquipment: (data: Partial<Equipment>) =>
    request<Equipment>('/api/admin/equipments', { method: 'POST', body: JSON.stringify(data) }),
  updateEquipment: (id: string, data: Partial<Equipment>) =>
    request<Equipment>(`/api/admin/equipments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEquipment: (id: string) =>
    request<{ success: boolean }>(`/api/admin/equipments/${id}`, { method: 'DELETE' }),

  // Admin Orders
  getOrders: () => request<ServiceOrder[]>('/api/admin/orders'),
  createOrder: (data: any) =>
    request<ServiceOrder>('/api/admin/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrder: (id: string, data: any) =>
    request<ServiceOrder>(`/api/admin/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateOrderStatus: (id: string, status: ServiceOrderStatus, notes?: string) =>
    request<ServiceOrder>(`/api/admin/orders/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    }),
  deleteOrder: (id: string) =>
    request<{ success: boolean }>(`/api/admin/orders/${id}`, { method: 'DELETE' }),
  getWhatsAppPayload: (id: string, customTemplate?: string, baseUrl?: string) =>
    request<{
      whatsappUrl: string;
      message: string;
      phone: string;
      publicTrackingUrl: string;
    }>(`/api/admin/orders/${id}/whatsapp`, {
      method: 'POST',
      body: JSON.stringify({ customTemplate, baseUrl }),
    }),

  // Admin Reviews
  getAdminReviews: () => request<GoogleReview[]>('/api/admin/reviews'),
  createReview: (data: Partial<GoogleReview>) =>
    request<GoogleReview>('/api/admin/reviews', { method: 'POST', body: JSON.stringify(data) }),
  deleteReview: (id: string) =>
    request<{ success: boolean }>(`/api/admin/reviews/${id}`, { method: 'DELETE' }),

  // Admin Settings
  getSettings: () => request<CompanySettings>('/api/admin/settings'),
  updateSettings: (data: Partial<CompanySettings>) =>
    request<CompanySettings>('/api/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Admin Leads
  getServiceRequests: () => request<PublicServiceRequest[]>('/api/admin/service-requests'),
  updateServiceRequestStatus: (id: string, status: string) =>
    request<PublicServiceRequest>(`/api/admin/service-requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};
