# Sistema de Avaliação Postural Integrado

## Visão Geral

O sistema foi completamente refatorado para eliminar redundâncias e criar uma experiência unificada de avaliação postural. Todos os módulos agora compartilham dados através de um contexto global, permitindo análises integradas e diagnósticos mais precisos.

## Arquitetura da Integração

### 1. Contexto Global (`AssessmentContext`)

**Localização:** `src/contexts/AssessmentContext.tsx`

Gerencia todos os dados compartilhados entre módulos:

```typescript
interface SharedAssessmentData {
  clientData: {
    fullName: string;
    age: number;
    height: number;
    weight: number;
  };
  
  photos: {
    anterior?: string;
    posterior?: string;
    lateralDireita?: string;
    lateralEsquerda?: string;
  };
  
  anatomicalPoints: Record<string, AnatomicalPoint[]>;
  measurements: PosturalMeasurement[];
  diagnosticFlags: DiagnosticFlag[];
  
  aiAnalysis: {
    skeletonDetection?: any;
    angleAnalysis?: any;
    myofascialLines?: any;
  };
  
  diagnosis?: {
    diagnoses: any[];
    protocols: any[];
    summary: string;
  };
}
```

### 2. Componente Principal (`IntegratedAssessment`)

**Localização:** `src/components/IntegratedAssessment.tsx`

Unifica todos os módulos em uma interface coesa com 5 abas:

1. **Cliente** - Dados básicos do paciente
2. **Fotos** - Captura com simetrógrafo virtual
3. **Análise IA** - Skeleton, ângulos, 3D miofascial
4. **Flags** - Seleção de flags de avaliação
5. **Diagnóstico** - Resultados e protocolos

### 3. Simetrógrafo Virtual (`Simetrografo`)

**Localização:** `src/components/analysis/Simetrografo.tsx`

#### Funcionalidades Implementadas

##### A. Sobreposição de Grade
- Grade quadriculada digital sobreposta à imagem
- Controle de opacidade (0-100%)
- Importada de `src/assets/simetrografo-grid.png`

##### B. Fio de Prumo Virtual
- Linha vertical de referência
- Ajuste de posição horizontal (0-100%)
- Toggle para mostrar/ocultar
- Essencial para calibração e verificação de simetria

##### C. Marcação de Pontos Anatômicos
Pontos predefinidos por vista:

**Vista Anterior:**
- Topo da Cabeça
- Acrômio D/E
- EIAS D/E
- Patela D/E
- Maléolo Lateral D/E

**Vista Posterior:**
- Topo da Cabeça
- Acrômio D/E
- EIPS D/E
- Prega Glútea D/E
- Calcâneo D/E

**Vistas Laterais:**
- Meato Auditivo
- Acrômio
- Trocânter Maior
- Linha Articular Joelho
- Maléolo Lateral

##### D. Medições Automáticas
- Distâncias entre pontos marcados
- Detecção de desníveis (ex: ombros)
- Cálculo de ângulos posturais
- Armazenamento no contexto global

##### E. Controles de Visualização
- Zoom (0.5x - 3x)
- Pan/arrasto da imagem
- Precisão na marcação de pontos

## Fluxo de Trabalho Integrado

### Etapa 1: Cadastro do Cliente
```
IntegratedAssessment (Aba "Cliente")
  ↓
updateClientData()
  ↓
AssessmentContext (data.clientData)
```

### Etapa 2: Captura de Fotos
```
IntegratedAssessment (Aba "Fotos")
  ↓
Seleção de vista (anterior/posterior/lateral)
  ↓
Upload de foto
  ↓
Simetrógrafo ativado
  ↓
Marcação de pontos anatômicos
  ↓
Medições automáticas calculadas
  ↓
updatePhoto() + addAnatomicalPoints() + addMeasurement()
  ↓
AssessmentContext (data.photos, data.anatomicalPoints, data.measurements)
```

### Etapa 3: Análises de IA
```
IntegratedAssessment (Aba "Análise IA")
  ↓
SkeletonDetection / DynamicAngleAnalysis / Myofascial3DVisualization
  ↓
Análise da foto atual (data.photos[selectedView])
  ↓
Detecção automática de desvios posturais
  ↓
Conversão automática para flags de diagnóstico
  ↓
addDiagnosticFlag()
  ↓
AssessmentContext (data.diagnosticFlags, data.aiAnalysis)
```

### Etapa 4: Seleção/Confirmação de Flags
```
IntegratedAssessment (Aba "Flags")
  ↓
FlagSelector
  ↓
Flags auto-detectados + flags manuais
  ↓
Confirmação pelo profissional
  ↓
Botão "Processar Diagnóstico"
```

### Etapa 5: Diagnóstico e Protocolos
```
generateDiagnosticReport({ flags })
  ↓
Motor de Diagnóstico processa flags
  ↓
Consulta base de conhecimento
  ↓
Retorna diagnósticos + protocolos
  ↓
setDiagnosis()
  ↓
AssessmentContext (data.diagnosis)
  ↓
IntegratedAssessment (Aba "Diagnóstico")
  ↓
DiagnosticResults + ProtocolViewer
```

