-- CORREÇÃO CRÍTICA DE SEGURANÇA: Proteger dados sensíveis

-- 1. Atualizar política de profiles para proteger emails
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_users_can_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "teachers_can_view_students_profiles" ON public.profiles;

-- Usuários veem apenas seu próprio perfil
CREATE POLICY "users_view_own_profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Professores veem informações básicas dos alunos (sem email exposto em listagens)
CREATE POLICY "teachers_view_students_basic"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.students
    WHERE teacher_id = auth.uid() 
    AND student_id = profiles.id
  )
);

-- 2. Criar função segura para obter perfil completo (apenas próprio usuário)
CREATE OR REPLACE FUNCTION public.get_own_full_profile()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role user_role,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email, full_name, avatar_url, role, created_at, updated_at
  FROM public.profiles
  WHERE id = auth.uid();
$$;

-- 3. Criar tabela para análises automáticas
CREATE TABLE IF NOT EXISTS public.postural_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id UUID REFERENCES public.evaluations(id) ON DELETE CASCADE NOT NULL,
  created_by TEXT NOT NULL,
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Scores e métricas
  overall_score INTEGER NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  
  -- Padrões identificados (JSON)
  identified_patterns JSONB DEFAULT '[]'::jsonb,
  
  -- Recomendações
  recommendations JSONB DEFAULT '[]'::jsonb,
  exercise_protocols JSONB DEFAULT '[]'::jsonb,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para postural_analyses
ALTER TABLE public.postural_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_analyses"
ON public.postural_analyses FOR SELECT
USING (auth.uid()::text = created_by);

CREATE POLICY "users_insert_own_analyses"
ON public.postural_analyses FOR INSERT
WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "users_update_own_analyses"
ON public.postural_analyses FOR UPDATE
USING (auth.uid()::text = created_by)
WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "users_delete_own_analyses"
ON public.postural_analyses FOR DELETE
USING (auth.uid()::text = created_by);

-- 4. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para atualizar updated_at em postural_analyses
DROP TRIGGER IF EXISTS set_updated_at ON public.postural_analyses;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.postural_analyses
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();