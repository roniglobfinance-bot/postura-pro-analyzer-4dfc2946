

# Plano: Integrar Checklist Master no Ecossistema 9FIT

## Diagnostico: O que ja existe vs o que falta

| Item do Checklist | Status | Lacuna |
|---|---|---|
| Filosofia "Stiffness > Alongamento" | Parcial | Nao ha logica de Stiffness no engine; falta "Fator Cleiton" |
| Motor Biomecanico | OK | Scanner matricial funciona via diagnosticEngine |
| Motor Neuro-Metabolico | FALTA | Nenhuma logica de edema, inflamacao sistemica, sensibilidade nervosa |
| Smart Periodizer ("Regra 1 Hora") | FALTA | Nenhuma gestao de carga temporal |
| Caso Marilia (LCA + Joanete) | FALTA | Nenhuma regra no knowledgeBase |
| Caso Maria de Lourdes (78a) | FALTA | Nenhuma regra de carga axial ZERO, contraindicacoes por idade |
| Caso Cleiton (Leg Press) | FALTA | Nenhuma regra de interface de calcado |
| Caso Elisa (Bursite) | FALTA | Nenhuma regra de descompressao lateral |
| Casos Julia/Fernanda (Hiperlordose vs Swayback) | FALTA | diagnosticRules nao diferencia os dois |
| HUD Metrics (IEP/EA/PTS/TNS) | OK | Exibidos no ResultsHUD |
| L1-S1 Protegido | FALTA | Nenhum fail-safe no engine |
| ADM de Joelho | FALTA | Nenhuma regra de angulo de seguranca |
| Stop Signs (dor > 3/10) | Parcial | SessionTracker tem pain check, mas engine nao bloqueia |

---

## Implementacao

### 1. Expandir knowledgeBase.ts — Casos Clinicos + Motor Neuro-Metabolico

Adicionar ao `evaluationFlags`:
- Flags neuro-metabolicos: `NM01` (Edema), `NM02` (Formigamento), `NM03` (Inflamacao Sistemica), `NM04` (Sensibilidade Nervosa)
- Flags de contexto: `CTX01` (Calcado Instavel), `CTX02` (Idade > 70), `CTX03` (Retrolistese), `CTX04` (Osteopenia)
- Flags de lesao: `LES01` (Ruptura LCA), `LES02` (Joanete), `LES03` (Bursite)

Adicionar ao `diagnosticRules` (7 novos casos clinicos):
- `DIAG_MARILIA`: LES01 + LES02 + DYN01 → Valgo de fuga, protocolo Short Foot + isometria
- `DIAG_MARIA_LOURDES`: CTX02 + CTX03 + CTX04 + NM01 → Carga axial ZERO, drenagem extremidades
- `DIAG_CLEITON`: CTX01 + DOR03 → Falha de interface, remocao alongamento pre-treino, base rigida
- `DIAG_ELISA`: LES03 + PEP08 → Shift pelvico + bursite, descompressao cadeia fechada
- `DIAG_SWAYBACK`: PEP08 + PEP10 → Swayback (diferenciado de hiperlordose), ativacao core profundo
- `DIAG_HIPERLORDOSE_FUNCIONAL`: PEP07 + PEP09 → Hiperlordose funcional com reposicionamento CG

Adicionar novos `interventionProtocols`:
- `PROTOCOLO_LCA_JOANETE` (Caso Marilia)
- `PROTOCOLO_IDOSO_FRAGIL` (Caso Maria de Lourdes)
- `PROTOCOLO_INTERFACE_SOLO` (Caso Cleiton/Fator Cleiton)
- `PROTOCOLO_DESCOMPRESSAO_LATERAL` (Caso Elisa)
- `PROTOCOLO_SWAYBACK` (diferenciado do PROTOCOLO_ANTEVERSAO)

### 2. Adicionar Fail-Safes ao diagnosticEngine.ts

