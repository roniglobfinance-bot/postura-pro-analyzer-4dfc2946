-- 1. ALTO: Corrigir políticas de segurança restantes
-- Fix remaining security warnings by properly configuring RLS policies

-- Fix storage policies to be more restrictive
DROP POLICY IF EXISTS "authenticated_users_upload_photos" ON storage.objects;

CREATE POLICY "authenticated_users_upload_photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'photos' 
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2. MÉDIO: Implementar funções de usuário avançadas
-- Create function to get user profile with role
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  avatar_url text,
  role public.user_role,
  created_at timestamptz,
  updated_at timestamptz
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.role,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = COALESCE(user_id, auth.uid());
$$;

-- Create function to check if user is teacher
CREATE OR REPLACE FUNCTION public.is_teacher(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = COALESCE(user_id, auth.uid()) 
    AND role = 'teacher'
  );
$$;

-- Create function to check if user is student  
CREATE OR REPLACE FUNCTION public.is_student(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = COALESCE(user_id, auth.uid()) 
    AND role = 'student'
  );
$$;

-- Create function to get teacher's students
CREATE OR REPLACE FUNCTION public.get_teacher_students(teacher_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  student_id uuid,
  full_name text,
  email text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    s.student_id,
    p.full_name,
    p.email,
    s.created_at
  FROM public.students s
  JOIN public.profiles p ON p.id = s.student_id
  WHERE s.teacher_id = COALESCE(teacher_id, auth.uid())
  ORDER BY p.full_name;
$$;

-- Create function to get student's evaluations with teacher info
CREATE OR REPLACE FUNCTION public.get_student_evaluations(student_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  id uuid,
  title text,
  status text,
  created_at timestamptz,
  teacher_name text,
  teacher_email text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    e.id,
    e.title,
    e.status,
    e.created_at,
    p.full_name as teacher_name,
    p.email as teacher_email
  FROM public.evaluations e
  JOIN public.profiles p ON p.id = e.teacher_id
  WHERE e.student_id = COALESCE(student_id, auth.uid())
  ORDER BY e.created_at DESC;
$$;

-- Create function to add student to teacher
CREATE OR REPLACE FUNCTION public.add_student_to_teacher(
  teacher_id uuid,
  student_email text
)
RETURNS TABLE (
  success boolean,
  message text,
  student_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  found_student_id uuid;
  existing_relationship boolean;
BEGIN
  -- Check if caller is a teacher
  IF NOT public.is_teacher(auth.uid()) THEN
    RETURN QUERY SELECT false, 'Apenas professores podem adicionar alunos'::text, null::uuid;
    RETURN;
  END IF;

  -- Find student by email
  SELECT id INTO found_student_id 
  FROM public.profiles 
  WHERE email = student_email AND role = 'student';

  IF found_student_id IS NULL THEN
    RETURN QUERY SELECT false, 'Aluno não encontrado'::text, null::uuid;
    RETURN;
  END IF;

  -- Check if relationship already exists
  SELECT EXISTS (
    SELECT 1 FROM public.students 
    WHERE teacher_id = add_student_to_teacher.teacher_id 
    AND student_id = found_student_id
  ) INTO existing_relationship;

  IF existing_relationship THEN
    RETURN QUERY SELECT false, 'Aluno já está vinculado a este professor'::text, found_student_id;
    RETURN;
  END IF;

  -- Add relationship
  INSERT INTO public.students (teacher_id, student_id)
  VALUES (add_student_to_teacher.teacher_id, found_student_id);

  RETURN QUERY SELECT true, 'Aluno adicionado com sucesso'::text, found_student_id;
END;
$$;

-- 3. Create function to create new evaluation
CREATE OR REPLACE FUNCTION public.create_evaluation(
  p_title text,
  p_student_id uuid DEFAULT NULL
)
RETURNS TABLE (
  evaluation_id uuid,
  success boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_evaluation_id uuid;
BEGIN
  -- Generate new evaluation ID
  new_evaluation_id := gen_random_uuid();

  -- Insert evaluation
  INSERT INTO public.evaluations (
    id,
    title,
    teacher_id,
    student_id,
    status,
    created_at
  ) VALUES (
    new_evaluation_id,
    p_title,
    auth.uid(),
    p_student_id,
    'draft',
    now()
  );

  RETURN QUERY SELECT new_evaluation_id, true, 'Avaliação criada com sucesso'::text;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT null::uuid, false, 'Erro ao criar avaliação: ' || SQLERRM;
END;
$$;

-- Create function to update evaluation status
CREATE OR REPLACE FUNCTION public.update_evaluation_status(
  evaluation_id uuid,
  new_status text
)
RETURNS TABLE (
  success boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if user has permission to update this evaluation
  IF NOT EXISTS (
    SELECT 1 FROM public.evaluations 
    WHERE id = evaluation_id 
    AND (teacher_id = auth.uid() OR student_id = auth.uid())
  ) THEN
    RETURN QUERY SELECT false, 'Sem permissão para atualizar esta avaliação'::text;
    RETURN;
  END IF;

  -- Update evaluation status
  UPDATE public.evaluations 
  SET status = new_status, updated_at = now()
  WHERE id = evaluation_id;

  RETURN QUERY SELECT true, 'Status atualizado com sucesso'::text;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, 'Erro ao atualizar status: ' || SQLERRM;
END;
$$;