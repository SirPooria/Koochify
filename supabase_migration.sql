-- ==============================================================================
-- KOOCHIFY PRODUCTION DATABASE SCHEMA (PostgreSQL / Supabase)
-- تاریخ اجرا: سال ۲۰۲۶
-- راهنما: کل این اسکریپت را کپی کرده و در بخش SQL Editor در پنل Supabase خود اجرا (Run) کنید.
-- ==============================================================================

-- ۱. فعال‌سازی اکستنشن‌های مورد نیاز برای رمزنگاری و شناسه‌ها
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ۲. ساخت جدول کاربران (Users)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT ('usr_' || lower(replace(gen_random_uuid()::text, '-', ''))),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL DEFAULT '',
    is_paid BOOLEAN NOT NULL DEFAULT false,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'none',
    payment_ref VARCHAR(100),
    card_last_digits VARCHAR(10),
    paid_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ایندکس‌ها برای سرعت بالای جستجو با شماره موبایل و وضعیت پرداخت
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_paid ON public.users(is_paid);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- ۳. ساخت جدول کدهای یک‌بار مصرف ورود (OTPs)
CREATE TABLE IF NOT EXISTS public.otps (
    id TEXT PRIMARY KEY DEFAULT ('otp_' || lower(replace(gen_random_uuid()::text, '-', ''))),
    phone_number VARCHAR(20) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at BIGINT NOT NULL, -- تاریخ انقضا به میلی‌ثانیه برای هماهنگی کامل با سرور
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otps_phone_code ON public.otps(phone_number, code, used);
CREATE INDEX IF NOT EXISTS idx_otps_created ON public.otps(created_at DESC);

-- ۴. ساخت جدول نشست‌های ورود (Sessions)
CREATE TABLE IF NOT EXISTS public.sessions (
    id TEXT PRIMARY KEY DEFAULT ('sess_' || lower(replace(gen_random_uuid()::text, '-', ''))),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);

-- ۵. ساخت جدول نتایج ارزیابی هوشمند پرونده‌ها (User Assessments)
CREATE TABLE IF NOT EXISTS public.user_assessments (
    id TEXT PRIMARY KEY DEFAULT ('asmt_' || lower(replace(gen_random_uuid()::text, '-', ''))),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'ارزیابی مهاجرت ۲۰۲۶',
    profile_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- سن، تحصیلات، نمره زبان، بودجه، وضعیت خدمت و...
    results_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- ۳ مقصد طلایی، ریز هزینه‌ها، تحلیل گپ و نقشه راه
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created ON public.user_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_profile_gin ON public.user_assessments USING gin (profile_data);
CREATE INDEX IF NOT EXISTS idx_assessments_results_gin ON public.user_assessments USING gin (results_data);

-- ۶. ساخت جدول تراکنش‌های مالی و درگاه پرداخت (Payment Transactions)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id TEXT PRIMARY KEY DEFAULT ('tx_' || lower(replace(gen_random_uuid()::text, '-', ''))),
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    amount_tomans INT NOT NULL DEFAULT 499000,
    amount_rials BIGINT NOT NULL DEFAULT 4990000,
    gateway VARCHAR(50) NOT NULL DEFAULT 'zibal',
    track_id VARCHAR(100),
    ref_number VARCHAR(100),
    card_pan VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, verified, failed, cancelled
    raw_response JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    verified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_track_id ON public.payment_transactions(track_id);
CREATE INDEX IF NOT EXISTS idx_payment_ref_number ON public.payment_transactions(ref_number);
CREATE INDEX IF NOT EXISTS idx_payment_user_id ON public.payment_transactions(user_id);

-- ۷. تنظیمات امنیت داده‌ها و RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- تعریف پالیسی‌های دسترسی مستقیم Service Role (بک‌اند سرور کوچیفای با Service Role دسترسی کامل دارد)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Service role full access on users" ON public.users;
    CREATE POLICY "Service role full access on users" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Service role full access on otps" ON public.otps;
    CREATE POLICY "Service role full access on otps" ON public.otps FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Service role full access on sessions" ON public.sessions;
    CREATE POLICY "Service role full access on sessions" ON public.sessions FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Service role full access on user_assessments" ON public.user_assessments;
    CREATE POLICY "Service role full access on user_assessments" ON public.user_assessments FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Service role full access on payment_transactions" ON public.payment_transactions;
    CREATE POLICY "Service role full access on payment_transactions" ON public.payment_transactions FOR ALL TO service_role USING (true) WITH CHECK (true);
END $$;

-- همچنین ایجاد پالیسی عمومی خواندن/نوشتن از طریق anon برای احتیاط در صورت استفاده از کلاینت مرورگر
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow anon read/write with service" ON public.users;
    CREATE POLICY "Allow anon read/write with service" ON public.users FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon read/write on otps" ON public.otps;
    CREATE POLICY "Allow anon read/write on otps" ON public.otps FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon read/write on sessions" ON public.sessions;
    CREATE POLICY "Allow anon read/write on sessions" ON public.sessions FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon read/write on user_assessments" ON public.user_assessments;
    CREATE POLICY "Allow anon read/write on user_assessments" ON public.user_assessments FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon read/write on payment_transactions" ON public.payment_transactions;
    CREATE POLICY "Allow anon read/write on payment_transactions" ON public.payment_transactions FOR ALL TO anon USING (true) WITH CHECK (true);
END $$;
