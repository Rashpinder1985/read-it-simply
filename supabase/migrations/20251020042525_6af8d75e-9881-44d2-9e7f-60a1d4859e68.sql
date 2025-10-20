-- Add new role values to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'marketing';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'content';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'assets';

-- Update RLS policy on user_roles to allow admins to manage roles
CREATE POLICY "Admins can insert roles" ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles" ON public.profiles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));