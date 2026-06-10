/**
 * Trendify Auth — calls backend directly, no Supabase dependency
 */
(function () {
  const API = 'http://localhost:8001/api/auth';
  const USER_KEY = 'trendify_user';
  const TOKEN_KEY = 'trendify_backend_token';

  window.TrendifyAuth = {
    getToken() {
      return localStorage.getItem(TOKEN_KEY);
    },
    getUser() {
      try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
    },
    isLoggedIn() {
      return !!this.getToken();
    },
    _clear() {
      [TOKEN_KEY, USER_KEY, 'trendify_session', 'trendify_creds'].forEach(k => localStorage.removeItem(k));
    },

    async login(email, password) {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data.user;
    },

    async register(email, password, name, phone, role = 'user') {
      const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed');
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data.user;
    },

    async logout() {
      this._clear();
    },

    requireAuth(redirectTo) {
      if (!this.isLoggedIn()) {
        window.location.href = redirectTo || '../signin.html';
        return null;
      }
      return this.getUser();
    },

    redirectByRole(user) {
      const role = (user && user.role) || 'user';
      if (role === 'admin') window.location.href = 'admin/overview.html';
      else if (role === 'creator') window.location.href = 'creator/dashboard.html';
      else window.location.href = 'index.html';
    },
  };
})();
