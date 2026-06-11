export const API_CONFIG = {
  baseURL: 'https://trendify-pxkx.onrender.com',
  frontendURL: 'https://trendifytechnology.vercel.app',
};

export const API_ENDPOINTS = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
  },
  users: {
    me: '/api/users/me',
    update: '/api/users/me',
    kyc: '/api/users/kyc',
  },
  products: {
    list: '/api/products/',
    create: '/api/products/',
    my: '/api/products/my',
    detail: (id) => `/api/products/${id}`,
    update: (id) => `/api/products/${id}`,
    delete: (id) => `/api/products/${id}`,
  },
  payments: {
    initiate: '/api/payments/initiate',
    webhook: '/api/payments/webhook/cashfree',
    transactions: '/api/payments/transactions',
    transaction: (id) => `/api/payments/transactions/${id}`,
  },
  wallets: {
    balance: '/api/wallets/balance',
    logs: '/api/wallets/logs',
    withdraw: '/api/wallets/withdraw',
    payouts: '/api/wallets/payouts',
    referralEarnings: '/api/wallets/referral-earnings',
    webhooks: '/api/wallets/webhooks',
    deleteWebhook: (id) => `/api/wallets/webhooks/${id}`,
  },
  admin: {
    stats: '/api/admin/stats',
    users: '/api/admin/users',
    updateUser: (id) => `/api/admin/users/${id}`,
    kyc: '/api/admin/kyc',
    updateKyc: (id) => `/api/admin/kyc/${id}`,
    products: '/api/admin/products',
    updateProductStatus: (id) => `/api/admin/products/${id}/status`,
    transactions: '/api/admin/transactions',
    payouts: '/api/admin/payouts',
    updatePayoutStatus: (id) => `/api/admin/payouts/${id}/status`,
    creatorPayouts: '/api/admin/creator-payouts',
    referralEarnings: '/api/admin/referral-earnings',
    walletLogs: '/api/admin/wallet-logs',
    gatewayLogs: '/api/admin/gateway-logs',
    webhookLogs: '/api/admin/webhook-logs',
  },
};

export const STORAGE_KEYS = {
  accessToken: 'trendify_access_token',
  user: 'trendify_user',
  session: 'trendify_session',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully!',
  REGISTER_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  PRODUCT_CREATED: 'Product created successfully!',
  PAYMENT_SUCCESS: 'Payment processed successfully!',
};

export default { API_CONFIG, API_ENDPOINTS, STORAGE_KEYS, ERROR_MESSAGES, SUCCESS_MESSAGES };
