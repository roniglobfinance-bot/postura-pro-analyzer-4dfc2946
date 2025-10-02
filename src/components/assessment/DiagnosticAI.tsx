import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertTriangle, CheckCircle, Loader2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { analyzePosturalData, saveAnalysis, getAnalysis, type AnalysisResult } from '@/services/posturalAnalysisService';

interface DiagnosticAIProps {
  clientData: any;
  measurements: any;
  onDiagnosisComplete: (diagnosis: any) => void;
}

const DiagnosticAI = ({ clientData, measurements, onDiagnosisComplete }: DiagnosticAIProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAnalyze = async () => {
    if (!measurements.evaluationId) {
      toast({
        title: "Erro",
        description: "Nenhuma avaliação encontrada. Salve a avaliação primeiro.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Primeiro tenta buscar análise existente
      const existingAnalysis = await getAnalysis(measurements.evaluationId);
      
      if (existingAnalysis) {
        setAnalysis(existingAnalysis);
        onDiagnosisComplete(existingAnalysis);
        toast({
          title: "Análise carregada",
          description: "Análise anterior encontrada e carregada."
        });
      } else {
        // Se não existe, criar nova análise com dados reais
        const result = await analyzePosturalData(measurements.evaluationId);
        setAnalysis(result);
        onDiagnosisComplete(result);
        
        toast({
          title: "Análise completa!",
          description: `${result.patterns.length} padrões identificados.`
        });
      }
    } catch (error) {
      console.error('Erro na análise:', error);
      toast({
        title: "Erro",
        description: "Não foi possível completar a análise. Verifique se a avaliação foi salva.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!analysis || !measurements.evaluationId) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para salvar.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      await saveAnalysis(measurements.evaluationId, analysis, 'system-user');
      
      toast({
        title: "Sucesso!",
        description: "Análise salva no banco de dados."
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a análise.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 3) return 'bg-red-500';
    if (severity === 2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRiskBadge = (risk: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-red-100 text-red-800 border-red-300'
    };
    const labels = { low: 'Baixo', medium: 'Médio', high: 'Alto' };
    return { color: colors[risk as keyof typeof colors], label: labels[risk as keyof typeof labels] };
  };

  if (!analysis) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Diagnóstico Automático com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="bg-primary/5 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
              <Brain className="h-12 w-12 text-primary" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Análise Inteligente Pronta</h3>
              <p className="text-muted-foreground">
                A IA analisará os dados posturais reais da avaliação e gerará um diagnóstico 
                detalhado com recomendações personalizadas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="p-4 bg-card rounded-lg border-2">
                <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="font-medium">Dados Reais</p>
                <p className="text-sm text-muted-foreground">Da avaliação</p>
              </div>
              <div className="p-4 bg-card rounded-lg border-2">
                <Brain className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <p className="font-medium">Análise IA</p>
                <p className="text-sm text-muted-foreground">Padrões posturais</p>
              </div>
              <div className="p-4 bg-card rounded-lg border-2">
                <AlertTriangle className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                <p className="font-medium">Recomendações</p>
                <p className="text-sm text-muted-foreground">Personalizadas</p>
              </div>
            </div>

            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              size="lg"
              className="w-full md:w-auto"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analisando dados reais...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Iniciar Diagnóstico Automático
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const riskBadge = getRiskBadge(analysis.riskLevel);

  return (
    <div className="space-y-6">
      {/* Score Principal */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Resultado da Análise
            </div>
            <Badge className={riskBadge.color} variant="outline">
              Risco: {riskBadge.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-primary mb-2">{analysis.overallScore}</div>
            <p className="text-muted-foreground">Score Postural (0-100)</p>
            <p className="text-sm text-muted-foreground mt-1">
              {analysis.patterns.length} padrão(ões) identificado(s)
            </p>
          </div>
          
          <div className="w-full bg-secondary rounded-full h-4 mb-4">
            <div 
              className={`h-4 rounded-full transition-all duration-500 ${
                analysis.overallScore >= 80 ? 'bg-green-500' :
                analysis.overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${analysis.overallScore}%` }}
            />
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={handleAnalyze} variant="outline" size="sm">
              <Brain className="mr-2 h-4 w-4" />
              Reanalisar
            </Button>
            <Button onClick={handleSaveAnalysis} disabled={isSaving} size="sm">
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar Análise
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Padrões Identificados */}
      {analysis.patterns.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Padrões Posturais Detectados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.patterns.map((pattern) => (
              <div key={pattern.code} className="p-4 border-2 rounded-lg bg-card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{pattern.code}</Badge>
                      <h4 className="font-semibold">{pattern.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Causa:</strong> {pattern.cause}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(pattern.severity)].map((_, i) => (
                      <div key={i} className={`w-3 h-3 rounded-full ${getSeverityColor(pattern.severity)}`} />
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium mb-1">Sintomas:</p>
                  <div className="flex flex-wrap gap-1">
                    {pattern.symptoms.map((symptom, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium mb-2">Exercícios Recomendados:</p>
                  <ul className="space-y-1">
                    {pattern.keyExercises.map((exercise, idx) => (
                      <li key={idx} className="text-sm flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        {exercise}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <Badge variant="outline">{pattern.duration}</Badge>
                  {pattern.reminders.map((reminder, idx) => (
                    <p key={idx} className="text-xs text-orange-600 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {reminder}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Excelente!</h3>
            <p className="text-muted-foreground">
              Nenhum padrão postural patológico foi identificado.
              Continue com exercícios preventivos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DiagnosticAI;
