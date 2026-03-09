

# Plano: Expansao Completa do 9FIT Postura Pro Engine v3.2

## Diagnostico do Estado Atual

Apos analise detalhada dos 6 modulos, identifico estas lacunas e inconsistencias criticas:

### Problemas Encontrados

1. **ClientManagement usa dados hardcoded** — nao conecta ao Supabase (profiles/students)
2. **ResultsHUD usa keypoints demo** — AnalyticCanvas recebe `demoKeypoints` estaticos em vez de dados reais do MediaPipe ou da analise
3. **PlanBuilder nao usa protocolos do banco** — blocos obrigatorios sao hardcoded, nao consultam `ppa_protocols_library`
4. **PlanBuilder override nao salva no Supabase** — so atualiza estado local, nao registra em `ppa_engine_decisions`
5. **SessionTracker nao conecta fallback ao PlanBuilder** — quando FAIL, mostra protocolo fixo mas nao atualiza `ppa_plan_links`
6. **Fluxo de navegacao quebrado** — ResultsHUD nao navega para PlanBuilder apos salvar; PlanBuilder nao navega para SessionTracker
7. **Falta historico de avaliacoes** — nenhuma tela lista avaliacoes anteriores de um aluno
8. **analyze-report nao recebe fotos** — edge function so recebe findings/metrics textuais, nao as imagens capturadas
9. **Motor de diagnostico local (diagnosticEngine.ts) desconectado** — knowledgeBase existe mas nao alimenta o fluxo PPA
10. **Falta Camada 6 do dossie** — Feedback e Evolucao (progress tracking com historico IEP/PTS)

---

## Implementacao por Camada (conforme dossie v3.2)

### Camada 1 — Input: Corrigir ClientManagement + AssessmentWizard

**ClientManagement.tsx:**
- Substituir dados hardcoded por query real: `get_teacher_students` + avaliacoes do aluno via `ppa_assessments`
- Adicionar botao "Nova Avaliacao" que navega para AssessmentWizard com aluno pre-selecionado
- Mostrar historico de avaliacoes (status, data, modo operacional) por aluno
- Adicionar campo de questionario funcional (esporte, carga semanal, nivel atividade) conforme dossie

**AssessmentWizard.tsx:**
- Adicionar campos do questionario funcional: esporte, carga semanal, nivel de atividade, historico de lesoes
- Esses campos vao no `context` JSON do `ppa_assessments`

### Camada 2 — Vision Engine: Conectar fotos reais a analise

**MediaCollector.tsx:**
- Apos upload, enviar imagens para `analyze-posture` edge function (ja existe) para extrair keypoints reais
- Salvar keypoints extraidos em `ppa_metrics` (key: `keypoint_*`)

**ResultsHUD.tsx:**
- Substituir `demoKeypoints` por keypoints reais carregados de `ppa_metrics` ou do resultado do `analyze-posture`
- Passar foto real do aluno (ja carrega `photoUrl`) + keypoints reais ao `AnalyticCanvas`

### Camada 3 — Interpretacao Biomecanica: Integrar Motor Local

**ResultsHUD.tsx:**
- Apos receber AI report, rodar `diagnosticEngine.analyzeDiagnosis()` com os findings convertidos para flags do knowledgeBase
- Criar servico `flagConversionService` aprimorado que mapeia findings do Gemini para flags 9FIT (PEP01, DYN01, etc.)
- Exibir diagnosticos do motor local junto com o report do Gemini na aba "Achados"
- GPS Postural: exibir mapeamento `retrope_valgo`, `pelvic_drift`, `valgo_dinamico` derivado dos metrics

### Camada 4 — Decision Engine: Completar PlanBuilder

**PlanBuilder.tsx:**
- Carregar protocolos reais de `ppa_protocols_library` em vez de blocos hardcoded
- Filtrar protocolos por categoria conforme guardrails ativos (ex: se DECOMPRESSION_LOGIC ativo, mostrar protocolos `decompression`)
- Override salva em `ppa_engine_decisions` com `decided_by: 'coach'` e justificativa no `final_decision`
- Apos publicar, navegar para SessionTracker
- Receber `onNavigate` prop

### Camada 5 — Protocolo de Intervencao: Conectar SessionTracker ao Plano

**SessionTracker.tsx:**
- Carregar plano ativo do aluno de `ppa_plan_links` + protocolos associados
- Quando FAIL: criar nova `ppa_engine_decisions` com macro_state `EXECUTION_INTEGRITY` e atualizar `ppa_plan_links` para fallback Shield
- Exibir protocolos do plano ativo durante a sessao
- Receber `onNavigate` prop

### Camada 6 — Feedback e Evolucao: Nova pagina de Historico

**Criar `src/components/pages/ProgressDashboard.tsx`:**
- Graficos de evolucao temporal: IEP, PTS, EA, TNS ao longo das avaliacoes
- Historico de `ppa_monitoring_logs` com delta de dor
- Comparacao before/after de metricas
- Lista de avaliacoes anteriores com status e modo operacional
- Usar recharts (ja instalado)

**Adicionar na navegacao como 7a area: "Evolucao"**

### Fluxo de Navegacao End-to-End

Corrigir a cadeia de navegacao completa:

```text
Alunos -> Nova Avaliacao (Wizard)
  -> Coleta de Midia (MediaCollector)
    -> Resultados (ResultsHUD) [analisa com Gemini + motor local]
      -> Plano (PlanBuilder) [publica Load/Shield]
        -> Sessao (SessionTracker) [executa e registra]
          -> Evolucao (ProgressDashboard) [historico]
```

Cada pagina tera botao de avancar para a proxima etapa.

### Atualizacoes na Edge Function

**analyze-report/index.ts:**
- Adicionar campo `biomech_gps` no tool schema para retornar mapeamento GPS (retrope_valgo, pelvic_drift, etc.)
- Adicionar campo `intervention_blocks` com estrutura A/B/C do dossie (Interface Solo, Quadril, Progressao de Carga)
- Adicionar sistema de alertas (red flags: falseio de joelho, dor aguda, edema, formigamento)

---

## Resumo de Arquivos Afetados

| Arquivo | Acao |
|---------|------|
| `ClientManagement.tsx` | Conectar Supabase, historico avaliacoes |
| `AssessmentWizard.tsx` | Adicionar questionario funcional |
| `MediaCollector.tsx` | Chamar analyze-posture apos upload |
| `ResultsHUD.tsx` | Keypoints reais, motor diagnostico local, GPS postural |
| `PlanBuilder.tsx` | Protocolos do banco, override persistido, navegacao |
| `SessionTracker.tsx` | Plano ativo, fallback persistido, navegacao |
| `ProgressDashboard.tsx` | NOVO — evolucao temporal |
| `Navigation.tsx` | Adicionar "Evolucao" |
| `BottomNavigation.tsx` | Adicionar "Evolucao" |
| `Index.tsx` | Rota para ProgressDashboard |
| `analyze-report/index.ts` | GPS postural, blocos intervencao, red flags |
| `ActiveAssessmentContext.tsx` | Sem alteracao necessaria |

---

## Sequencia de Implementacao

1. ClientManagement conectado ao Supabase + historico
2. AssessmentWizard com questionario funcional expandido
3. ResultsHUD com keypoints reais + motor diagnostico + GPS
4. PlanBuilder com protocolos do banco + override persistido
5. SessionTracker com plano ativo + fallback persistido
6. ProgressDashboard (nova pagina de evolucao)
7. Edge function atualizada com GPS + blocos + red flags
8. Navegacao end-to-end conectada

