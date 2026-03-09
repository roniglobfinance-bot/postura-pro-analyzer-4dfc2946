
# Plano: Reestruturação Completa do Postura Pro Analyzer

## Visao Geral

Reestruturar o sistema em 4 pacotes conforme o dossie tecnico, criando 10 novas tabelas no Supabase, 6 paginas/areas no menu, workflows automatizados e sistema de permissoes.

---

## Pacote 1 -- Dados (Supabase Migration)

### 1.1 Criar 10 novas tabelas via migracao SQL

```text
PPA_Assessments
  - id (uuid PK)
  - student_id (uuid FK -> profiles)
  - teacher_id (uuid FK -> profiles)
  - context (jsonb): calcado, superficie, objetivo, ambiente
  - pain (jsonb): regiao, intensidade, gatilhos
  - status (text): novo / em_coleta / analisando / pronto / precisa_midia
  - created_at, updated_at

PPA_MediaAssets
  - id (uuid PK)
  - assessment_id (uuid FK -> PPA_Assessments)
  - type (text): foto / video
  - view (text): frente / lado / costas / marcha / agachamento / stepdown
  - side (text): E / D / NA
  - image_url (text) -- referencia ao Storage
  - qa_status (text): pass / partial / fail
  - qa_reasons (jsonb)
  - capture_confidence (numeric 0-1)
  - created_at

PPA_AnalysisRuns
  - id (uuid PK)
  - assessment_id (uuid FK -> PPA_Assessments)
  - model_version (text)
  - status (text): rascunho / processando / pronto / precisa_midia / bloqueado
  - confidence_final (numeric 0-1)
  - dominant_vector (jsonb)
  - created_at

PPA_Metrics
  - id (uuid PK)
  - analysis_run_id (uuid FK -> PPA_AnalysisRuns)
  - key (text)
  - value (numeric)
  - unit (text)
  - threshold_ref (numeric)
  - severity (integer 0-3)
  - confidence (numeric 0-1)

PPA_Findings
  - id (uuid PK)
  - analysis_run_id (uuid FK -> PPA_AnalysisRuns)
  - finding_key (text)
  - direction (text): medial / lateral / anterior / posterior
  - severity (integer 0-3)
  - confidence (numeric 0-1)
  - chain (jsonb): upstream / downstream

PPA_Clusters
  - id (uuid PK)
  - analysis_run_id (uuid FK -> PPA_AnalysisRuns)
  - cluster_types (jsonb)
  - score (integer 0-100)
  - rationale (jsonb)

PPA_EngineDecisions
  - id (uuid PK)
  - analysis_run_id (uuid FK -> PPA_AnalysisRuns)
  - macro_state (text): MAPPING_GPS / LOAD_OR_SHIELD / EXECUTION_INTEGRITY
  - micro_states (jsonb)
  - final_decision (jsonb): mode, justifications
  - risk_level (text): baixo / moderado / alto
  - decided_by (text): auto / coach
  - created_at

PPA_ProtocolsLibrary
  - id (uuid PK)
  - protocol_key (text unique)
  - category (text): decompression / stability / wakeup / strength_transition
  - steps (jsonb): sequencia, cue, series, reps, tempo
  - contraindications (jsonb)
  - version (integer)
  - created_at

PPA_PlanLinks
  - id (uuid PK)
  - student_id (uuid FK -> profiles)
  - analysis_run_id (uuid FK -> PPA_AnalysisRuns)
  - periodizer_plan_id (text nullable)
  - smart_treino_plan_id (text nullable)
  - active (boolean)
  - created_at

PPA_MonitoringLogs
  - id (uuid PK)
  - student_id (uuid FK -> profiles)
  - session_id (text nullable)
  - tns (integer 0-100)
  - pain_delta (jsonb)
  - integrity_result (text): pass / watch / fail
  - notes (text)
  - created_at
```

### 1.2 RLS Policies

- Todas as tabelas com RLS habilitado
- Coach/teacher: CRUD completo em avaliacoes dos seus alunos
- Student: leitura das proprias avaliacoes e envio de midia
- Usar funcao `is_teacher()` existente para verificar permissoes

### 1.3 Seed da Biblioteca de Protocolos

- Inserir protocolos do dossie 9FIT (descompressao, estabilidade, wakeup, forca) na tabela PPA_ProtocolsLibrary

---

## Pacote 2 -- UI (6 Paginas + Componentes)

### 2.1 Reestruturar Navegacao

Atualizar `Navigation.tsx` e `BottomNavigation.tsx` com 6 areas:

1. **Alunos** -- Gerenciamento de alunos (existente, refatorar)
2. **Avaliacoes** -- Nova avaliacao com contexto/dor/checklist de captura
3. **Resultados** -- Scanner + HUD (AnalysisHUD, RiskGauges, Findings)
4. **Plano** -- Load/Shield com guardrails
5. **Sessoes** -- Execucao e integridade
6. **Biblioteca** -- Protocolos de exercicios

### 2.2 Pagina: Nova Avaliacao (`AssessmentWizard.tsx`)

- Seletor de aluno (da tabela profiles/students)
- Form contexto: calcado, superficie, objetivo, ambiente
- Form dor: regiao, intensidade, gatilho
- Checklist de captura (cards para cada view obrigatoria)
- Estados: novo -> em_coleta -> QA pendente -> pronto para analise -> precisa midia
- Microestados: LOW_LIGHT, BAD_FRAMING, OCCLUSION_DETECTED
- Salva em PPA_Assessments

### 2.3 Pagina: Coleta de Midia (`MediaCollector.tsx`)

