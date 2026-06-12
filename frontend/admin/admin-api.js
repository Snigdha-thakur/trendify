/**
 * Trendify Admin API — calls backend endpoints
 */
(function () {
  const API_URL = (typeof __API_URL__ !== 'undefined' ? __API_URL__ : 'https://trendify-pxkx.onrender.com') + '/api/admin';
  const TOKEN_KEY = 'trendify_access_token';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  async function query(endpoint) {
    const token = getToken();
    if (!token) { window.location.href = '../signin.html'; return []; }
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '../signin.html';
        return [];
      }
      if (!res.ok) { console.error(`HTTP ${res.status}:`, await res.text()); return []; }
      return res.json();
    } catch (e) { console.error('Query error:', e); return []; }
  }

  async function put(endpoint, body) {
    const token = getToken();
    if (!token) throw new Error('No auth token');
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) { const t = await res.text(); console.error(`PUT HTTP ${res.status}:`, t); throw new Error(`HTTP ${res.status}`); }
    return res.json();
  }

  window.AdminAPI = {
    async init() {
      if (!getToken()) { window.location.href = '../signin.html'; }
    },

    getUsers: () => query('/users?skip=0&limit=1000'),
    updateUserStatus: (id, status) => put(`/users/${id}`, { status }),
    updateUser: (id, data) => put(`/users/${id}`, data),
    deleteUser: async (id) => {
      const token = getToken();
      if (!token) throw new Error('No auth token');
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) { const t = await res.text(); throw new Error(t); }
      return res.json();
    },
    updateUserWallet: (id, amount, type) => put(`/users/${id}/wallet`, { amount, type }),
    createUser: async (data) => {
      const token = getToken();
      if (!token) throw new Error('No auth token');
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const t = await res.text(); throw new Error(t); }
      return res.json();
    },

    getTransactions: (days) => {
      const base = '/transactions?skip=0&limit=1000';
      if (!days || days === 'all') return query(base);
      const since = new Date(Date.now() - parseInt(days) * 86400000).toISOString();
      return query(base + '&since=' + since);
    },
    getPayments: () => query('/transactions?skip=0&limit=1000'),
    getCreatorPayouts: () => query('/creator-payouts?skip=0&limit=1000'),
    getPayouts: () => query('/payouts?skip=0&limit=1000'),
    getKYC: () => query('/kyc?skip=0&limit=1000'),
    updateKYCStatus: (id, status) => put(`/kyc/${id}?status=${status}`, {}),
    getProducts: () => query('/products?skip=0&limit=1000'),
    getWalletLogs: () => query('/wallet-logs?skip=0&limit=1000'),
    getWebhookLogs: () => query('/webhook-logs?skip=0&limit=1000'),
    getGatewayLogs: () => query('/gateway-logs?skip=0&limit=1000'),
    getReferralEarnings: () => query('/referral-earnings?skip=0&limit=1000'),
    getPayoutWebhooks: () => query('/payout-webhooks?skip=0&limit=1000'),

    _userCache: {},
    async getUserName(id) {
      if (!id) return '—';
      if (this._userCache[id]) return this._userCache[id];
      const users = await this.getUsers();
      const user = users.find(u => u.id === id);
      const name = (user && (user.name || user.email)) || id.slice(0, 8);
      this._userCache[id] = name;
      return name;
    },

    async getStats() {
      const stats = await query('/stats');
      if (!stats || typeof stats !== 'object') return { creators: 0, totalUsers: 0, totalTxns: 0, totalProducts: 0, totalRevenue: 0, platformCommission: 0 };
      return {
        creators: stats.total_users || 0,
        totalUsers: stats.total_users || 0,
        totalTxns: stats.total_transactions || 0,
        totalProducts: stats.total_products || 0,
        totalRevenue: stats.total_revenue || 0,
        platformCommission: (stats.total_revenue || 0) * 0.01,
      };
    }
  };
})();
