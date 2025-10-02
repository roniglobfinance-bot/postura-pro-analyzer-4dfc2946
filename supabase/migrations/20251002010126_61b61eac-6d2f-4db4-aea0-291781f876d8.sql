-- Desabilitar RLS em todas as tabelas para permitir acesso público
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.postural_analyses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas RLS existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view basic student profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Users can insert own evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Users can update own evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Users can delete own evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Users can view own analyses" ON public.postural_analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON public.postural_analyses;
DROP POLICY IF EXISTS "Users can update own analyses" ON public.postural_analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON public.postural_analyses;

-- Remover a função de segurança que não é mais necessária
DROP FUNCTION IF EXISTS public.get_own_full_profile();