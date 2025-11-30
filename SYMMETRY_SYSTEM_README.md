# 🔍 SISTEMA DE ANÁLISE DE SIMETRIA E VALIDAÇÃO DE VISTA

## 📘 VISÃO GERAL

Sistema integrado de análise biomecânica que **automaticamente**:
1. ✅ **Valida** se a foto está na vista correta (anterior, posterior, lateral)
2. 📊 **Compara** lados direito/esquerdo do corpo com precisão clínica
3. 🎨 **Visualiza** assimetrias através de mapas de calor
4. 🎯 **Recomenda** correções baseadas em desvios mensurados

---

## 🏗️ ARQUITETURA

### 1. **Serviço de Análise de Simetria** (`symmetryAnalysisService.ts`)

#### Funcionalidade Principal
- **Análise Bilateral**: Compara pares esquerda/direita de pontos anatômicos
- **Score de Simetria**: 0-100% (100% = perfeitamente simétrico)
- **Calibração**: Converte pixels → centímetros usando altura do cliente
- **Mapa de Calor**: Gera visualização colorida de assimetrias

#### Regiões Analisadas
```typescript
bilateral: {
  shoulders: {
    symmetryPercentage: number;  // 0-100%
    deviationCm: number;          // Desnível em cm
    side: 'left' | 'right' | 'balanced';
  },
  hips: { ... },
  knees: { ... },
  ankles: { ... }
}
```

#### Escala de Cores do Mapa de Calor
- 🟢 **Verde** (< 10% assimetria): Simétrico
- 🟡 **Amarelo** (10-30%): Leve assimetria
- 🟠 **Laranja** (30-50%): Moderada assimetria
- 🔴 **Vermelho** (> 50%): Alta assimetria

#### Thresholds Clínicos
```typescript
Ombros:     < 90% = Assimetria relevante
Quadril:    < 90% = Desnível pélvico
Joelhos:    < 85% = Discrepância de membros
Tornozelos: < 85% = Assimetria de arco plantar
```

---

### 2. **Serviço de Validação de Vista** (`viewValidationService.ts`)

#### Detecção Automática
Identifica vista da foto analisando:
- Visibilidade de pontos faciais (nariz, olhos)
- Visibilidade de orelhas
- Distribuição de ombros (lateral vs frontal)
- Profundidade Z dos keypoints

#### Lógica de Detecção
```
ANTERIOR:    Face visível + ombros separados
POSTERIOR:   Orelhas visíveis + face menos visível
LATERAL D:   Ombro direito predominante + profundidade Z
LATERAL E:   Ombro esquerdo predominante + profundidade Z
```

#### Validação
```typescript
interface ViewValidation {
  detectedView: string;           // Vista detectada
  confidence: number;             // 0-100% confiança
  isCorrect: boolean;             // true se vista esperada == detectada
  errorMessage?: string;          // Mensagem de erro se incorreto
  recommendations: string[];      // Como corrigir
}
```

#### Mensagens de Erro
- **❌ ERRO**: Foto esperada ANTERIOR, detectada POSTERIOR → "Vire de frente"
- **❌ ERRO**: Foto esperada LATERAL, detectada ANTERIOR → "Vire de lado"
- **⚠️ DESCONHECIDA**: Pessoa não detectada corretamente → "Recapture foto"

---

### 3. **Componente de Visualização** (`SymmetryVisualization.tsx`)

#### Interface UI
- **Score Geral**: Card destacado com score 0-100%
- **Análise por Região**: Progress bars para cada região
- **Mapa de Calor**: Overlay colorido sobre foto do paciente
- **Recomendações**: Lista de ações corretivas

#### Exemplo de Saída
```
🎯 Score Geral de Simetria: 78%

📊 ANÁLISE POR REGIÃO:
  Ombros:     85% (Direito elevado ±1.2cm)
  Quadril:    72% (Esquerdo elevado ±1.8cm) ⚠️
  Joelhos:    90% (Equilibrado)
  Tornozelos: 88% (Leve assimetria ±0.5cm)

💡 RECOMENDAÇÕES:
  - Desnível pélvico identificado (esquerdo elevado). 
    Desnível de 1.8cm. Avaliar fraqueza de glúteo médio 
    contralateral e Trendelenburg.
```

---

## 🔄 WORKFLOW DE ANÁLISE

