-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Create a new policy that allows users to view their own roles
-- and doesn't cause recursion since we're not checking admin status here
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- For user management queries, we'll rely on the edge functions
-- which use the service role key and bypass RLS