
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Share2, Brain, BarChart3 } from 'lucide-react';
import { ClientData, PosturalAssessmentData } from '../PosturalAssessment';
import AutomaticDiagnosis from './AutomaticDiagnosis';
import AdvancedProtocols from './AdvancedProtocols';

interface AssessmentResultsProps {
  clientData: ClientData;
  posturalData: PosturalAssessmentData;
  selectedProtocol: string | null;
}

const AssessmentResults = ({ clientData, posturalData, selectedProtocol }: AssessmentResultsProps) => {
  const generateDetailedReport = () => {
    const reportData = {
      client: clientData,
      postural: posturalData,
      protocol: selectedProtocol,
      date: new Date().toLocaleDateString('pt-BR'),
      analysis: 'Análise detalhada gerada automaticamente pelo sistema SAARS'
    };
    
    console.log('Gerando relatório detalhado:', reportData);
    
    // Aqui seria implementada a geração do PDF
    alert('Relatório PDF sendo gerado... (Funcionalidade completa em desenvolvimento)');
  };

  const shareResults = () => {
    const shareData = {
      title: `Avaliação Postural - ${clientData.fullName}`,
      text: `Resultados da avaliação postural usando o sistema SAARS`,
      url: window.location.href
    };
    
    if (navigator.share && navigator.canShare(shareData)) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const calculateOverallScore = () => {
    const posturalScores = [
      posturalData.headForward,
      posturalData.shouldersProtracted,
      posturalData.scapularWinging,
      posturalData.thoracicKyphosis,
      posturalData.lumbarLordosis,
      posturalData.pelvicAnteversion,
      posturalData.kneeValgusVarus,
      posturalData.flatFeet
    ];
    
    const totalDeviations = posturalScores.reduce((sum, score) => sum + score, 0);
    const maxPossibleScore = posturalScores.length * 3; // 3 é o máximo por categoria
    const percentage = Math.max(0, 100 - (totalDeviations / maxPossibleScore) * 100);
    
    return Math.round(percentage);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    if (score >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const overallScore = calculateOverallScore();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Resultados da Avaliação Postural</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={shareResults} variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button onClick={generateDetailedReport} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 p-4 rounded-lg ${getScoreColor(overallScore)}`}>
                {overallScore}
              </div>
              <p className="text-sm text-gray-600">Score Geral SAARS</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {clientData.fullName || 'Cliente'}
              </div>
              <p className="text-sm text-gray-600">
                {clientData.age} anos • {clientData.profession || 'Profissão não informada'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {new Date().toLocaleDateString('pt-BR')}
              </div>
              <p className="text-sm text-gray-600">Data da Avaliação</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold text-gray-900">
                {posturalData.headForward}/3
              </div>
              <p className="text-xs text-gray-600">Cabeça Anterior</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold text-gray-900">
                {posturalData.thoracicKyphosis}/3
              </div>
              <p className="text-xs text-gray-600">Hipercifose</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold text-gray-900">
                {posturalData.lumbarLordosis}/3
              </div>
              <p className="text-xs text-gray-600">Lordose Lombar</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold text-gray-900">
                {posturalData.pelvicAnteversion}/3
              </div>
              <p className="text-xs text-gray-600">Pélvis Anterior</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="diagnosis" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="diagnosis">Diagnóstico IA</TabsTrigger>
          <TabsTrigger value="protocols">Protocolos</TabsTrigger>
          <TabsTrigger value="summary">Resumo</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnosis">
          <AutomaticDiagnosis 
            clientData={clientData}
            posturalData={posturalData}
            onGenerateReport={generateDetailedReport}
          />
        </TabsContent>

        <TabsContent value="protocols">
          <AdvancedProtocols />
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Executivo da Avaliação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Dados do Cliente</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nome:</strong> {clientData.fullName || 'Não informado'}</p>
                    <p><strong>Idade:</strong> {clientData.age || 'Não informado'} anos</p>
                    <p><strong>Profissão:</strong> {clientData.profession || 'Não informada'}</p>
                    <p><strong>Nível de Atividade:</strong> {clientData.activityLevel}</p>
                    <p><strong>Horas Sentado/Dia:</strong> {clientData.dailyHoursSitting}h</p>
                    <p><strong>Qualidade do Sono:</strong> {clientData.sleepQuality}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Queixas Principais</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Local da Dor:</strong> {clientData.painLocation || 'Não informado'}</p>
                    <p><strong>Intensidade:</strong> {clientData.painIntensity}/10</p>
                    <p><strong>Frequência:</strong> {clientData.painFrequency || 'Não informada'}</p>
                    <p><strong>Rigidez:</strong> {clientData.jointStiffness || 'Não informada'}</p>
                    <p><strong>Objetivo Primário:</strong> {clientData.primaryGoal || 'Não informado'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Testes Funcionais</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-sm font-medium">Teste de Adams</p>
                    <Badge variant={posturalData.adamsTest === 'positive' ? 'destructive' : 'default'}>
                      {posturalData.adamsTest === 'positive' ? 'Positivo' : 'Negativo'}
                    </Badge>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-sm font-medium">Flexão Anterior</p>
                    <Badge variant={posturalData.anteriorFlexion === 'limited' ? 'destructive' : 'default'}>
                      {posturalData.anteriorFlexion === 'limited' ? 'Limitado' : 'Normal'}
                    </Badge>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-sm font-medium">Equilíbrio</p>
                    <Badge variant={posturalData.singleLegStance === 'poor' ? 'destructive' : 'default'}>
                      {posturalData.singleLegStance === 'poor' ? 'Ruim' : 'Bom'}
                    </Badge>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-sm font-medium">Agachamento</p>
                    <Badge variant={posturalData.squatPattern === 'compensated' ? 'destructive' : 'default'}>
                      {posturalData.squatPattern === 'compensated' ? 'Compensado' : 'Normal'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {posturalData.observations && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Observações Adicionais</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">{posturalData.observations}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-center pt-4">
                <Button onClick={generateDetailedReport} size="lg" className="bg-green-600 hover:bg-green-700">
                  <FileText className="h-5 w-5 mr-2" />
                  Gerar Relatório Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentResults;
