-- Trendify Full Schema Migration

CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  role text NOT NULL DEFAULT 'user'::text CHECK (role = ANY (ARRAY['user'::text, 'creator'::text, 'admin'::text, 'customer'::text])),
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text])),
  referral_code text UNIQUE,
  referred_by uuid,
  wallet_balance numeric DEFAULT 0,
  referral_wallet_balance numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  password_hash text NOT NULL DEFAULT ''::text,
  address text,
  disclaimer text,
  instagram text,
  facebook text,
  youtube text,
  linkedin text,
  platform_fee_pct numeric DEFAULT 0,
  affiliate_mode boolean DEFAULT false,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES public.users(id)
);

CREATE TABLE public.kyc (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  aadhar text,
  pan text,
  bank_type text CHECK (bank_type = ANY (ARRAY['Savings'::text, 'Current'::text])),
  status text NOT NULL DEFAULT 'Pending'::text CHECK (status = ANY (ARRAY['Pending'::text, 'Approved'::text, 'Rejected'::text])),
  created_at timestamp with time zone DEFAULT now(),
  website text,
  phone text,
  email text,
  gst text,
  udyam text,
  CONSTRAINT kyc_pkey PRIMARY KEY (id),
  CONSTRAINT kyc_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE public.digital_products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  creator_id uuid,
  name text NOT NULL,
  price_type text CHECK (price_type = ANY (ARRAY['Fixed'::text, 'Free'::text, 'Open'::text, 'Customer Decided'::text])),
  status text NOT NULL DEFAULT 'Under review'::text CHECK (status = ANY (ARRAY['Active'::text, 'Under review'::text])),
  whitelabeled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  description text,
  amount numeric DEFAULT 0,
  payment_link text,
  cashfree_link_id text,
  qr_code text,
  creator_name text,
  profile_picture text,
  category text,
  cover_image text,
  button_text text DEFAULT 'Make Payment'::text,
  discount_price numeric DEFAULT 0,
  offer_discount boolean DEFAULT false,
  testimonials text,
  faqs text,
  benefits text,
  social_links text,
  form_fields text,
  digital_files text,
  success_redirect text,
  failed_redirect text,
  support_phone text,
  support_email text,
  limit_quantity boolean DEFAULT false,
  max_quantity numeric DEFAULT 0,
  meta_pixel_id text,
  google_analytics_id text,
  webhook_url text,
  webhook_key text,
  CONSTRAINT digital_products_pkey PRIMARY KEY (id),
  CONSTRAINT digital_products_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id)
);

CREATE TABLE public.transactions (
  id text NOT NULL,
  creator_id uuid,
  product_id uuid,
  buyer_email text,
  amount numeric NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['Success'::text, 'Pending'::text, 'Failed'::text])),
  gateway text DEFAULT 'Cashfree'::text,
  created_at timestamp with time zone DEFAULT now(),
  cashfree_order_id text,
  payment_link text,
  commission_amount numeric DEFAULT 0,
  creator_amount numeric DEFAULT 0,
  buyer_name text,
  buyer_phone text,
  cf_payment_id text,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id),
  CONSTRAINT transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.digital_products(id)
);

CREATE TABLE public.payouts (
  id text NOT NULL DEFAULT ('payout-'::text || gen_random_uuid()),
  user_id uuid,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'Paid'::text CHECK (status = ANY (ARRAY['Pending'::text, 'Paid'::text, 'Rejected'::text])),
  payout_type text CHECK (payout_type = ANY (ARRAY['creator'::text, 'referral'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payouts_pkey PRIMARY KEY (id),
  CONSTRAINT payouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE public.creator_payouts (
  id text NOT NULL,
  creator_id uuid,
  buyer_email text,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'Pending'::text CHECK (status = ANY (ARRAY['Pending'::text, 'Paid'::text, 'Failed'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT creator_payouts_pkey PRIMARY KEY (id),
  CONSTRAINT creator_payouts_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id)
);

CREATE TABLE public.referral_earnings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transaction_id text,
  referrer_id uuid,
  from_creator_id uuid,
  amount numeric,
  percentage text,
  source text DEFAULT 'referral'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT referral_earnings_pkey PRIMARY KEY (id),
  CONSTRAINT referral_earnings_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id),
  CONSTRAINT referral_earnings_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.users(id),
  CONSTRAINT referral_earnings_from_creator_id_fkey FOREIGN KEY (from_creator_id) REFERENCES public.users(id)
);

CREATE TABLE public.wallet_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  transaction_id text,
  wallet_type text CHECK (wallet_type = ANY (ARRAY['Main Wallet'::text, 'Referral Wallet'::text])),
  type text CHECK (type = ANY (ARRAY['Credit'::text, 'Debit'::text])),
  existing_balance numeric,
  amount numeric,
  new_balance numeric,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wallet_logs_pkey PRIMARY KEY (id),
  CONSTRAINT wallet_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE public.webhook_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  transaction_id text,
  webhook_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT webhook_logs_pkey PRIMARY KEY (id),
  CONSTRAINT webhook_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE public.payout_webhooks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  webhook_url text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payout_webhooks_pkey PRIMARY KEY (id),
  CONSTRAINT payout_webhooks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE public.gateway_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transaction_id text,
  txn_type text DEFAULT 'Purchase'::text,
  gateway text DEFAULT 'Cashfree'::text,
  log_type text CHECK (log_type = ANY (ARRAY['Request'::text, 'Response'::text, 'Webhook'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gateway_logs_pkey PRIMARY KEY (id)
);

CREATE TABLE public.coupons (
  id uuid NOT NULL,
  creator_id uuid NOT NULL,
  product_id uuid,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active'::text,
  discount_type text NOT NULL DEFAULT 'fixed'::text,
  discount_value numeric DEFAULT 0,
  limited boolean DEFAULT false,
  usage_limit numeric DEFAULT 0,
  usage_count numeric DEFAULT 0,
  valid_from date,
  valid_until date,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coupons_pkey PRIMARY KEY (id),
  CONSTRAINT coupons_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id),
  CONSTRAINT coupons_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.digital_products(id)
);

CREATE TABLE public.platform_settings (
  key text NOT NULL,
  value text NOT NULL,
  CONSTRAINT platform_settings_pkey PRIMARY KEY (key)
);

CREATE TABLE public.bank_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  bank_name text,
  account_holder_name text,
  account_number text,
  ifsc_code text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bank_details_pkey PRIMARY KEY (id),
  CONSTRAINT bank_details_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
