
-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('teacher', 'student');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role public.user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table (for teacher-student relationship)
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, student_id)
);

-- Create evaluations table
CREATE TABLE public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  
  -- Basic client data
  age INTEGER,
  height DECIMAL,
  weight DECIMAL,
  
  -- Postural measurements
  cranio_cervical_angle DECIMAL DEFAULT 55,
  thoracic_kyphosis DECIMAL DEFAULT 30,
  lumbar_lordosis DECIMAL DEFAULT 50,
  pelvic_tilt DECIMAL DEFAULT 12,
  shoulder_imbalance DECIMAL DEFAULT 0,
  cobb_angle DECIMAL DEFAULT 0,
  pelvic_imbalance DECIMAL DEFAULT 0,
  
  -- Postural assessments
  scapular_abduction TEXT DEFAULT 'normal',
  scapular_elevation TEXT DEFAULT 'symmetric',
  
  -- Functional tests
  thomas_test TEXT DEFAULT 'negative',
  ober_test TEXT DEFAULT 'negative',
  adams_test TEXT DEFAULT 'negative',
  beighton_test TEXT DEFAULT 'negative',
  squat_pattern TEXT DEFAULT 'normal',
  walking_pattern TEXT DEFAULT 'normal',
  
  -- Observations
  observations TEXT,
  complaints TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create photos table
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID REFERENCES public.evaluations(id) ON DELETE CASCADE,
  view_type TEXT NOT NULL CHECK (view_type IN ('anterior', 'posterior', 'lateral-direita', 'lateral-esquerda')),
  image_url TEXT NOT NULL,
  measurements JSONB DEFAULT '[]',
  ai_analysis JSONB,
  is_validated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID REFERENCES public.evaluations(id) ON DELETE CASCADE,
  pdf_url TEXT,
  share_token TEXT UNIQUE,
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Teachers can view their students profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE teacher_id = auth.uid() AND student_id = profiles.id
    )
  );

-- RLS Policies for students (teacher-student relationships)
CREATE POLICY "Teachers can manage their students" ON public.students
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Students can view their teacher relationship" ON public.students
  FOR SELECT USING (student_id = auth.uid());

-- RLS Policies for evaluations
CREATE POLICY "Students can view their own evaluations" ON public.evaluations
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can manage evaluations of their students" ON public.evaluations
  FOR ALL USING (
    teacher_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE teacher_id = auth.uid() AND student_id = evaluations.student_id
    )
  );

-- RLS Policies for photos
CREATE POLICY "Users can view photos of their evaluations" ON public.photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.evaluations 
      WHERE id = photos.evaluation_id AND 
      (student_id = auth.uid() OR teacher_id = auth.uid())
    )
  );

CREATE POLICY "Teachers can manage photos of their students evaluations" ON public.photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.evaluations 
      WHERE id = photos.evaluation_id AND teacher_id = auth.uid()
    )
  );

-- RLS Policies for reports
CREATE POLICY "Users can view reports of their evaluations" ON public.reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.evaluations 
      WHERE id = reports.evaluation_id AND 
      (student_id = auth.uid() OR teacher_id = auth.uid())
    )
  );

CREATE POLICY "Teachers can manage reports of their students evaluations" ON public.reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.evaluations 
      WHERE id = reports.evaluation_id AND teacher_id = auth.uid()
    )
  );

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- Create storage policies
CREATE POLICY "Users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Users can update their photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);