Criar funcao `applyFailSafes(diagnoses, flags)`:
- **L1-S1 Protegido**: Se flags incluem DOR02/DOR03 + PEP09, bloquear exercicios com flexao lombar sob carga e extensao extrema
- **ADM Joelho**: Se flags incluem DOR04/DOR05 + PEP04/PEP06, restringir angulos a 15-90 graus
- **Stop Signs**: Se dor > 3/10 ou NM02 (formigamento) ou NM01 (edema), forcar modo SHIELD e adicionar alerta "Deload imediato"
- Cada fail-safe retorna `{ blocked_exercises: string[], forced_mode: 'SHIELD' | null, alert: string }`

### 3. Criar Smart Periodizer — Regra de 1 Hora

Novo servico `src/services/smartPeriodizer.ts`:
- Entrada: historico de sessoes (de `ppa_monitoring_logs`), metricas atuais
- Logica: se aluno treinou > 1h sem pausa de movimento, alertar risco de estase e desidratacao discal
- Saida: recomendacao de micro-pausas, ajuste de volume, alerta no SessionTracker
- Integrar no SessionTracker como check pre-sessao adicional

### 4. Motor Neuro-Metabolico no diagnosticEngine.ts

Nova funcao `analyzeNeuroMetabolic(flags)`:
- Cruzar flags de dor (DOR*) com flags neuro-metabolicos (NM*)
- Se edema + dor articular → contraindicar carga direta, prescrever drenagem
- Se formigamento → red flag, recomendacao medica imediata
- Saida integrada ao `generateDiagnosticReport` como campo adicional `neuroMetabolicAlerts`

### 5. Integrar Filosofia "Stiffness > Alongamento" no PlanBuilder

Atualizar `PlanBuilder.tsx`:
- Quando modo = LOAD e guardrail `STABILITY_SHIELD` ativo: priorizar exercicios de estabilidade/stiffness sobre alongamento passivo
- Label visual: "Fator Cleiton: Estabilidade antes de flexibilidade"
- Reordenar blocos de protocolo: Ativacao → Estabilidade → Forca, com alongamento so no final e controlado

### 6. Atualizar Edge Function analyze-report

Adicionar ao system prompt do Gemini:
- Regra filosofica: "Stiffness > Alongamento Passivo" (Fator Cleiton)
- Deteccao de Motor Neuro-Metabolico: edema, formigamento, inflamacao sistemica
- Smart Periodizer: considerar historico de volume/frequencia
- Casos clinicos como exemplos de raciocinio (few-shot)

### 7. Atualizar ResultsHUD — Exibir Fail-Safes e Alertas NM

- Nova secao "Seguranca" na aba de achados com fail-safes ativos (L1-S1, ADM Joelho, Stop Signs)
- Alertas neuro-metabolicos com badge vermelho
- Smart Periodizer: exibir recomendacao de volume na aba Protocolo

---

## Arquivos Afetados

| Arquivo | Acao |
|---|---|
| `src/data/knowledgeBase.ts` | +4 flags NM, +4 flags CTX, +3 flags LES, +6 regras diagnosticas, +5 protocolos |
| `src/services/diagnosticEngine.ts` | +applyFailSafes(), +analyzeNeuroMetabolic(), expandir generateDiagnosticReport |
| `src/services/smartPeriodizer.ts` | NOVO — Regra 1 Hora + gestao de carga |
| `src/components/pages/PlanBuilder.tsx` | Stiffness > Alongamento, Fator Cleiton |
| `src/components/pages/ResultsHUD.tsx` | Secao Seguranca, alertas NM |
| `src/components/pages/SessionTracker.tsx` | Check Smart Periodizer pre-sessao |
| `supabase/functions/analyze-report/index.ts` | Filosofia + casos clinicos no prompt |
| `src/services/flagConversionService.ts` | Mapear findings NM/CTX/LES do Gemini para flags |

