# Motor de Diagnóstico SAARS - Documentação Completa

## Visão Geral

O Motor de Diagnóstico SAARS é um sistema profissional de análise postural e biomecânica baseado em Base de Conhecimento estruturada. O sistema processa flags de avaliação clínica e gera diagnósticos técnicos com protocolos de intervenção específicos.

## Arquitetura do Sistema

### Estrutura de Dados (4 Partes da Base de Conhecimento)

#### Parte 1: Fundamentos (`knowledgeBase.ts`)
Define as Linhas Miofasciais e seus padrões de disfunção:
- **LSP**: Linha Superficial Posterior
- **LPA**: Linha Profunda Anterior  
- **LL**: Linha Lateral
- **LE**: Linha Espiral
- **LBA**: Linha dos Braços
- **LF**: Linha Frontal

#### Parte 2: Flags de Avaliação
Inputs do sistema organizados em 4 categorias:

1. **Flags Posturais Estáticos** (PEP01-PEP15)
   - Exemplo: `PEP01: Pé Pronado`, `PEP11: Hipercifose Torácica`

2. **Flags Funcionais Dinâmicos** (DYN01-DYN05)
   - Exemplo: `DYN01: Valgo Dinâmico`, `DYN03: Compensação Lombar Agachamento`

3. **Flags de Testes Funcionais** (TES01-TES05)
   - Exemplo: `TES01: Adams Positivo`, `TES02: Thomas Positivo`

4. **Flags de Dor** (DOR01-DOR07)
   - Exemplo: `DOR02: Dor Lombar Grau 2`, `DOR04: Dor Joelho Anterior`

#### Parte 3: Regras de Diagnóstico
Lógica de processamento que conecta flags aos diagnósticos:

```typescript
{
  id: 'DIAG_CONDRO',
  name: 'Condromalácia Patelar',
  condition: {
    required: ['PEP01', 'DYN01', 'DOR04'],
    optional: ['PEP04', 'DYN02']
  },
  output: {
    diagnosis: 'Condromalácia Patelar',
    severity: 3,
    affectedLines: ['LL', 'LE', 'LPA'],
    mechanisms: [...],
    prognosis: 'Moderado - Requer 12-16 semanas',
    protocolRef: 'PROTOCOLO_CONDRO'
  }
}
```

#### Parte 4: Protocolos de Intervenção
Blocos de correção específicos organizados por fases:

- **Liberação Miofascial**
- **Alongamento**
- **Ativação**
- **Fortalecimento**
- **Funcional**
- **Respiração**
- **Controle Neuromotor**

## Fluxo de Funcionamento

### 1. Seleção de Flags (FlagSelector.tsx)
```
Usuário → Seleciona Flags Clínicos → Sistema Armazena
```

Interface organizada em tabs por categoria de flags com:
- Visualização clara do código e nome do flag
- Indicação de severidade e linhas implicadas
- Seleção múltipla via checkbox
- Contador de flags selecionados

### 2. Processamento (diagnosticEngine.ts)
```
Flags → Motor de Diagnóstico → Análise → Output
```

O motor executa:
1. Valida flags de entrada
2. Itera sobre regras de diagnóstico
3. Verifica correspondência (flags obrigatórios + opcionais)
4. Calcula confiança do diagnóstico (70% base + 30% opcionais)
5. Retorna diagnósticos ordenados por confiança

### 3. Exibição de Resultados (DiagnosticResults.tsx)
Mostra para cada diagnóstico:
- Nome e código da regra
- Severidade (1-4) com cores e ícones
- Confiança do diagnóstico (%)
- Linhas miofasciais afetadas
- Mecanismos causais detalhados
- Prognóstico
- Referência ao protocolo

### 4. Visualização de Protocolos (ProtocolViewer.tsx)
Apresenta protocolos em formato accordion com:
- Fases organizadas cronologicamente
- Blocos de exercícios por tipo
- Detalhes completos (sets, reps, carga, ferramentas)
- Navegação por expansão/colapso

## Arquivos Criados

### Base de Conhecimento
- `src/data/knowledgeBase.ts` - Base completa estruturada

### Serviços
- `src/services/diagnosticEngine.ts` - Motor de processamento

### Componentes UI
- `src/components/DiagnosticEngine.tsx` - Container principal
- `src/components/diagnostic/FlagSelector.tsx` - Seletor de flags
- `src/components/diagnostic/DiagnosticResults.tsx` - Exibição de diagnósticos
- `src/components/diagnostic/ProtocolViewer.tsx` - Visualização de protocolos

### Integrações
- `src/pages/Index.tsx` - Adicionado roteamento
- `src/components/Navigation.tsx` - Menu desktop atualizado
- `src/components/BottomNavigation.tsx` - Menu mobile atualizado

## Como Usar

### 1. Acessar Motor de Diagnóstico
- Desktop: Menu lateral → "Motor de Diagnóstico"
- Mobile: Menu inferior → "Diagnóstico"

