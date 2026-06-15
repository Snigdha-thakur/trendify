import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiURL = env.VITE_API_URL || '/api';

  return {
  root: '.',
  define: {
    __API_URL__: JSON.stringify(apiURL),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      input: {
        main: './index.html',
        signin: './signin.html',
        signup: './signup.html',
        // Admin pages
        admin: './admin/index.html',
        'admin-overview': './admin/overview.html',
        'admin-wallet': './admin/wallet-balance.html',
        'admin-users': './admin/user-management.html',
        'admin-kyc': './admin/kyc-management.html',
        'admin-payments': './admin/payments.html',
        'admin-creator-payouts': './admin/creator-payouts.html',
        'admin-referral-payouts': './admin/referral-payouts.html',
        'admin-payout-history': './admin/payout-history.html',
        'admin-referral-history': './admin/referral-history.html',
        'admin-digital-products': './admin/digital-products.html',
        'admin-gateway-logs': './admin/gateway-logs.html',
        'admin-wallet-logs': './admin/wallet-logs.html',
        'admin-webhook-logs': './admin/webhook-logs.html',
        'admin-payout-webhooks': './admin/payout-webhooks.html',
        'admin-profile-settings': './admin/profile-settings.html',
        // Creator pages
        'creator-dashboard': './creator/dashboard.html',
        'creator-audience': './creator/audience.html',
        'creator-coupons': './creator/coupons.html',
        'creator-paid-earnings': './creator/paid-earnings.html',
        'creator-payout-history': './creator/payout-history.html',
        'creator-products': './creator/products.html',
        'creator-payments': './creator/payments.html',
        'creator-wallet': './creator/wallet.html',
        'creator-purchases': './creator/purchases.html',
        'creator-landing': './user/landing-page.html',
        'creator-digital-tools': './user/digital-tools.html',
        'creator-digital-training': './user/digital-training.html',
        'creator-hosting': './user/hosting-services.html',
        'creator-website': './user/website-design.html',
        'creator-orders': './user/my-orders.html',
        'creator-refer-earn': './creator/refer-earn.html',
        'privacy': './privacy.html',
        'terms': './terms.html',
        'refunds': './refunds.html',
        'product': './product.html',
        'product-preview': './product-preview.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
  };
});
