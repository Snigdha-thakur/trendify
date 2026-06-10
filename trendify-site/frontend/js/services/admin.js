/**
 * Admin Service
 * Handles admin operations and dashboard
 */

import { apiService } from './api.js';
import { API_ENDPOINTS } from '../utils/config.js';

class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      return await apiService.get(API_ENDPOINTS.admin.stats);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all users
   */
  async getUsers(skip = 0, limit = 10) {
    try {
      const url = `${API_ENDPOINTS.admin.users}?skip=${skip}&limit=${limit}`;
      return await apiService.get(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle user admin status
   */
  async toggleUserAdmin(userId) {
    try {
      return await apiService.post(API_ENDPOINTS.admin.toggleAdmin(userId));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle user active status
   */
  async toggleUserActive(userId) {
    try {
      return await apiService.post(API_ENDPOINTS.admin.toggleActive(userId));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all products
   */
  async getProducts(skip = 0, limit = 10) {
    try {
      const url = `${API_ENDPOINTS.admin.products}?skip=${skip}&limit=${limit}`;
      return await apiService.get(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId) {
    try {
      return await apiService.delete(API_ENDPOINTS.admin.deleteProduct(productId));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all orders
   */
  async getOrders(skip = 0, limit = 10, status = null) {
    try {
      let url = `${API_ENDPOINTS.admin.orders}?skip=${skip}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }
      return await apiService.get(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all payments
   */
  async getPayments(skip = 0, limit = 10, status = null) {
    try {
      let url = `${API_ENDPOINTS.admin.payments}?skip=${skip}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }
      return await apiService.get(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all courses
   */
  async getCourses(skip = 0, limit = 10) {
    try {
      const url = `${API_ENDPOINTS.admin.courses}?skip=${skip}&limit=${limit}`;
      return await apiService.get(url);
    } catch (error) {
      throw error;
    }
  }
}

export const adminService = new AdminService();
export default adminService;
