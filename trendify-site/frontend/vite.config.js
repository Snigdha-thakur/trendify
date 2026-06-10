import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
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
        // Creator pages
        'creator-dashboard': './creator/dashboard.html',
        'creator-landing': './creator/landing-page.html',
        'creator-digital-tools': './creator/digital-tools.html',
        'creator-digital-training': './creator/digital-training.html',
        'creator-hosting': './creator/hosting-services.html',
        'creator-website': './creator/website-design.html',
        'creator-orders': './creator/my-orders.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
