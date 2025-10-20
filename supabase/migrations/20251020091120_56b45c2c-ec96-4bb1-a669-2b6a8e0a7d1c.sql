-- Drop ALL existing policies that might conflict
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;  
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Asset managers can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Asset managers can delete media" ON storage.objects;
DROP POLICY IF EXISTS "Everyone can view media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view media" ON storage.objects;

-- Drop function with cascade
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;

-- Update the enum
ALTER TYPE public.app_role RENAME TO app_role_old;
CREATE TYPE public.app_role AS ENUM ('admin', 'marketing', 'content', 'assets');
ALTER TABLE public.user_roles ALTER COLUMN role TYPE public.app_role USING role::text::public.app_role;
DROP TYPE public.app_role_old;

-- Recreate the has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Content table policies
CREATE POLICY "Content viewers can view content"
ON public.content FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'marketing'::app_role) OR has_role(auth.uid(), 'content'::app_role));

CREATE POLICY "Marketing can create content"
ON public.content FOR INSERT
WITH CHECK (auth.uid() = user_id AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'marketing'::app_role)));

CREATE POLICY "Content editors can update content"
ON public.content FOR UPDATE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'marketing'::app_role) OR has_role(auth.uid(), 'content'::app_role));

CREATE POLICY "Marketing can delete content"
ON public.content FOR DELETE
USING (auth.uid() = user_id AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'marketing'::app_role)));

-- Market data policies  
CREATE POLICY "Marketing can view market data"
ON public.market_data FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "Marketing can create market data"
ON public.market_data FOR INSERT
WITH CHECK (auth.uid() = user_id AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'marketing'::app_role)));

CREATE POLICY "Marketing can update market data"
ON public.market_data FOR UPDATE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

-- Personas policies
CREATE POLICY "Marketing can view personas"
ON public.personas FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "Marketing can create personas"
ON public.personas FOR INSERT
WITH CHECK (auth.uid() = user_id AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'marketing'::app_role)));

CREATE POLICY "Marketing can update personas"
ON public.personas FOR UPDATE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

-- Business details policies
CREATE POLICY "Staff can view business details"
ON public.business_details FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "Admin can insert business details"
ON public.business_details FOR INSERT
WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update business details"
ON public.business_details FOR UPDATE
USING (auth.uid() = user_id AND has_role(auth.uid(), 'admin'::app_role));

-- User roles policies
CREATE POLICY "Admins can manage roles insert"
ON public.user_roles FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage roles update"
ON public.user_roles FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage roles delete"
ON public.user_roles FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

-- Profiles policies
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can delete any profile"
ON public.profiles FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for business-media bucket
CREATE POLICY "Asset managers can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'business-media' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'marketing'::app_role) OR has_role(auth.uid(), 'content'::app_role) OR has_role(auth.uid(), 'assets'::app_role)));

CREATE POLICY "Asset managers can delete media"
ON storage.objects FOR DELETE
USING (bucket_id = 'business-media' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'marketing'::app_role) OR has_role(auth.uid(), 'content'::app_role) OR has_role(auth.uid(), 'assets'::app_role)));

CREATE POLICY "Everyone can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-media');