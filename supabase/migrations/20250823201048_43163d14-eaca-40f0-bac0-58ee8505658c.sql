-- Fix security issues: Update RLS policies to prevent anonymous access
-- Add search_path to functions and restrict to authenticated users only

-- 1. Fix function search_path security issues
ALTER FUNCTION public.get_user_role(uuid) SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';

-- 2. Drop existing policies and recreate with proper authentication checks
-- For profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view their students profiles" ON public.profiles;

-- Recreate profiles policies with authentication checks
CREATE POLICY "authenticated_users_can_view_own_profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "authenticated_users_can_update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "authenticated_users_can_insert_own_profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "teachers_can_view_students_profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE students.teacher_id = auth.uid() 
      AND students.student_id = profiles.id
    )
  );

-- 3. Fix students table policies
DROP POLICY IF EXISTS "Teachers can manage their students" ON public.students;
DROP POLICY IF EXISTS "Students can view their teacher relationship" ON public.students;

CREATE POLICY "authenticated_teachers_can_manage_students" ON public.students
  FOR ALL TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "authenticated_students_can_view_relationship" ON public.students
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- 4. Fix evaluations table policies
DROP POLICY IF EXISTS "Teachers can manage evaluations of their students" ON public.evaluations;
DROP POLICY IF EXISTS "Students can view their own evaluations" ON public.evaluations;

CREATE POLICY "authenticated_teachers_manage_evaluations" ON public.evaluations
  FOR ALL TO authenticated
  USING (
    teacher_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE students.teacher_id = auth.uid() 
      AND students.student_id = evaluations.student_id
    )
  );

CREATE POLICY "authenticated_students_view_evaluations" ON public.evaluations
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- 5. Fix photos table policies
DROP POLICY IF EXISTS "Teachers can manage photos of their students evaluations" ON public.photos;
DROP POLICY IF EXISTS "Users can view photos of their evaluations" ON public.photos;

CREATE POLICY "authenticated_teachers_manage_photos" ON public.photos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.evaluations 
      WHERE evaluations.id = photos.evaluation_id 
      AND evaluations.teacher_id = auth.uid()
    )
  );

CREATE POLICY "authenticated_users_view_photos" ON public.photos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.evaluations 
      WHERE evaluations.id = photos.evaluation_id 
      AND (evaluations.student_id = auth.uid() OR evaluations.teacher_id = auth.uid())
    )
  );

-- 6. Fix reports table policies
DROP POLICY IF EXISTS "Teachers can manage reports of their students evaluations" ON public.reports;
DROP POLICY IF EXISTS "Users can view reports of their evaluations" ON public.reports;

CREATE POLICY "authenticated_teachers_manage_reports" ON public.reports
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.evaluations 
      WHERE evaluations.id = reports.evaluation_id 
      AND evaluations.teacher_id = auth.uid()
    )
  );

CREATE POLICY "authenticated_users_view_reports" ON public.reports
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.evaluations 
      WHERE evaluations.id = reports.evaluation_id 
      AND (evaluations.student_id = auth.uid() OR evaluations.teacher_id = auth.uid())
    )
  );

-- 7. Fix assessment_drafts table policies
DROP POLICY IF EXISTS "Users can manage their own drafts" ON public.assessment_drafts;

CREATE POLICY "authenticated_users_manage_drafts" ON public.assessment_drafts
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- 8. Fix user_feedback table policies
DROP POLICY IF EXISTS "Users can create their own feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Teachers can view all feedback" ON public.user_feedback;

CREATE POLICY "authenticated_users_create_feedback" ON public.user_feedback
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated_users_view_feedback" ON public.user_feedback
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "authenticated_teachers_view_all_feedback" ON public.user_feedback
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'teacher'
    )
  );

-- 9. Fix storage policies - drop and recreate with proper authentication
DROP POLICY IF EXISTS "Users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their photos" ON storage.objects;

-- Create authenticated-only storage policies
CREATE POLICY "authenticated_users_view_photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'photos');

CREATE POLICY "authenticated_users_upload_photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "authenticated_users_update_photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "authenticated_users_delete_photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 10. Create policy for exercicios table which currently has no policies
CREATE POLICY "authenticated_users_view_exercicios" ON public.exercicios
  FOR SELECT TO authenticated
  USING (true);

-- 11. Create trigger for profiles table to automatically update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();