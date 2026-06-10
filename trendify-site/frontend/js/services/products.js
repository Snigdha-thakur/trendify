/**
 * Products Service
 * Handles digital products operations
 */

import { apiService } from './api.js';
import { API_ENDPOINTS } from '../utils/config.js';

class ProductsService {
  /**
   * Get all products
   */
  async getProducts(skip = 0, limit = 10, category = null) {
    try {
      let url = `${API_ENDPOINTS.products.list}?skip=${skip}&limit=${limit}`;
      if (category) {
        url += `&category=${category}`;
      }
      return await apiService.get(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  async getProduct(productId) {
    try {
      return await apiService.get(API_ENDPOINTS.products.detail(productId));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get creator's products
   */
  async getCreatorProducts(creatorId) {
    try {
      return await apiService.get(API_ENDPOINTS.products.byCreator(creatorId));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload product
   */
  async createProduct(title, price, file, description = '', category = '') {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('file', file);

      return await apiService.uploadFile(API_ENDPOINTS.products.create, formData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update product
   */
  async updateProduct(productId, title, price, description = '', category = '') {
    try {
      return await apiService.put(API_ENDPOINTS.products.update(productId), {
        title,
        price,
        description,
        category,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId) {
    try {
      return await apiService.delete(API_ENDPOINTS.products.delete(productId));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Download product
   */
  async downloadProduct(productId) {
    try {
      return await apiService.post(API_ENDPOINTS.products.download(productId));
    } catch (error) {
      throw error;
    }
  }
}

export const productsService = new ProductsService();
export default productsService;
