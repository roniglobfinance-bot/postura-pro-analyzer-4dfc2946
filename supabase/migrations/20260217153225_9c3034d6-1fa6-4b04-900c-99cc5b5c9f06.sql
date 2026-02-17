
-- =====================================================
-- PACOTE 1: 10 PPA Tables + RLS + Protocol Seed
-- =====================================================

-- 1) PPA_Assessments
CREATE TABLE public.ppa_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  pain jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'novo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_ppa_assessments_updated_at
  BEFORE UPDATE ON public.ppa_assessments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2) PPA_MediaAssets
CREATE TABLE public.ppa_media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.ppa_assessments(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'foto',
  view text NOT NULL,
  side text NOT NULL DEFAULT 'NA',
  image_url text NOT NULL,
  qa_status text NOT NULL DEFAULT 'fail',
  qa_reasons jsonb DEFAULT '[]'::jsonb,
  capture_confidence numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3) PPA_AnalysisRuns
CREATE TABLE public.ppa_analysis_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.ppa_assessments(id) ON DELETE CASCADE,
  model_version text DEFAULT 'v1.0',
  status text NOT NULL DEFAULT 'rascunho',
  confidence_final numeric DEFAULT 0,
  dominant_vector jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4) PPA_Metrics
CREATE TABLE public.ppa_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_run_id uuid NOT NULL REFERENCES public.ppa_analysis_runs(id) ON DELETE CASCADE,
  key text NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  unit text DEFAULT '',
  threshold_ref numeric DEFAULT 0,
  severity integer NOT NULL DEFAULT 0 CHECK (severity >= 0 AND severity <= 3),
  confidence numeric DEFAULT 0
);

-- 5) PPA_Findings
CREATE TABLE public.ppa_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_run_id uuid NOT NULL REFERENCES public.ppa_analysis_runs(id) ON DELETE CASCADE,
  finding_key text NOT NULL,
  direction text DEFAULT 'anterior',
  severity integer NOT NULL DEFAULT 0 CHECK (severity >= 0 AND severity <= 3),
  confidence numeric DEFAULT 0,
  chain jsonb DEFAULT '{}'::jsonb
);

-- 6) PPA_Clusters
CREATE TABLE public.ppa_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_run_id uuid NOT NULL REFERENCES public.ppa_analysis_runs(id) ON DELETE CASCADE,
  cluster_types jsonb DEFAULT '[]'::jsonb,
  score integer NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  rationale jsonb DEFAULT '{}'::jsonb
);

-- 7) PPA_EngineDecisions
CREATE TABLE public.ppa_engine_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_run_id uuid NOT NULL REFERENCES public.ppa_analysis_runs(id) ON DELETE CASCADE,
  macro_state text NOT NULL,
  micro_states jsonb DEFAULT '[]'::jsonb,
  final_decision jsonb DEFAULT '{}'::jsonb,
  risk_level text NOT NULL DEFAULT 'baixo',
  decided_by text NOT NULL DEFAULT 'auto',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8) PPA_ProtocolsLibrary
CREATE TABLE public.ppa_protocols_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_key text UNIQUE NOT NULL,
  category text NOT NULL,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  contraindications jsonb DEFAULT '[]'::jsonb,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9) PPA_PlanLinks
CREATE TABLE public.ppa_plan_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  analysis_run_id uuid NOT NULL REFERENCES public.ppa_analysis_runs(id) ON DELETE CASCADE,
  periodizer_plan_id text,
  smart_treino_plan_id text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 10) PPA_MonitoringLogs
CREATE TABLE public.ppa_monitoring_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id text,
  tns integer DEFAULT 0 CHECK (tns >= 0 AND tns <= 100),
  pain_delta jsonb DEFAULT '{}'::jsonb,
  integrity_result text NOT NULL DEFAULT 'pass',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE public.ppa_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppa_media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppa_analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppa_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppa_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppa_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppa_engine_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppa_protocols_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppa_plan_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppa_monitoring_logs ENABLE ROW LEVEL SECURITY;

-- PPA_Assessments: teacher full CRUD, student read own
CREATE POLICY "teachers_manage_assessments" ON public.ppa_assessments
  FOR ALL TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "students_view_own_assessments" ON public.ppa_assessments
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- PPA_MediaAssets: teacher via assessment, student can insert+view own
CREATE POLICY "teachers_manage_media" ON public.ppa_media_assets
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ppa_assessments a WHERE a.id = assessment_id AND a.teacher_id = auth.uid()));

