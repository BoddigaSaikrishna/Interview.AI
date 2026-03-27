-- Add company_type column to interview_sessions table
ALTER TABLE public.interview_sessions 
ADD COLUMN IF NOT EXISTS company_type TEXT DEFAULT 'product' CHECK (company_type IN ('product', 'service'));