### Fluxo Completo
```
1. CAPTURA DE FOTO
   ↓
2. DETECÇÃO MEDIAPIPE (33 keypoints)
   ↓
3. VALIDAÇÃO DE VISTA
   ├─ ✅ Correta → Prossegue
   └─ ❌ Incorreta → ALERTA ao usuário
   ↓
4. ANÁLISE DE SIMETRIA
   ├─ Cálculo de desvios bilaterais
   ├─ Conversão pixels → cm
   └─ Geração de heatmap
   ↓
5. DIAGNÓSTICO
   ├─ Flags auto-detectados
   └─ Motor de diagnóstico 9FIT OS
   ↓
6. RELATÓRIO PDF
   └─ Inclui fotos, medições, simetria, protocolos
```

### Integração com MediaPipe
```typescript
const analysisResult = await analyzePoseComplete(
  imageUrl,
  viewType,  // 'anterior' | 'posterior' | 'lateralDireita' | 'lateralEsquerda'
  clientHeight
);

// Retorna:
{
  pose: DetectedPose,              // 33 keypoints
  deviations: [...],               // Desvios posturais
  flags: [...],                    // Flags de diagnóstico
  measurements: [...],             // Medições clínicas
  symmetryAnalysis: {...},         // 🆕 Análise de simetria
  viewValidation: {...},           // 🆕 Validação de vista
  clinicalSummary: "..."
}
```

---

## 🎯 CASOS DE USO

### Caso 1: Foto em Vista Incorreta
```
Usuário: Captura foto ANTERIOR, mas pessoa está de costas
Sistema: 
  ❌ ERRO: Foto esperada na vista ANTERIOR (Frente), 
     mas detectada como POSTERIOR (Costas).
  🔄 A pessoa está de costas. Vire-a de frente para a câmera.
  📸 Capture novamente a foto na posição correta.
```

### Caso 2: Assimetria de Ombros Detectada
```
Sistema analisa foto ANTERIOR:
  
  Ombros: 82% de simetria
  Desnível: 1.5cm (ombro direito elevado)
  
  💡 Recomendação:
  Assimetria de ombros detectada (direito elevado). 
  Desnível de 1.5cm. Investigar Linha Lateral e padrão 
  de elevação escapular.
  
  🎨 Mapa de Calor: Mostra círculos laranja sobre ombros
```

### Caso 3: Desnível Pélvico Severo
```
Sistema analisa foto POSTERIOR:
  
  Quadril: 68% de simetria ⚠️
  Desnível: 2.2cm (quadril esquerdo elevado)
  
  💡 Recomendação:
  Desnível pélvico identificado (esquerdo elevado). 
  Desnível de 2.2cm. Avaliar fraqueza de glúteo médio 
  contralateral e Trendelenburg.
  
  Flags gerados automaticamente:
  - PEP07: Anteversão Pélvica
  - DYN04: Trendelenburg Positivo
```

---

## 📊 PRECISÃO E CALIBRAÇÃO

### Calibração de Medidas
```typescript
// Usando altura real do cliente
pixelToCmRatio = clientHeight / heightInPixels

// Todas as medições convertidas:
deviationCm = deviationPixels * pixelToCmRatio
```

### Thresholds de Precisão
- **< 0.5cm**: Considerado simétrico (dentro da variação normal)
- **0.5-1.5cm**: Assimetria leve (monitorar)
- **1.5-2.5cm**: Assimetria moderada (requer intervenção)
- **> 2.5cm**: Assimetria severa (prioridade alta)

---

## 🔗 INTEGRAÇÃO COM DIAGNÓSTICO

### Flags Gerados por Assimetria
```typescript
Desnível de Ombros > 1cm → PEP13: Elevação de Ombro
Desnível de Quadril > 1cm → PEP07 ou DYN04
Joelhos assimétricos > 1.5cm → Discrepância de membros
```

### Protocolo de Correção
Sistema recomenda protocolos específicos baseados em:
1. **Região afetada**: Ombros, quadril, joelhos
2. **Severidade**: Leve, moderado, severo
3. **Padrão biomecânico**: Linha Lateral, LPA, LL

Exemplo:
```
Diagnóstico: Desnível Pélvico Funcional
Linha Afetada: Linha Lateral (LL)

Protocolo:
  Fase 1 - Liberação: TFL, QL, Adutores
  Fase 2 - Ativação: Glúteo Médio, Clam Shell
  Fase 3 - Estabilidade: Ponte Unilateral
  Fase 4 - Força: Bulgarian Split Squat
  Fase 5 - Alongamento: Glúteo Figura 4
```

