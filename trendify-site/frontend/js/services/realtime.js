/**
 * Real-time Service
 * Handles WebSocket connection for real-time notifications
 */

import { apiService } from './api.js';
import { API_CONFIG, API_ENDPOINTS, MESSAGE_TYPES } from '../utils/config.js';
import { storage } from '../utils/storage.js';

class RealtimeService {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  /**
   * Connect to WebSocket
   */
  connect() {
    return new Promise((resolve, reject) => {
      if (!API_CONFIG.enableRealtime) {
        console.warn('Real-time feature is disabled');
        reject(new Error('Real-time feature is disabled'));
        return;
      }

      try {
        const token = storage.getAccessToken();
        if (!token) {
          reject(new Error('No authentication token'));
          return;
        }

        const wsURL = API_ENDPOINTS.realtime.ws(token);
        this.socket = new WebSocket(wsURL);

        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        };

        this.socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

        this.socket.onclose = () => {
          console.log('WebSocket disconnected');
          this.emit('disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Handle incoming message
   */
  handleMessage(data) {
    if (data.type === 'pong') {
      return; // Ignore pong responses
    }

    console.log('WebSocket message:', data);
    this.emit('message', data);

    // Emit specific message type
    if (data.type) {
      this.emit(data.type, data);
    }
  }

  /**
   * Send message
   */
  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not open');
    }
  }

  /**
   * Ping to keep connection alive
   */
  ping() {
    this.send({ type: 'ping' });
  }

  /**
   * Subscribe to event
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Unsubscribe from event
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Emit event
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Attempt to reconnect
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect_failed');
    }
  }

  /**
   * Get notifications
   */
  async getNotifications(skip = 0, limit = 10, unreadOnly = false) {
    try {
      const url = `${API_ENDPOINTS.realtime.notifications}?skip=${skip}&limit=${limit}&unread_only=${unreadOnly}`;
      return await apiService.get(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId) {
    try {
      return await apiService.post(API_ENDPOINTS.realtime.markRead(notificationId));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(userId) {
    try {
      return await apiService.post(API_ENDPOINTS.realtime.markAllRead, {
        user_id: userId,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    try {
      return await apiService.delete(API_ENDPOINTS.realtime.delete(notificationId));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

export const realtimeService = new RealtimeService();
export default realtimeService;
