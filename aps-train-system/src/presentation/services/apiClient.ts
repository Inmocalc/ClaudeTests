/**
 * API Client
 * HTTP client for communicating with the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Operations
  async getOperations() {
    return this.request<{ operations: any[]; total: number }>('/operations');
  }

  async addOperation(data: any) {
    return this.request<any>('/operations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteOperation(name: string) {
    return this.request<any>(`/operations/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  }

  // Lines
  async getLines() {
    return this.request<{ lines: any[]; total: number }>('/lines');
  }

  async addLine(data: any) {
    return this.request<any>('/lines', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteLine(id: string) {
    return this.request<any>(`/lines/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // Process Config
  async getProcessConfig(modelId: string) {
    return this.request<{ processes: any[] }>(`/process-config/${modelId}`);
  }

  async updateProcessConfig(modelId: string, processes: any[]) {
    return this.request<any>(`/process-config/${modelId}`, {
      method: 'PUT',
      body: JSON.stringify({ processes }),
    });
  }

  // Orders
  async getOrders() {
    return this.request<{ orders: any[]; total: number }>('/orders');
  }

  async getPendingOrders() {
    return this.request<{ orders: any[]; total: number }>('/orders/pending');
  }

  async getOrderById(id: string) {
    return this.request<any>(`/orders/${id}`);
  }

  async createOrder(data: any) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request<any>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteOrder(id: string) {
    return this.request<any>(`/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Scheduling
  async executeScheduling(input: any = {}) {
    return this.request<any>('/scheduling/execute', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }
}

export const apiClient = new ApiClient();