- Stepper: Frente -> Lado D -> Costas -> Lado E -> (dinamicos)
- Upload com validacao QA (checkboxes: pes visiveis, coluna inteira, plano reto)
- Badge pass/partial/fail por view
- Integrar SmartPhotoCollector existente
- Salva em PPA_MediaAssets

### 2.4 Pagina: Resultados (`ResultsHUD.tsx`)

- Integrar componentes existentes: AnalysisHUD, RiskGauges, HeatmapOverlay, AnalyticCanvas
- Lista de findings com severidade e confianca
- Cards HUD: IEP, EA, PTS, TNS
- Linha do tempo do motor: MAPPING_GPS -> LOAD_OR_SHIELD -> EXECUTION_INTEGRITY
- Botoes: Gerar Plano Automatico, Revisar Manualmente, Solicitar Nova Midia
- Estados: Processando, Pronto, Baixa confianca, Conflitante, Precisa midia

### 2.5 Pagina: Plano Load/Shield (`PlanBuilder.tsx`)

- Selector modo: LOAD / SHIELD / MIXED (default do motor)
- Blocos obrigatorios: Wakeup neural, Descompressao, Escudo de estabilidade
- Lista protocolos sugeridos da PPA_ProtocolsLibrary
- Override do coach (campo justificativa obrigatorio)
- Guardrails: SHOE_INSTABILITY_CHECK, DECOMPRESSION_LOGIC, STABILITY_SHIELD, NEUROMUSCULAR_WAKEUP
- Salva em PPA_PlanLinks + PPA_EngineDecisions

### 2.6 Pagina: Sessoes (`SessionTracker.tsx`)

- Checklist pre-sessao: dor hoje (0-10), dormiu bem, calcado ok
- Botoes rapidos: Dor subiu, Tremor, Instavel, Ok
- Slider TNS (0-100)
- Finalizar sessao -> gera PPA_MonitoringLogs
- Microestados: PAIN_SPIKE_ABORT, TREMOR_ESCAPE_RISK, TECH_BREAKDOWN
- Fallback automatico para Shield

### 2.7 Pagina: Biblioteca (`ProtocolLibrary.tsx`)

- Filtros por categoria / regiao / objetivo
- Cards de protocolos com detalhes
- Botao "Adicionar ao plano"
- Dados da PPA_ProtocolsLibrary

### 2.8 Atualizar Index.tsx

- Adicionar rotas para as 6 novas paginas
- Manter componentes existentes como sub-modulos onde aplicavel

---

## Pacote 3 -- Workflows (Logica de Negocio)

### 3.1 Workflow: Criar Avaliacao

- Ao submeter form -> INSERT em PPA_Assessments com status `em_coleta`
- Gerar checklist de views obrigatorias na UI

### 3.2 Workflow: Upload de Midia

- INSERT em PPA_MediaAssets
- Validacao QA client-side (checkboxes + regras simples)
- Se views minimas com PASS -> liberar botao "Analisar"

### 3.3 Workflow: Analisar

- INSERT PPA_AnalysisRuns com status `processando`
- Chamar MediaPipe + edge function Gemini (existentes)
- INSERT metricas em PPA_Metrics
- INSERT findings em PPA_Findings
- INSERT clusters em PPA_Clusters
- Calcular confidence_final
- Atualizar status para `pronto` ou `precisa_midia`

### 3.4 Workflow: Decisao do Motor

- INSERT PPA_EngineDecisions para cada macro_state
- Aplicar guardrails (SHOE_INSTABILITY_CHECK, etc.)
- Se LOW_CONFIDENCE -> bloquear plano automatico

### 3.5 Workflow: Publicar Plano

- INSERT PPA_PlanLinks ativo
- Registrar decisao em PPA_EngineDecisions

### 3.6 Workflow: Finalizar Sessao

- INSERT PPA_MonitoringLogs
- INSERT PPA_EngineDecisions para EXECUTION_INTEGRITY
- Se FAIL -> atualizar plano para fallback Shield

---

## Pacote 4 -- Seguranca e Auditoria

### 4.1 RLS em todas as novas tabelas

- Teacher: acesso completo aos dados dos seus alunos
- Student: leitura propria + envio de midia
- Usar funcoes existentes `is_teacher()`, `is_student()`

### 4.2 Log de Decisoes

- PPA_EngineDecisions registra TODAS as decisoes com timestamp e autor
- Override do coach requer justificativa (campo obrigatorio)

### 4.3 Observacao sobre Autenticacao

- O sistema ja tem auth configurado com profiles e roles
- As novas tabelas seguem o mesmo padrao de teacher_id/student_id
- RLS garante isolamento de dados entre coaches

---

## Sequencia de Implementacao

1. **Migracao SQL**: Criar todas as 10 tabelas + RLS + seed de protocolos
2. **Navegacao**: Atualizar menu com 6 areas
3. **Paginas core**: AssessmentWizard + MediaCollector (fluxo de entrada)
4. **Resultados**: ResultsHUD integrando componentes existentes
5. **Plano + Sessoes**: PlanBuilder + SessionTracker
6. **Biblioteca**: ProtocolLibrary
7. **Workflows**: Conectar logica de estados e microestados

---

## Notas Tecnicas

- Reutilizar componentes existentes: SmartPhotoCollector, AnalysisHUD, RiskGauges, HeatmapOverlay, AnalyticCanvas, DiagnosticResults, ProtocolViewer
- IntegratedAssessment atual sera refatorado e distribuido entre as novas paginas
- AssessmentContext sera expandido para suportar o novo fluxo de dados
- Edge function `analyze-posture` continua como motor de IA remoto
- Todas as imagens armazenadas no Supabase Storage (bucket `photos` existente)
- Nenhuma dependencia nova necessaria
