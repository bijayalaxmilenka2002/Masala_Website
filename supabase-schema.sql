-- ============================================================================
-- SUBHADARSHINI SPICES - SUPABASE DATABASE SCHEMA
-- ============================================================================
-- This script sets up the 'inquiries' table, indexes, and Row Level Security (RLS)
-- for capturing contact form leads and managing them in the Owner Portal.
--
-- HOW TO RUN:
-- 1. Log in to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project.
-- 3. Click on "SQL Editor" in the left sidebar.
-- 4. Click "New Query", paste the entire contents of this file, and click "Run".
-- ============================================================================

-- 1. Create Inquiries Table
CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  received_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  inquiry_type TEXT NOT NULL DEFAULT 'General Inquiry',
  subject TEXT NOT NULL DEFAULT 'Product Inquiry',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  notes TEXT DEFAULT '',
  source TEXT DEFAULT 'Website Contact Form'
);

-- 2. Add Status constraint if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_inquiry_status'
  ) THEN
    ALTER TABLE public.inquiries 
    ADD CONSTRAINT check_inquiry_status 
    CHECK (status IN ('New', 'Contacted', 'In Discussion', 'Resolved', 'Archived'));
  END IF;
END $$;

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_phone ON public.inquiries (phone);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON public.inquiries (email);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 5. Drop old policies if re-running
DROP POLICY IF EXISTS "Allow anonymous website visitors to insert inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow service role full access to inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow authenticated owner full access to inquiries" ON public.inquiries;

-- Policy A: Anyone can submit an inquiry via the website contact form
CREATE POLICY "Allow anonymous website visitors to insert inquiries"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy B: Service Role has full read/write access (used by server backend)
CREATE POLICY "Allow service role full access to inquiries"
ON public.inquiries
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy C: Authenticated Supabase users have full access (for dashboard/portal)
CREATE POLICY "Allow authenticated owner full access to inquiries"
ON public.inquiries
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Insert initial seed data (Optional verification record)
INSERT INTO public.inquiries (id, name, phone, email, inquiry_type, subject, message, status, notes)
VALUES (
  'SUB-INIT01',
  'Subhadarshini Admin Welcome',
  '+91 6372585804',
  'care@subhadarshini.com',
  'System Verification',
  'Supabase Database Connected',
  'Your Supabase backend is successfully connected to Subhadarshini Spices Owner Portal. All future customer inquiries from the website contact form will be securely saved here.',
  'New',
  'Verified system installation'
)
ON CONFLICT (id) DO NOTHING;

-- Verification query
SELECT id, name, inquiry_type, status, created_at FROM public.inquiries ORDER BY created_at DESC LIMIT 5;
