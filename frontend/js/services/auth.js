/**
 * Authentication Service
 * Handles user registration, login, and token management
 */

import { apiService } from './api.js';
import { storage } from '../utils/storage.js';
import { API_ENDPOINTS, SUCCESS_MESSAGES } from '../utils/config.js';

class AuthService {
  /**
   * Register new user
   */
  async register(email, username, password, fullName = '') {
    try {
      const response = await apiService.post(API_ENDPOINTS.auth.register, {
        email,
        username,
        password,
        full_name: fullName,
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await apiService.post(API_ENDPOINTS.auth.login, {
        email,
        password,
      });

      // Store tokens
      storage.setAccessToken(response.access_token);
      storage.setRefreshToken(response.refresh_token);

      // Get user profile
      const user = await this.getCurrentUser();
      storage.setUser(user);

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await apiService.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storage.clearTokens();
      storage.setUser(null);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const user = await apiService.get(API_ENDPOINTS.users.me);
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken() {
    try {
      const response = await apiService.post(API_ENDPOINTS.auth.refresh, {
        refresh_token: storage.getRefreshToken(),
      });

      storage.setAccessToken(response.access_token);
      storage.setRefreshToken(response.refresh_token);

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return storage.isLoggedIn();
  }

  /**
   * Get current user from storage
   */
  getCurrentUserFromStorage() {
    return storage.getUser();
  }

  /**
   * Update user profile
   */
  async updateProfile(fullName, bio, profilePicture) {
    try {
      const response = await apiService.put(API_ENDPOINTS.users.me, {
        full_name: fullName,
        bio,
        profile_picture: profilePicture,
      });

      storage.setUser(response);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check authorization
   */
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/signin.html';
      return false;
    }
    return true;
  }

  /**
   * Redirect if logged in
   */
  redirectIfLoggedIn() {
    if (this.isLoggedIn()) {
      window.location.href = '/dashboard.html';
    }
  }
}

export const authService = new AuthService();
export default authService;
