-- ==============================================================================
-- Koochify (کوچیفای) - Supabase Database Schema
-- Run this script in the Supabase SQL Editor:
-- (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Users Table (کاربران و وضعیت پرداخت پرونده)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  last_login_at TIMESTAMPTZ,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  payment_status TEXT NOT NULL DEFAULT 'none',
  payment_ref TEXT,
  card_last_digits TEXT,
  paid_at TIMESTAMPTZ
);

-- 2. OTP Verification Table (کدهای ورود پیامکی یک‌بار مصرف)
CREATE TABLE IF NOT EXISTS public.otps (
  id TEXT PRIMARY KEY,
  phone_number TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Sessions Table (نشست‌های ورود و توکن‌ها)
CREATE TABLE IF NOT EXISTS public.sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. User Assessments Table (پرونده‌ها و نتایج ارزیابی مهاجرت)
CREATE TABLE IF NOT EXISTS public.user_assessments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  profile_data JSONB NOT NULL,
  results_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Indexes for High Concurrency & Speed (ایندکس‌های پرسرعت)
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone_number);
CREATE INDEX IF NOT EXISTS idx_otps_phone ON public.otps(phone_number);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions(token);
CREATE INDEX IF NOT EXISTS idx_assessments_user ON public.user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created ON public.user_assessments(created_at DESC);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;

-- 7. Policies for Backend Service Role
-- سرور Express با کلید SUPABASE_SERVICE_ROLE_KEY متصل می‌شود و دسترسی کامل دارد.
DROP POLICY IF EXISTS "Service role has full access to users" ON public.users;
CREATE POLICY "Service role has full access to users" ON public.users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to otps" ON public.otps;
CREATE POLICY "Service role has full access to otps" ON public.otps
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to sessions" ON public.sessions;
CREATE POLICY "Service role has full access to sessions" ON public.sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to assessments" ON public.user_assessments;
CREATE POLICY "Service role has full access to assessments" ON public.user_assessments
  FOR ALL TO service_role USING (true) WITH CHECK (true);
