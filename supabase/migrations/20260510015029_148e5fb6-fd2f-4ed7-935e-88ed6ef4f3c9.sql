
ALTER TABLE public.ppa_plan_links 
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS report_html text,
  ADD COLUMN IF NOT EXISTS recommendations jsonb DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.ppa_movement_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL,
  exercise_type text NOT NULL,
  video_url text,
  keypoint_trajectory jsonb DEFAULT '[]'::jsonb,
  detected_faults jsonb DEFAULT '[]'::jsonb,
  rom_data jsonb DEFAULT '{}'::jsonb,
  ai_summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ppa_movement_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY teachers_manage_movement ON public.ppa_movement_analyses
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ppa_assessments a WHERE a.id = assessment_id AND a.teacher_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.ppa_assessments a WHERE a.id = assessment_id AND a.teacher_id = auth.uid()));

CREATE POLICY students_view_movement ON public.ppa_movement_analyses
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ppa_assessments a WHERE a.id = assessment_id AND a.student_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.ppa_complaint_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid,
  student_id uuid NOT NULL,
  raw_text text NOT NULL,
  extracted_region text,
  pattern_type text,
  pattern_match text,
  red_flags jsonb DEFAULT '[]'::jsonb,
  ai_interpretation text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ppa_complaint_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY teachers_manage_complaints ON public.ppa_complaint_analyses
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.students s WHERE s.student_id = ppa_complaint_analyses.student_id AND s.teacher_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.students s WHERE s.student_id = ppa_complaint_analyses.student_id AND s.teacher_id = auth.uid()));

CREATE POLICY students_manage_own_complaints ON public.ppa_complaint_analyses
  FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.ppa_body_composition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid,
  student_id uuid NOT NULL,
  front_photo_url text,
  side_photo_url text,
  height_cm numeric,
  weight_kg numeric,
  estimated_body_fat_pct numeric,
  estimated_lean_mass_kg numeric,
  confidence numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ppa_body_composition ENABLE ROW LEVEL SECURITY;

CREATE POLICY teachers_manage_bodycomp ON public.ppa_body_composition
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.students s WHERE s.student_id = ppa_body_composition.student_id AND s.teacher_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.students s WHERE s.student_id = ppa_body_composition.student_id AND s.teacher_id = auth.uid()));

CREATE POLICY students_view_own_bodycomp ON public.ppa_body_composition
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.ai_analysis_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_run_id uuid,
  movement_analysis_id uuid,
  complaint_analysis_id uuid,
  teacher_id uuid NOT NULL,
  was_accurate boolean,
  correction_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_analysis_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY teachers_manage_own_feedback ON public.ai_analysis_feedback
  FOR ALL TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());
