import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import FlagSelector from './diagnostic/FlagSelector';
import DiagnosticResults from './diagnostic/DiagnosticResults';
import ProtocolViewer from './diagnostic/ProtocolViewer';
import { generateDiagnosticReport, DiagnosticOutput, ProtocolOutput } from '@/services/diagnosticEngine';
import { Brain, FileText, Dumbbell, RotateCcw } from 'lucide-react';

const DiagnosticEngine = () => {
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [diagnoses, setDiagnoses] = useState<DiagnosticOutput[]>([]);
  const [protocols, setProtocols] = useState<ProtocolOutput[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [activeTab, setActiveTab] = useState('flags');

  const handleGenerateDiagnosis = () => {
    if (selectedFlags.length === 0) {
      toast({
        title: 'Nenhum flag selecionado',
        description: 'Selecione pelo menos um flag de avaliação',
        variant: 'destructive'
      });
      return;
    }

    const result = generateDiagnosticReport({ flags: selectedFlags });
    
    setDiagnoses(result.diagnoses);
    setProtocols(result.protocols);
    setSummary(result.summary);

    if (result.diagnoses.length === 0) {
      toast({
        title: 'Nenhum diagnóstico encontrado',
        description: 'Nenhuma regra correspondente aos flags selecionados',
        variant: 'default'
      });
    } else {
      toast({
        title: 'Diagnóstico gerado',
        description: `${result.diagnoses.length} diagnóstico(s) identificado(s)`,
      });
      setActiveTab('results');
    }
  };

  const handleReset = () => {
    setSelectedFlags([]);
    setDiagnoses([]);
    setProtocols([]);
    setSummary('');
    setActiveTab('flags');
    
    toast({
      title: 'Sistema resetado',
      description: 'Todos os dados foram limpos',
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6" />
                Motor de Diagnóstico SAARS
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de Análise Automatizada baseado em Base de Conhecimento
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateDiagnosis}
                disabled={selectedFlags.length === 0}
                size="lg"
              >
                <Brain className="h-4 w-4 mr-2" />
                Processar Diagnóstico
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="flags" className="gap-2">
            <FileText className="h-4 w-4" />
            Flags de Avaliação
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2">
            <Brain className="h-4 w-4" />
            Diagnósticos
          </TabsTrigger>
          <TabsTrigger value="protocols" className="gap-2">
            <Dumbbell className="h-4 w-4" />
            Protocolos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flags" className="space-y-4 mt-0">
          <FlagSelector
            selectedFlags={selectedFlags}
            onFlagsChange={setSelectedFlags}
          />
        </TabsContent>

        <TabsContent value="results" className="space-y-4 mt-0">
          <DiagnosticResults diagnoses={diagnoses} />
          
          {summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo Técnico</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono bg-muted p-4 rounded-lg whitespace-pre-wrap">
                  {summary}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="protocols" className="space-y-4 mt-0">
          <ProtocolViewer protocols={protocols} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiagnosticEngine;