CREATE POLICY "students_view_own_media" ON public.ppa_media_assets
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ppa_assessments a WHERE a.id = assessment_id AND a.student_id = auth.uid()));

CREATE POLICY "students_insert_media" ON public.ppa_media_assets
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.ppa_assessments a WHERE a.id = assessment_id AND a.student_id = auth.uid()));

-- PPA_AnalysisRuns: teacher via assessment, student read
CREATE POLICY "teachers_manage_analysis_runs" ON public.ppa_analysis_runs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ppa_assessments a WHERE a.id = assessment_id AND a.teacher_id = auth.uid()));

CREATE POLICY "students_view_analysis_runs" ON public.ppa_analysis_runs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ppa_assessments a WHERE a.id = assessment_id AND a.student_id = auth.uid()));

-- PPA_Metrics: via analysis_run -> assessment -> teacher/student
CREATE POLICY "teachers_manage_metrics" ON public.ppa_metrics
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ppa_analysis_runs r JOIN public.ppa_assessments a ON a.id = r.assessment_id WHERE r.id = analysis_run_id AND a.teacher_id = auth.uid()));

CREATE POLICY "students_view_metrics" ON public.ppa_metrics
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ppa_analysis_runs r JOIN public.ppa_assessments a ON a.id = r.assessment_id WHERE r.id = analysis_run_id AND a.student_id = auth.uid()));

-- PPA_Findings: same pattern
CREATE POLICY "teachers_manage_findings" ON public.ppa_findings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ppa_analysis_runs r JOIN public.ppa_assessments a ON a.id = r.assessment_id WHERE r.id = analysis_run_id AND a.teacher_id = auth.uid()));

CREATE POLICY "students_view_findings" ON public.ppa_findings
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ppa_analysis_runs r JOIN public.ppa_assessments a ON a.id = r.assessment_id WHERE r.id = analysis_run_id AND a.student_id = auth.uid()));

-- PPA_Clusters: same pattern
CREATE POLICY "teachers_manage_clusters" ON public.ppa_clusters
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ppa_analysis_runs r JOIN public.ppa_assessments a ON a.id = r.assessment_id WHERE r.id = analysis_run_id AND a.teacher_id = auth.uid()));

CREATE POLICY "students_view_clusters" ON public.ppa_clusters
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ppa_analysis_runs r JOIN public.ppa_assessments a ON a.id = r.assessment_id WHERE r.id = analysis_run_id AND a.student_id = auth.uid()));

-- PPA_EngineDecisions: same pattern
CREATE POLICY "teachers_manage_engine_decisions" ON public.ppa_engine_decisions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ppa_analysis_runs r JOIN public.ppa_assessments a ON a.id = r.assessment_id WHERE r.id = analysis_run_id AND a.teacher_id = auth.uid()));

CREATE POLICY "students_view_engine_decisions" ON public.ppa_engine_decisions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ppa_analysis_runs r JOIN public.ppa_assessments a ON a.id = r.assessment_id WHERE r.id = analysis_run_id AND a.student_id = auth.uid()));

-- PPA_ProtocolsLibrary: everyone can read, only teachers can manage
CREATE POLICY "anyone_view_protocols" ON public.ppa_protocols_library
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "teachers_manage_protocols" ON public.ppa_protocols_library
  FOR ALL TO authenticated
  USING (public.is_teacher(auth.uid()))
  WITH CHECK (public.is_teacher(auth.uid()));

-- PPA_PlanLinks: teacher via analysis_run, student read own
CREATE POLICY "teachers_manage_plan_links" ON public.ppa_plan_links
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ppa_analysis_runs r JOIN public.ppa_assessments a ON a.id = r.assessment_id WHERE r.id = analysis_run_id AND a.teacher_id = auth.uid()));

CREATE POLICY "students_view_own_plan_links" ON public.ppa_plan_links
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- PPA_MonitoringLogs: teacher via student relationship, student own
CREATE POLICY "teachers_manage_monitoring" ON public.ppa_monitoring_logs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.students s WHERE s.student_id = ppa_monitoring_logs.student_id AND s.teacher_id = auth.uid()));

CREATE POLICY "students_manage_own_monitoring" ON public.ppa_monitoring_logs
  FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- =====================================================
-- SEED: Protocol Library (9FIT protocols)
-- =====================================================

INSERT INTO public.ppa_protocols_library (protocol_key, category, steps, contraindications) VALUES
('decompression_spinal', 'decompression', '[{"sequence":1,"name":"Descompressão Axial Suspensa","cue":"Pendure-se na barra, relaxe os ombros","sets":3,"reps":1,"tempo":"30s hold"},{"sequence":2,"name":"Cat-Cow Respirado","cue":"Inspire em extensão, expire em flexão","sets":2,"reps":8,"tempo":"3-3-0"}]'::jsonb, '["Hérnia discal aguda","Espondilolistese grau 3+"]'::jsonb),

