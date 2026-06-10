/**
 * API Service
 * Centralized API communication layer
 */

import { API_CONFIG, ERROR_MESSAGES } from '../utils/config.js';
import { storage } from '../utils/storage.js';

class APIService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get authorization header
   */
  getAuthHeader() {
    const token = storage.getAccessToken();
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
      };
    }
    return {};
  }

  /**
   * Build URL
   */
  buildURL(endpoint) {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    return `${this.baseURL}${endpoint}`;
  }

  /**
   * Handle response
   */
  async handleResponse(response) {
    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - try to refresh token
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          // Redirect to login
          storage.clearTokens();
          window.location.href = '/signin.html';
          throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        }
      }

      const error = await response.json().catch(() => ({
        detail: `HTTP ${response.status}`,
      }));

      const message = error.detail || ERROR_MESSAGES.SERVER_ERROR;
      throw new Error(message);
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return response;
  }

  /**
   * Refresh token
   */
  async refreshToken() {
    try {
      const refreshToken = storage.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(this.buildURL('/api/auth/refresh'), {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      storage.setAccessToken(data.access_token);
      storage.setRefreshToken(data.refresh_token);

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    try {
      const response = await fetch(this.buildURL(endpoint), {
        method: 'GET',
        headers: {
          ...this.defaultHeaders,
          ...this.getAuthHeader(),
          ...options.headers,
        },
      });

      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}, options = {}) {
    try {
      const headers = {
        ...this.defaultHeaders,
        ...this.getAuthHeader(),
        ...options.headers,
      };

      // Don't set Content-Type for FormData (browser will set it)
      let body = data;
      if (data instanceof FormData) {
        delete headers['Content-Type'];
        body = data;
      } else {
        body = JSON.stringify(data);
      }

      const response = await fetch(this.buildURL(endpoint), {
        method: 'POST',
        headers,
        body,
      });

      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}, options = {}) {
    try {
      const response = await fetch(this.buildURL(endpoint), {
        method: 'PUT',
        headers: {
          ...this.defaultHeaders,
          ...this.getAuthHeader(),
          ...options.headers,
        },
        body: JSON.stringify(data),
      });

      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    try {
      const response = await fetch(this.buildURL(endpoint), {
        method: 'DELETE',
        headers: {
          ...this.defaultHeaders,
          ...this.getAuthHeader(),
          ...options.headers,
        },
      });

      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data = {}, options = {}) {
    try {
      const response = await fetch(this.buildURL(endpoint), {
        method: 'PATCH',
        headers: {
          ...this.defaultHeaders,
          ...this.getAuthHeader(),
          ...options.headers,
        },
        body: JSON.stringify(data),
      });

      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload file
   */
  async uploadFile(endpoint, formData, options = {}) {
    try {
      const headers = {
        ...this.getAuthHeader(),
        ...options.headers,
      };

      const response = await fetch(this.buildURL(endpoint), {
        method: 'POST',
        headers,
        body: formData,
      });

      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }
}

export const apiService = new APIService();
export default apiService;