### 2. Selecionar Flags
```
Flags de Avaliação (Tab) → Selecionar achados clínicos
```

### 3. Processar
```
Botão "Processar Diagnóstico" → Gera análise automática
```

### 4. Visualizar Resultados
```
Tab "Diagnósticos" → Ver análise completa
```

### 5. Acessar Protocolos
```
Tab "Protocolos" → Expandir fases → Ver exercícios
```

## Exemplos de Uso

### Caso 1: Condromalácia Patelar
**Flags Selecionados:**
- PEP01: Pé Pronado
- DYN01: Valgo Dinâmico
- DOR04: Dor Joelho Anterior

**Output:**
- Diagnóstico: Condromalácia Patelar
- Severidade: 3/4
- Confiança: 100%
- Protocolo: PROTOCOLO_CONDRO (12-16 semanas)

### Caso 2: Síndrome Cruzada Superior
**Flags Selecionados:**
- PEP11: Hipercifose Torácica
- PEP12: Protração de Ombros
- PEP14: Projeção Anterior Cabeça
- DOR06: Dor Cervical

**Output:**
- Diagnóstico: Síndrome Cruzada Superior
- Severidade: 3/4
- Confiança: 100%
- Protocolo: PROTOCOLO_CRUZADA_SUP (8-12 semanas)

## Expansão do Sistema

### Adicionar Novo Flag
1. Editar `knowledgeBase.ts`
2. Adicionar em categoria apropriada
3. Definir severidade e linhas implicadas

### Adicionar Nova Regra de Diagnóstico
```typescript
{
  id: 'DIAG_NOVO',
  name: 'Nome do Diagnóstico',
  condition: {
    required: ['FLAG1', 'FLAG2'],
    optional: ['FLAG3']
  },
  output: {
    diagnosis: 'Nome completo',
    severity: 2,
    affectedLines: ['LL', 'LSP'],
    mechanisms: ['Mecanismo 1', 'Mecanismo 2'],
    prognosis: 'Descrição',
    protocolRef: 'PROTOCOLO_ID'
  }
}
```

### Adicionar Novo Protocolo
```typescript
PROTOCOLO_NOVO: {
  id: 'PROTOCOLO_NOVO',
  name: 'Nome do Protocolo',
  duration: 'X-Y semanas',
  phases: [
    {
      name: 'Fase 1',
      blocks: [
        {
          type: 'liberacao',
          exercises: [
            { name: 'Exercício', sets: 3, reps: 10, load: 'progressivo' }
          ]
        }
      ]
    }
  ]
}
```

## Tecnologias Utilizadas

- **React + TypeScript**: Interface e lógica
- **Radix UI**: Componentes de UI (Tabs, Accordion, Badge)
- **Lucide React**: Ícones
- **Tailwind CSS**: Estilização
- **LocalStorage**: Persistência temporária

## Regras de Ouro

1. **100% Técnico**: Sem conversação, direto ao ponto
2. **Seguir KB**: Nunca inventar diagnósticos ou protocolos
3. **Específico**: Listar blocos exatos da Parte 4
4. **Falha Lógica**: Mensagem clara se nenhuma regra corresponder

## Roadmap de Implementação Completa

### ✅ Fase 1: Core (CONCLUÍDA)
- [x] Base de Conhecimento estruturada
- [x] Motor de diagnóstico
- [x] Interface de seleção de flags
- [x] Visualização de resultados
- [x] Visualização de protocolos
- [x] Integração com navegação

### 🚀 Fase 2: Integração com Avaliação (PRÓXIMO)
- [ ] Auto-detecção de flags a partir de medições
- [ ] Integração com PosturalAssessment
- [ ] Geração automática de diagnóstico pós-avaliação
- [ ] Salvamento de diagnósticos no Supabase

### 📊 Fase 3: Análise Visual (FUTURO)
- [ ] Integração com AdvancedPosturalAnalysis
- [ ] Detecção de flags a partir de fotos
- [ ] Overlay de linhas miofasciais em diagnósticos
- [ ] Sugestão de flags baseada em ângulos medidos

### 📝 Fase 4: Relatórios (FUTURO)
- [ ] Exportação PDF de diagnósticos
- [ ] Relatórios de progresso
- [ ] Comparação antes/depois
- [ ] Dashboard de acompanhamento

### 🤖 Fase 5: IA Avançada (FUTURO)
- [ ] Machine Learning para detecção de padrões
- [ ] Sugestão automática de flags
- [ ] Predição de prognóstico
- [ ] Personalização de protocolos

## Suporte e Contribuição

Para adicionar novos diagnósticos ou protocolos, siga a estrutura existente em `knowledgeBase.ts` e garanta consistência nos códigos e referências.

## Conclusão

O Motor de Diagnóstico SAARS é um sistema profissional completo que automatiza a análise postural baseada em evidências clínicas. A arquitetura modular permite fácil expansão e manutenção, enquanto mantém rigor técnico e precisão diagnóstica.
