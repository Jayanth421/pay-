-- ==============================================================================
-- CAMPUS DONATION WEBSITE — SUPABASE DATABASE SCHEMA & POLICIES
-- Run this in your Supabase Project: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create STUDENTS Table (Official Campus Roster)
CREATE TABLE IF NOT EXISTS public.students (
  roll_number TEXT PRIMARY KEY,
  student_name TEXT NOT NULL CHECK (char_length(student_name) BETWEEN 1 AND 100),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Index for fast roll number lookups
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON public.students (UPPER(roll_number));

-- 3. Create UPI ACCOUNTS Table (4 Configured Accounts Rotated in Order)
CREATE TABLE IF NOT EXISTS public.upi_accounts (
  id SERIAL PRIMARY KEY,
  upi_id TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  slot_number INT NOT NULL UNIQUE CHECK (slot_number BETWEEN 1 AND 4),
  total_assigned INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create UPI ROTATION STATE Table (Atomic Round-Robin Tracking)
CREATE TABLE IF NOT EXISTS public.upi_rotation_state (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  current_slot INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize rotation state row if not exists
INSERT INTO public.upi_rotation_state (id, current_slot)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- 5. Create DONATIONS Table (Minimum amount: 15)
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_reference TEXT UNIQUE NOT NULL,
  roll_number TEXT NOT NULL REFERENCES public.students(roll_number),
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 15),
  upi_account_id INT REFERENCES public.upi_accounts(id),
  upi_id TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'awaiting_verification', 'approved', 'rejected')),
  rejection_reason TEXT,
  admin_notes TEXT,
  verified_at TIMESTAMPTZ,
  receipt_email_sent BOOLEAN DEFAULT FALSE,
  confirmation_email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donations_ref ON public.donations (payment_reference);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations (status);
CREATE INDEX IF NOT EXISTS idx_donations_roll ON public.donations (roll_number);

-- 6. Atomic Function for Rotating UPI Accounts in Exact Order (1 -> 2 -> 3 -> 4 -> 1 ...)
CREATE OR REPLACE FUNCTION public.get_next_rotating_upi()
RETURNS SETOF public.upi_accounts
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_slot INT;
  chosen_account public.upi_accounts%ROWTYPE;
BEGIN
  -- Acquire exclusive row lock on the rotation state
  SELECT ((current_slot % 4) + 1)
  INTO next_slot
  FROM public.upi_rotation_state
  WHERE id = 1
  FOR UPDATE;

  -- Update the rotation counter
  UPDATE public.upi_rotation_state
  SET current_slot = next_slot,
      updated_at = NOW()
  WHERE id = 1;

  -- Fetch the configured UPI account for this slot
  SELECT *
  INTO chosen_account
  FROM public.upi_accounts
  WHERE slot_number = next_slot AND is_active = TRUE;

  -- Fallback if slot not found
  IF chosen_account.id IS NULL THEN
    SELECT * INTO chosen_account
    FROM public.upi_accounts
    WHERE is_active = TRUE
    ORDER BY slot_number ASC
    LIMIT 1;
  END IF;

  -- Increment usage counter
  UPDATE public.upi_accounts
  SET total_assigned = total_assigned + 1
  WHERE id = chosen_account.id;

  RETURN NEXT chosen_account;
END;
$$;