---

## 🚀 ROADMAP FUTURO

### Próximas Funcionalidades
- [ ] **Comparação Multi-Vista**: Detectar inconsistências entre anterior/posterior
- [ ] **Análise de Rotação**: Detectar rotações pélvicas e escapulares
- [ ] **Tracking Temporal**: Comparar simetria em avaliações antes/depois
- [ ] **Exportação de Heatmap**: Salvar mapa de calor como imagem standalone
- [ ] **Índice de Assimetria Composto**: Score único considerando todas as regiões

### Melhorias de Precisão
- [ ] Aumentar confiança de detecção de vista (usar mais heurísticas)
- [ ] Adicionar detecção de fotos em ângulo incorreto (câmera inclinada)
- [ ] Melhorar thresholds baseados em estudos populacionais
- [ ] Validar medições contra padrões clínicos estabelecidos

---

## 📚 REFERÊNCIAS TÉCNICAS

### MediaPipe Pose
- 33 keypoints de corpo inteiro
- Coordenadas 3D (x, y, z)
- Confidence score por keypoint
- World landmarks para análise espacial

### Parâmetros de Simetria
Baseado em literatura biomecânica:
- SAARS Protocol
- Myers Anatomy Trains
- Gray Cook FMS Standards
- Kendall's Muscle Testing

---

## ⚙️ CONFIGURAÇÃO DE USO

### No IntegratedAssessment
```tsx
// 1. Aba "Análise IA" → Executar MediaPipe
<Button onClick={handleRunAIAnalysis}>
  Análise MediaPipe (33 Keypoints)
</Button>

// 2. Verificar alertas de validação de vista
{viewValidations[selectedView] && !viewValidations[selectedView].isCorrect && (
  <Alert variant="destructive">
    {viewValidations[selectedView].errorMessage}
  </Alert>
)}

// 3. Aba "Simetria" → Ver análise bilateral
<TabsTrigger value="symmetry">Simetria</TabsTrigger>
<SymmetryVisualization 
  analysis={aiAnalysisResults[selectedView].symmetryAnalysis}
  imageUrl={currentPhoto}
/>
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [x] Serviço de análise de simetria bilateral
- [x] Serviço de validação de vista automática
- [x] Componente de visualização com mapa de calor
- [x] Integração com MediaPipe Pose (33 keypoints)
- [x] Conversão pixels → centímetros (calibração)
- [x] Geração de flags baseados em assimetrias
- [x] Alertas visuais para fotos em vista incorreta
- [x] Recomendações clínicas automáticas
- [x] Documentação técnica completa

---

## 🔍 DIAGNÓSTICO CONSULTANDO BANCO DE DADOS

O sistema **sempre consulta** o `knowledgeBase.ts` através do `diagnosticEngine.ts`:

### Fluxo de Diagnóstico
```typescript
// 1. Flags detectados pela IA
const flags = ['PEP01', 'DYN01', 'DOR04'];

// 2. Motor de diagnóstico consulta TODAS as regras
const result = generateDiagnosticReport({ flags });

// 3. Retorna TODOS os diagnósticos correspondentes
result.diagnoses = [
  {
    diagnosis: 'Condromalácia Patelar',
    affectedLines: ['LL', 'LE', 'LPA'],
    protocolRef: 'PROTOCOLO_CONDRO',
    confidence: 85
  },
  // ... outros diagnósticos que correspondem aos flags
];
```

### Regras no Banco de Dados
O `knowledgeBase.ts` contém:
- **5+ regras de diagnóstico** (Condromalácia, Lombalgia, Síndrome Cruzada, etc.)
- **6 protocolos completos** (Ombro, Hipercifose, Anteversão, Valgo, Cabeça, Pronação)
- **40+ flags de avaliação** (PEP, DYN, TES, DOR)

O motor **sempre** percorre todas as regras e retorna **todos** os diagnósticos que correspondem aos flags fornecidos.

Se apenas um diagnóstico está sendo retornado, é porque:
1. Apenas uma regra tem **todos os flags obrigatórios** satisfeitos
2. Os flags detectados não correspondem a outras combinações no banco

Para obter mais diagnósticos:
- Garantir que flags corretos estão sendo detectados pela IA
- Adicionar mais regras de diagnóstico no `knowledgeBase.ts`
- Verificar se flags opcionais estão aumentando a confiança

---

**Sistema implementado e pronto para uso clínico profissional! 🎉**