## Vetores de Integração

### 1. Motor de Diagnóstico como Vetor de Conhecimento

O motor de diagnóstico não é apenas um módulo isolado - ele é o **cérebro** que alimenta toda a IA:

```
Base de Conhecimento (knowledgeBase.ts)
  ↓
Fundamentos Miofasciais + Regras de Diagnóstico
  ↓
Motor de Diagnóstico (diagnosticEngine.ts)
  ↓
Alimenta análises de IA com contexto biomecânico
  ↓
SkeletonDetection usa regras para identificar disfunções
DynamicAngleAnalysis aplica limites de referência
Myofascial3D visualiza linhas afetadas
```

### 2. Análises de IA Alimentam Motor de Diagnóstico

Ciclo bidirecional de informação:

```
Foto → Análise IA → Flags detectados → Motor de Diagnóstico
                        ↓
                  Diagnóstico confirmado
                        ↓
                  Protocolo gerado
                        ↓
            Feedback para próximas análises
```

### 3. Simetrógrafo como Fonte de Dados Objetivos

```
Marcação manual de pontos
  ↓
Cálculos objetivos de distâncias/ângulos
  ↓
Conversão automática para flags
  ↓
Ex: "Desnível de ombros > 10px" → Flag "PEP02" (Ombro Desnivelado)
```

## Eliminação de Redundâncias

### Antes da Refatoração
- ❌ PosturalAssessment (avaliação manual)
- ❌ PhotoDocumentation (fotos + medições)
- ❌ AdvancedPosturalAnalysis (análises de IA)
- ❌ DiagnosticEngine (diagnóstico isolado)
- ❌ 4 módulos separados, navegação confusa

### Depois da Refatoração
- ✅ IntegratedAssessment (módulo único)
- ✅ Simetrógrafo integrado nas fotos
- ✅ IA usa dados do simetrógrafo
- ✅ Motor de diagnóstico recebe flags de todas as fontes
- ✅ Navegação simplificada: 1 opção "Avaliação Integrada"

## Navegação Simplificada

### Desktop (Navigation.tsx)
```
- Dashboard
- Avaliação Integrada ← NOVO (substitui 4 opções antigas)
- Relatórios
- Exercícios
- Gerenciar Alunos
- Status do Sistema
- Perfil
```

### Mobile (BottomNavigation.tsx)
```
- Início
- Avaliação ← NOVO (integra tudo)
- Relatório
- Perfil
```

## Uso do AssessmentContext

### Em Componentes Filhos

```typescript
import { useAssessment } from '@/contexts/AssessmentContext';

const MyComponent = () => {
  const { 
    data,                    // Ler dados
    updateClientData,        // Atualizar cliente
    updatePhoto,             // Adicionar foto
    addAnatomicalPoints,     // Salvar pontos marcados
    addMeasurement,          // Adicionar medição
    addDiagnosticFlag,       // Adicionar flag
    updateAIAnalysis,        // Salvar análise de IA
    setDiagnosis,            // Definir diagnóstico
    resetAssessment          // Limpar tudo
  } = useAssessment();
  
  // Usar os métodos conforme necessário
};
```

## Próximos Passos (Roadmap)

### 1. Detecção Automática de Flags
- [ ] Converter resultados do SkeletonDetection em flags
- [ ] Converter ângulos do DynamicAngleAnalysis em flags
- [ ] Usar medições do Simetrógrafo para gerar flags

### 2. Persistência Supabase
- [ ] Salvar assessments completos no banco
- [ ] Histórico de avaliações por cliente
- [ ] Comparação before/after

### 3. Exportação de Relatórios
- [ ] PDF completo com todas as fotos anotadas
- [ ] Incluir diagnóstico e protocolos
- [ ] Gráficos de evolução

### 4. Melhorias no Simetrógrafo
- [ ] Calibração automática de escala (usando altura do cliente)
- [ ] Converter medidas de pixels para centímetros
- [ ] Cálculos angulares mais precisos
- [ ] Templates de pontos anatômicos salvos

### 5. IA Avançada
- [ ] Detecção automática de pontos anatômicos (pose estimation)
- [ ] Sugestão automática de flags baseada em ML
- [ ] Validação de qualidade das fotos

## Tecnologias Utilizadas

- **React 18** - Framework principal
- **TypeScript** - Type safety
- **Context API** - Gerenciamento de estado global
- **Tailwind CSS** - Estilização
- **Shadcn UI** - Componentes
- **Canvas API** - Simetrógrafo e anotações
- **Lucide React** - Ícones

## Suporte

Para dúvidas ou sugestões sobre o sistema integrado, consulte:
- `DIAGNOSTIC_ENGINE_README.md` - Documentação do motor de diagnóstico
- `src/contexts/AssessmentContext.tsx` - Código do contexto
- `src/components/IntegratedAssessment.tsx` - Componente principal
- `src/components/analysis/Simetrografo.tsx` - Simetrógrafo virtual
