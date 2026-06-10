/**
 * Local Storage utilities
 * Simplified storage management
 */

import { STORAGE_KEYS } from './config.js';

class StorageService {
  /**
   * Set token
   */
  setAccessToken(token) {
    localStorage.setItem(STORAGE_KEYS.accessToken, token);
  }

  /**
   * Get access token
   */
  getAccessToken() {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  }

  /**
   * Set refresh token
   */
  setRefreshToken(token) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, token);
  }

  /**
   * Get refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.refreshToken);
  }

  /**
   * Set user data
   */
  setUser(user) {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  }

  /**
   * Get user data
   */
  getUser() {
    const user = localStorage.getItem(STORAGE_KEYS.user);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Set preference
   */
  setPreference(key, value) {
    const prefs = this.getPreferences();
    prefs[key] = value;
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(prefs));
  }

  /**
   * Get preference
   */
  getPreference(key) {
    const prefs = this.getPreferences();
    return prefs[key];
  }

  /**
   * Get all preferences
   */
  getPreferences() {
    const prefs = localStorage.getItem(STORAGE_KEYS.preferences);
    return prefs ? JSON.parse(prefs) : {};
  }

  /**
   * Clear all data
   */
  clear() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Clear tokens
   */
  clearTokens() {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return !!this.getAccessToken();
  }
}

export const storage = new StorageService();
export default storage;