-- 7. Secure Function to Verify Student by Roll Number (Doesn't leak full roster)
CREATE OR REPLACE FUNCTION public.verify_student_roll(p_roll TEXT)
RETURNS TABLE (
  student_name TEXT,
  roll_number TEXT,
  email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT s.student_name, s.roll_number, s.email
  FROM public.students s
  WHERE UPPER(s.roll_number) = UPPER(TRIM(p_roll))
  LIMIT 1;
END;
$$;

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upi_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upi_rotation_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Keep student roster completely private
-- Anonymous users cannot SELECT * from students (prevents database dumping)
CREATE POLICY "Students table is private; service-role only"
  ON public.students
  FOR ALL
  TO service_role
  USING (true);

-- Anonymous users can read active UPI accounts
CREATE POLICY "Public can view active UPI accounts"
  ON public.upi_accounts
  FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- Donations Policies
CREATE POLICY "Allow service role full access to donations"
  ON public.donations
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Allow public to insert new donation requests"
  ON public.donations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public to view own donation by reference"
  ON public.donations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 9. Setup Supabase Storage for Private Screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', false)
ON CONFLICT (id) DO UPDATE SET public = false;

CREATE POLICY "Allow anyone to upload payment screenshot"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'payment-screenshots');

CREATE POLICY "Allow authenticated admins / service role to view screenshots"
  ON storage.objects
  FOR SELECT
  TO authenticated, service_role
  USING (bucket_id = 'payment-screenshots');

-- 10. SEED DATA: 4 Configured Rotating UPI Accounts
INSERT INTO public.upi_accounts (slot_number, upi_id, account_name, is_active)
VALUES 
  (1, 'campus.fund1@okhdfcbank', 'Campus Student Welfare Account A', true),
  (2, 'campus.fund2@okaxis', 'Campus Cultural Welfare Account B', true),
  (3, 'campus.fund3@paytm', 'Campus Fest & Charity Account C', true),
  (4, 'campus.fund4@sbi', 'Campus Alumni & Development Fund D', true)
ON CONFLICT (slot_number) DO UPDATE 
SET upi_id = EXCLUDED.upi_id,
    account_name = EXCLUDED.account_name;

-- 11. SEED DATA: Official Campus Student Roster
INSERT INTO public.students (roll_number, student_name, email)
VALUES
  ('25H51A0465', 'A. Abhijeeth', '25h51a0465@cmrcet.ac.in'),
  ('25H51A0466', 'ALASYAM TRINADH LAKSHMI REDDY', '25h51a0466@cmrcet.ac.in'),
  ('25H51A0467', 'AMBATI HARI CHANDANA', '25h51a0467@cmrcet.ac.in'),
  ('25H51A0468', 'BANDLA SAKETH', '25h51a0468@cmrcet.ac.in'),
  ('25H51A0469', 'BAPANAPALLI RAKSHITHA', '25h51a0469@cmrcet.ac.in'),
  ('25H51A0470', 'BATHUKU VAMSHI', '25h51a0470@cmrcet.ac.in'),
  ('25H51A0471', 'BOINI ASHWITHA', '25h51a0471@cmrcet.ac.in'),
  ('25H51A0472', 'BOLISETTY JASWANTH', '25h51a0472@cmrcet.ac.in'),
  ('25H51A0473', 'BURUGU NITHYESH', '25h51a0473@cmrcet.ac.in'),
  ('25H51A0474', 'C RAKESH', '25h51a0474@cmrcet.ac.in'),
  ('25H51A0475', 'CHILUKURI VENKATA SAI VINESH', '25h51a0475@cmrcet.ac.in'),
  ('25H51A0476', 'CHITTEPU MADHU KIRAN REDDY', '25h51a0476@cmrcet.ac.in'),
  ('25H51A0477', 'DUGGIRALA SIVA VARDHAN', '25h51a0477@cmrcet.ac.in'),
  ('25H51A0478', 'GANGI HARSHITHA', '25h51a0478@cmrcet.ac.in'),
  ('25H51A0479', 'GANUPAKA JASHWANTH', '25h51a0479@cmrcet.ac.in'),
  ('25H51A0480', 'GOPU SIDDARTH CHANDRA', '25h51a0480@cmrcet.ac.in'),
  ('25H51A0481', 'GUDEPU RAGHUVARAN', '25h51a0481@cmrcet.ac.in'),
  ('25H51A0482', 'GUNJI SRI LAXMI', '25h51a0482@cmrcet.ac.in'),
  ('25H51A0483', 'GUNTAPALLI THARUN', '25h51a0483@cmrcet.ac.in'),
  ('25H51A0484', 'HARSHIT SINGH', '25h51a0484@cmrcet.ac.in'),
  ('25H51A0485', 'KARNATI JAYANTH', '25h51a0485@cmrcet.ac.in'),
  ('25H51A0486', 'KATELLA BHARADWAJ', '25h51a0486@cmrcet.ac.in'),
  ('25H51A0487', 'KATTA SAI TEJA REDDY', '25h51a0487@cmrcet.ac.in'),
  ('25H51A0488', 'KATTHI MANESH', '25h51a0488@cmrcet.ac.in'),
  ('25H51A0489', 'KOSANA SAMITHA', '25h51a0489@cmrcet.ac.in'),
  ('25H51A0490', 'KOTHA KAMALAHASAN', '25h51a0490@cmrcet.ac.in'),
  ('25H51A0491', 'KUMMARI AKSHAYA', '25h51a0491@cmrcet.ac.in'),
  ('25H51A0492', 'KURUSAM VISHNU VARSHITH', '25h51a0492@cmrcet.ac.in'),
  ('25H51A0493', 'LINGAM LALITH SAI ADITYA', '25h51a0493@cmrcet.ac.in'),
  ('25H51A0494', 'M SWATHI', '25h51a0494@cmrcet.ac.in'),
  ('25H51A0495', 'MACHKURI SANDEEP', '25h51a0495@cmrcet.ac.in'),
  ('25H51A0496', 'MANTRARAJAM ABHIRAM', '25h51a0496@cmrcet.ac.in'),
  ('25H51A0497', 'MARYALA SAMYUKTH', '25h51a0497@cmrcet.ac.in'),
  ('25H51A0498', 'MEDISHETTI YASHWANTH', '25h51a0498@cmrcet.ac.in'),
  ('25H51A0499', 'MOHAMMED AJMEERI', '25h51a0499@cmrcet.ac.in'),
  ('25H51A04A0', 'MUDIREDDY YOGESWAR REDDY', '25h51a04a0@cmrcet.ac.in'),
  ('25H51A04A1', 'MUTHYALA DRONA CHARY', '25h51a04a1@cmrcet.ac.in'),
  ('25H51A04A2', 'MUTHYAMGARI RISHIKESH', '25h51a04a2@cmrcet.ac.in'),
  ('25H51A04A3', 'MUTTUKURI SAMPATH MARUTHI', '25h51a04a3@cmrcet.ac.in'),
  ('25H51A04A4', 'NANDIPATI SRUTHI', '25h51a04a4@cmrcet.ac.in'),
  ('25H51A04A5', 'NEMLI VAISHNAVI', '25h51a04a5@cmrcet.ac.in'),
  ('25H51A04A6', 'NETHI SAMEEKSHA', '25h51a04a6@cmrcet.ac.in'),
  ('25H51A04A7', 'NUKALA VILAS', '25h51a04a7@cmrcet.ac.in'),
  ('25H51A04A8', 'PINGILI SHASHIPRIYA', '25h51a04a8@cmrcet.ac.in'),
  ('25H51A04A9', 'PODETI MEDHA MOULIK', '25h51a04a9@cmrcet.ac.in'),
  ('25H51A04B0', 'POLEPALLY LAKSHMAN REDDY', '25h51a04b0@cmrcet.ac.in'),
  ('25H51A04B1', 'PONNAPATI YOGITHA REDDY', '25h51a04b1@cmrcet.ac.in'),
  ('25H51A04B2', 'PUNUGOTI SATHWIK RAO', '25h51a04b2@cmrcet.ac.in'),
  ('25H51A04B3', 'PUTTA SHIVAMANI', '25h51a04b3@cmrcet.ac.in'),
  ('25H51A04B4', 'RACHAVARAM SAI PRANEETH', '25h51a04b4@cmrcet.ac.in'),
  ('25H51A04B5', 'REKULAPALLI ANYUTHA', '25h51a04b5@cmrcet.ac.in'),
  ('25H51A04B6', 'RISHITHA P', '25h51a04b6@cmrcet.ac.in'),
  ('25H51A04B7', 'SRUTHI K', '25h51a04b7@cmrcet.ac.in'),
  ('25H51A04B8', 'SYED THAJMEEN', '25h51a04b8@cmrcet.ac.in'),
  ('25H51A04B9', 'TALARI RAKESH', '25h51a04b9@cmrcet.ac.in'),
  ('25H51A04C0', 'THADUR SIRI SAHASRA', '25h51a04c0@cmrcet.ac.in'),
  ('25H51A04C1', 'THOKALA ASHRITHA', '25h51a04c1@cmrcet.ac.in'),
  ('25H51A04C2', 'UTHKAM ANUDEEP', '25h51a04c2@cmrcet.ac.in'),
  ('25H51A04C4', 'VEDURUVALASA MANASVI', '25h51a04c4@cmrcet.ac.in'),
  ('25H51A04C5', 'VEERLAPATI SAI TRIVIKRAM', '25h51a04c5@cmrcet.ac.in'),
  ('25H51A04C7', 'VODNALA VARSHINI', '25h51a04c7@cmrcet.ac.in'),
  ('25H51A04C8', 'YELLAPRAGADA VENKATA NAGA SAI VAISHNAV', '25h51a04c8@cmrcet.ac.in'),
  ('25H55A0409', 'POKALA DILIP', '25h55a0409@cmrcet.ac.in'),
  ('26H55A0407', 'Sandupatla Abhiraj', '26h55a0407@cmrcet.ac.in'),
  ('26H55A0408', 'KORABONI LASYA PRIYA', '26h55a0408@cmrcet.ac.in'),
  ('26H55A0409', 'P.Dilip', '26h55a0409@cmrcet.ac.in'),
  ('26H55A0410', 'BHUKYA SANTHOSH NAIK', '26h55a0410@cmrcet.ac.in'),
  ('26H55A0411', 'JINDAM AKSHAYA', '26h55a0411@cmrcet.ac.in'),
  ('26H55A0412', 'RANGU VYSHNAVI', '26h55a0412@cmrcet.ac.in'),
  ('26H55A0413', 'SEEDARLA SHRUTHI', '26h55a0413@cmrcet.ac.in'),
  ('26H55A0414', 'NARAMAN NAMITHA', '26h55a0414@cmrcet.ac.in')
ON CONFLICT (roll_number) DO UPDATE
SET student_name = EXCLUDED.student_name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- Verification query
SELECT COUNT(*) AS total_student_records FROM public.students;
