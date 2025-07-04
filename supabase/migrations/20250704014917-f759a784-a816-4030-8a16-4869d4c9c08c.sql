-- Disable captcha for auth (development purposes)
-- This is done via Supabase dashboard: Authentication > Settings > Bot Protection
-- But we can ensure auth policies are correct

-- Make sure RLS is working correctly and policies exist
-- Update profiles table policy to allow INSERT for new users
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure the trigger function has proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student')
    );
  EXCEPTION 
    WHEN unique_violation THEN
      -- Profile already exists, just update it
      UPDATE public.profiles 
      SET 
        email = NEW.email,
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', email),
        role = COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, role),
        updated_at = NOW()
      WHERE id = NEW.id;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;