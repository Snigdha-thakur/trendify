/**
 * Wallets & Affiliate Service
 * Handles wallet balance, transactions, and affiliate program
 */

import { apiService } from './api.js';
import { API_ENDPOINTS } from '../utils/config.js';

class WalletsService {
  /**
   * Get wallet balance
   */
  async getBalance() {
    try {
      return await apiService.get(API_ENDPOINTS.wallets.balance);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get wallet transactions
   */
  async getTransactions(skip = 0, limit = 10) {
    try {
      const url = `${API_ENDPOINTS.wallets.transactions}?skip=${skip}&limit=${limit}`;
      return await apiService.get(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request withdrawal
   */
  async requestWithdrawal(amount) {
    try {
      return await apiService.post(API_ENDPOINTS.wallets.withdraw, {
        amount,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get affiliate info
   */
  async getAffiliateInfo() {
    try {
      return await apiService.get(API_ENDPOINTS.wallets.affiliate.info);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate affiliate code
   */
  async generateAffiliateCode() {
    try {
      return await apiService.post(API_ENDPOINTS.wallets.affiliate.generateCode);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get affiliate stats
   */
  async getAffiliateStats() {
    try {
      return await apiService.get(API_ENDPOINTS.wallets.affiliate.stats);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle affiliate status
   */
  async toggleAffiliateStatus() {
    try {
      return await apiService.post(API_ENDPOINTS.wallets.affiliate.toggleActive);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get referral link
   */
  getReferralLink(affiliateCode) {
    return `${window.location.origin}/?ref=${affiliateCode}`;
  }

  /**
   * Copy referral link to clipboard
   */
  async copyReferralLink(affiliateCode) {
    try {
      const link = this.getReferralLink(affiliateCode);
      await navigator.clipboard.writeText(link);
      return true;
    } catch (error) {
      console.error('Failed to copy link:', error);
      return false;
    }
  }
}

export const walletsService = new WalletsService();
export default walletsService;