('decompression_cervical', 'decompression', '[{"sequence":1,"name":"Tração Cervical Manual","cue":"Segure occipital, tracione cefálico","sets":3,"reps":1,"tempo":"20s hold"},{"sequence":2,"name":"Retração Cervical","cue":"Queixo para trás, olhar horizontal","sets":3,"reps":10,"tempo":"2-2-0"}]'::jsonb, '["Instabilidade atlantoaxial","Mielopatia cervical"]'::jsonb),

('stability_core', 'stability', '[{"sequence":1,"name":"Dead Bug","cue":"Lombar colada, mova braço e perna opostos","sets":3,"reps":8,"tempo":"3-1-3"},{"sequence":2,"name":"Bird Dog","cue":"Quadril neutro, estenda braço e perna","sets":3,"reps":8,"tempo":"3-2-3"},{"sequence":3,"name":"Pallof Press","cue":"Resista rotação, pressione à frente","sets":3,"reps":10,"tempo":"2-2-2"}]'::jsonb, '["Dor aguda lombar > 7/10"]'::jsonb),

('stability_scapular', 'stability', '[{"sequence":1,"name":"Retração Escapular Isométrica","cue":"Aperte escápulas, segure","sets":3,"reps":1,"tempo":"15s hold"},{"sequence":2,"name":"Serrátil Wall Slide","cue":"Costas na parede, deslize braços","sets":3,"reps":10,"tempo":"3-1-3"},{"sequence":3,"name":"Prone Y-T-W","cue":"Decúbito ventral, formas Y, T, W","sets":2,"reps":8,"tempo":"2-2-0"}]'::jsonb, '["Lesão aguda do manguito rotador"]'::jsonb),

('wakeup_glute', 'wakeup', '[{"sequence":1,"name":"Clam Shell","cue":"Decúbito lateral, abra joelhos mantendo pés juntos","sets":2,"reps":15,"tempo":"2-1-2"},{"sequence":2,"name":"Glute Bridge","cue":"Apoie pés, eleve quadril, aperte glúteos","sets":3,"reps":12,"tempo":"2-2-2"},{"sequence":3,"name":"Monster Walk","cue":"Mini-band nos joelhos, passos laterais","sets":2,"reps":10,"tempo":"contínuo"}]'::jsonb, '["Impacto femoroacetabular grave"]'::jsonb),

('wakeup_neural', 'wakeup', '[{"sequence":1,"name":"Mobilização Neural MMII","cue":"Decúbito dorsal, flexione quadril 90°, estenda joelho","sets":2,"reps":10,"tempo":"2-1-2"},{"sequence":2,"name":"Cat-Camel Segmentar","cue":"Mobilize segmento por segmento","sets":2,"reps":6,"tempo":"lento"},{"sequence":3,"name":"Diafragma 360","cue":"Inspire expandindo lateral e posterior","sets":3,"reps":5,"tempo":"4-4-6"}]'::jsonb, '["Radiculopatia aguda"]'::jsonb),

('strength_hip_hinge', 'strength_transition', '[{"sequence":1,"name":"RDL com Kettlebell","cue":"Empurre quadril para trás, barra próxima ao corpo","sets":3,"reps":10,"tempo":"3-1-2"},{"sequence":2,"name":"Hip Thrust","cue":"Apoie escápulas no banco, eleve quadril","sets":3,"reps":12,"tempo":"2-2-2"},{"sequence":3,"name":"Good Morning","cue":"Barra nas costas, flexione quadril","sets":3,"reps":8,"tempo":"3-1-2"}]'::jsonb, '["Hérnia discal posterior aguda","Dor lombar > 6/10"]'::jsonb),

('strength_push_pull', 'strength_transition', '[{"sequence":1,"name":"Push-up com Protração","cue":"No topo, empurre escápulas para frente","sets":3,"reps":10,"tempo":"2-1-2"},{"sequence":2,"name":"Row Unilateral","cue":"Cotovelo junto ao corpo, retraia escápula","sets":3,"reps":10,"tempo":"2-1-3"},{"sequence":3,"name":"Overhead Press Sentado","cue":"Core ativo, pressione vertical","sets":3,"reps":8,"tempo":"2-1-2"}]'::jsonb, '["Impingement subacromial agudo","Instabilidade glenoumeral"]'::jsonb);
