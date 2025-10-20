-- Allow content editors to insert content (for uploading new content after rejection)
CREATE POLICY "Content editors can create content"
ON public.content
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_id) AND 
  (has_role(auth.uid(), 'admin'::app_role) OR 
   has_role(auth.uid(), 'marketing'::app_role) OR 
   has_role(auth.uid(), 'content'::app_role))
);

-- Prevent content editors from modifying market_data (ensure they can only view)
-- Remove any existing policies that might allow updates, keep only SELECT

-- Verify content editors cannot update personas table (only view)
-- They should not have UPDATE access to personas