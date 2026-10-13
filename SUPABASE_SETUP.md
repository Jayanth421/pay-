# Supabase Setup: Fix Storage & Image Uploads

If your images are not saving to Supabase Storage, run the SQL script below in your **Supabase Dashboard**:

### Steps:
1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/osieezbbynuchmpxxrqi)
2. Go to **SQL Editor** -> **New Query**
3. Paste the following SQL and click **Run**:

```sql
-- 1. Create the payment-screenshots storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow public/anon uploads to the storage bucket
DROP POLICY IF EXISTS "Allow public uploads to payment-screenshots" ON storage.objects;
CREATE POLICY "Allow public uploads to payment-screenshots"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'payment-screenshots');

-- 3. Allow public viewing of screenshots
DROP POLICY IF EXISTS "Allow public viewing of payment-screenshots" ON storage.objects;
CREATE POLICY "Allow public viewing of payment-screenshots"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'payment-screenshots');

-- 4. Allow donations table updates
DROP POLICY IF EXISTS "Allow public update to donations" ON public.donations;
CREATE POLICY "Allow public update to donations"
ON public.donations FOR UPDATE TO anon, authenticated
USING (true)
WITH CHECK (true);
```

### Alternatively: Add `SUPABASE_SERVICE_ROLE_KEY`
You can also copy your **`service_role` secret key** from:
**Supabase Dashboard -> Project Settings -> API -> `service_role`**
and add it to your `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_key_here
```
With the service role key, all storage uploads and database updates bypass RLS automatically.
