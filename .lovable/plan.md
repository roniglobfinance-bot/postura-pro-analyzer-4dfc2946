# Plano: Evolução para "Postura Pro Analyser → Movement Analyser"

## Diagnóstico

1. **Aluno e Professor compartilham UI/funções idênticas** — ambos veem mesmos módulos (Resultados, Sessões, Evolução) sem diferenciação operacional real.
2. **Não há entrega Professor→Aluno** — o que o profissional analisa/prescreve não chega ao aluno como produto consumível (relatório, plano, recomendações).
3. **Sistema só analisa postura estática** — falta análise de movimento, queixas textuais, histórico, composição corporal por foto.
4. **Conhecimento clínico (Dossiê) não está embebido no engine/IA** — padrões 9FIT, Lei dos 0.4cm, Tríade Neuro-Metabólica etc. não alimentam diagnóstico nem treinam o prompt.

---

## Estratégia em 4 Frentes

### Frente A — Separação Operacional Professor vs Aluno

**Professor (operador clínico):**
- Painel: KPIs, fila de avaliações pendentes, alertas red-flag dos alunos
- Workspace: Express Analysis, Wizard completo, Movement Analyser, Editor de Plano, Editor de Relatório
- Entrega: botão "Publicar para Aluno" → grava `report_id` + `plan_id` ativos no `ppa_plan_links`

**Aluno (consumidor da entrega):**
- Painel: card "Seu último relatório" + "Plano ativo da semana" + "Próxima sessão"
- Telas read-only: Relatório (PDF/HTML), Plano (lista exercícios + vídeo demo), Recomendações (texto + checklist 24h/48h)
- Telas interativas: Check-in diário (dor 0-10, TNS, sintomas tardios), marcar sessão concluída
- **Não vê:** Wizard, Express, Editor de Plano, Biblioteca técnica

Componentes novos:
- `src/components/student/StudentReportView.tsx` (consome último `analysis_run` + `engine_decision`)
- `src/components/student/StudentPlanView.tsx` (consome `ppa_plan_links` ativo)
- `src/components/student/StudentRecommendations.tsx` (recomendações nutri + estase + alertas)
- `src/components/student/DailyCheckIn.tsx` (já parcial — expandir com sintomas 24h/48h)
- `src/components/teacher/PublishToStudent.tsx` (botão + modal de revisão antes de publicar)

### Frente B — Movement Analyser (Evolução do Postura Pro)

Renomear conceitualmente e adicionar 4 novos módulos de análise:

1. **Movement Analysis (vídeo de exercício)**
   - Upload de vídeo curto (agachamento, hinge, marcha)
   - MediaPipe Pose por frame → trajetória de keypoints
   - Detecta: valgo dinâmico, shift pélvico, perda de neutralidade lombar, ROM
   - Componente: `src/components/pages/MovementAnalyser.tsx`
   - Service: `src/services/movementAnalysisService.ts` (frame sampling + ângulos articulares no tempo)

2. **Textual Complaint Analyser**
   - Textarea: "Descreva sua dor/limitação"
   - Edge function chama Gemini com prompt clínico do Dossiê → extrai: região, padrão (mecânico/neural/inflamatório), red flags, mapeia para arquétipo 9FIT
   - Componente: `src/components/analyser/ComplaintAnalyser.tsx`
   - Edge: `supabase/functions/analyze-complaint/index.ts`

3. **Historical Trend Analyser**
   - Lê todas as `ppa_assessments` + `ppa_monitoring_logs` do aluno
   - Gemini gera narrativa de evolução: "dor lombar caiu 40%, TNS estável, surge novo padrão de valgo direito"
   - Componente: integrado em `ProgressDashboard.tsx`
   - Edge: `supabase/functions/analyze-history/index.ts`

4. **Body Composition Estimator (foto)**
   - 2 fotos (frente + lado) com calibração por altura
   - Estimativa de % gordura/massa magra via Gemini Vision (heurística visual + tabelas antropométricas)
   - Disclaimer claro: "estimativa visual, não substitui DEXA"
   - Componente: `src/components/analyser/BodyCompositionEstimator.tsx`
   - Edge: `supabase/functions/analyze-body-composition/index.ts`

Reorganização de navegação Professor:
```
Painel | Alunos | Analyser ▾ (Postura | Movimento | Queixa | Composição | Histórico) | Plano | Sessões | Biblioteca
```

### Frente C — Embutir Dossiê de Inteligência no Engine

Atualizar `src/data/knowledgeBase.ts` e `src/services/diagnosticEngine.ts` com os **5 Padrões 9FIT** como regras compostas:

| Padrão | Trigger (flags) | Diagnóstico | Protocolo |
|---|---|---|---|
| **Lei dos 0.4cm** | `pelvic_imbalance >= 0.4cm` + `unilateral_foot_pain` | Cascata ascendente | Bloco A reforçado (Short Foot bilateral assimétrico) |
| **Bloqueio Neural Marcha (Psoas)** | `gait_block` + `lumbar_history` | Freio neural psoas | Dissociação segmentar + IAP |
| **Conflito Posterior** | `lumbar_pain` + `extension_intolerance` | Baastrup/Retrolistese | VETO extensão + bracing |
| **Falha de Interface** | `dynamic_valgus` + `unstable_footwear_context` | Calçado instável | Trocar calçado + stiffness, NÃO alongar |
| **Tríade Neuro-Metabólica** | `nm_edema` + `nm_tingling` + `pain_increase_24h` | Estase + inflamação | SHIELD + drenagem + protocolo desinflamação 48h |

Adicionar novas tabelas/campos:
- `ppa_findings.finding_key` ganha enums: `pelvic_4mm`, `psoas_brake`, `posterior_conflict`, `interface_failure`, `nm_triad`
- Novo serviço `src/services/ninefitPatterns.ts` com função `detectPatterns(findings, metrics, context, painLog) → Pattern[]`

### Frente D — Treinar a IA com o Dossiê

Refatorar prompts dos edge functions (`analyze-posture`, `analyze-report`, novos `analyze-complaint`, `analyze-movement`, `analyze-history`, `analyze-body-composition`) para incluir:

1. **System prompt único compartilhado** em `supabase/functions/_shared/clinical-knowledge.ts`:
   - Filosofia 9FIT
   - 6 categorias do Dossiê (Bioengenharia, Funcional, Nutricional, Neuromecânica, Estase, Casos Longos)
   - 5 Padrões clínicos como exemplos few-shot
   - Casos benchmark (Coluna de Pino, Ruptura+Joanete)

2. **Tool calling estruturado** para cada análise retornar `pattern_match: PatternKey | null` além do diagnóstico narrativo.

3. **Feedback loop**: nova tabela `ai_analysis_feedback` (teacher_id, analysis_run_id, was_accurate boolean, correction_text) — alimenta dataset futuro de fine-tuning.

---

## Banco de Dados (Migration)

```sql
-- Publicação Professor → Aluno
ALTER TABLE ppa_plan_links 
  ADD COLUMN published_at timestamptz,
  ADD COLUMN report_html text,
  ADD COLUMN recommendations jsonb DEFAULT '[]';

-- Análise de movimento
CREATE TABLE ppa_movement_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL,
  exercise_type text NOT NULL,
  video_url text,
  keypoint_trajectory jsonb,
  detected_faults jsonb DEFAULT '[]',
  rom_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Análise de queixas textuais
CREATE TABLE ppa_complaint_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL,
  raw_text text NOT NULL,
  extracted_region text,
  pattern_type text,
  red_flags jsonb DEFAULT '[]',
  ai_interpretation text,
  created_at timestamptz DEFAULT now()
);

-- Composição corporal estimada
CREATE TABLE ppa_body_composition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL,
  front_photo_url text,
  side_photo_url text,
  estimated_body_fat_pct numeric,
  estimated_lean_mass_kg numeric,
  confidence numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Feedback IA
CREATE TABLE ai_analysis_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_run_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  was_accurate boolean,
  correction_text text,
  created_at timestamptz DEFAULT now()
);
```
+ RLS por teacher/student em cada tabela.

---

## Arquivos Tocados

**Novos (~12):**
- `src/components/student/StudentReportView.tsx`
- `src/components/student/StudentPlanView.tsx`
- `src/components/student/StudentRecommendations.tsx`
- `src/components/teacher/PublishToStudent.tsx`
- `src/components/pages/MovementAnalyser.tsx`
- `src/components/analyser/ComplaintAnalyser.tsx`
- `src/components/analyser/BodyCompositionEstimator.tsx`
- `src/services/movementAnalysisService.ts`
- `src/services/ninefitPatterns.ts`
- `supabase/functions/_shared/clinical-knowledge.ts`
- `supabase/functions/analyze-complaint/index.ts`
- `supabase/functions/analyze-movement/index.ts`
- `supabase/functions/analyze-body-composition/index.ts`
- `supabase/functions/analyze-history/index.ts`

**Editados (~10):**
- `src/components/dashboards/StudentDashboard.tsx` — consumir entrega publicada
- `src/components/dashboards/TeacherDashboard.tsx` — botão publicar + KPIs
- `src/components/Navigation.tsx` + `BottomNavigation.tsx` — submenu Analyser
- `src/pages/Index.tsx` — rotas novas
- `src/services/diagnosticEngine.ts` — integrar `ninefitPatterns`
- `src/data/knowledgeBase.ts` — 5 padrões + casos
- `supabase/functions/analyze-report/index.ts` — usar `_shared/clinical-knowledge`
- `supabase/functions/analyze-posture/index.ts` — idem

---

## Sequência de Implementação

1. Migration (tabelas + RLS) + shared clinical-knowledge
2. Frente C: ninefitPatterns + diagnosticEngine atualizado
3. Frente A: separação Professor/Aluno + entrega publicada
4. Frente B: 4 novos analysers (Movement, Complaint, Body Comp, History)
5. Frente D: refatorar todos prompts para usar shared knowledge + feedback loop
6. Navegação reorganizada + smoke test end-to-end
