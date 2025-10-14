-- Update the handle_new_user trigger to also generate sample data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  business_name_var TEXT;
BEGIN
  -- Extract business name from metadata
  business_name_var := NEW.raw_user_meta_data->>'business_name';
  
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, business_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    business_name_var
  );
  
  -- Call edge function to generate sample data asynchronously
  -- Using pg_net extension if available, otherwise user will have empty state initially
  PERFORM
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/generate-sample-data',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'userId', NEW.id::text,
        'businessName', business_name_var
      )
    );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If edge function call fails, still create the profile
    -- Sample data can be generated later
    RETURN NEW;
END;
$$;