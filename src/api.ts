const API_URL = 'http://localhost:3000/api';

export const api = {
  async init() {
    const response = await fetch(`${API_URL}/init`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to initialize database');
    return response.json();
  },

  async getOrders() {
    const response = await fetch(`${API_URL}/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  async createOrder(order: any) {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  },

  async updateOrder(id: number, data: any) {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update order');
    return response.json();
  },

  async cleanupOrders() {
    const response = await fetch(`${API_URL}/cleanup`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to cleanup orders');
    return response.json();
  }
};