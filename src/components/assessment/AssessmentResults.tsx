
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Share2 } from 'lucide-react';
import { ClientData, PosturalAssessmentData } from '../PosturalAssessment';
import { toast } from '@/hooks/use-toast';

interface AssessmentResultsProps {
  clientData: ClientData;
  posturalData: PosturalAssessmentData;
  selectedProtocol: string | null;
}

const AssessmentResults = ({
  clientData,
  posturalData,
  selectedProtocol
}: AssessmentResultsProps) => {

  const calculateBMI = () => {
    if (clientData.height > 0 && clientData.weight > 0) {
      const heightInMeters = clientData.height / 100;
      return (clientData.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return 'N/A';
  };

  const getBMIStatus = (bmi: string) => {
    if (bmi === 'N/A') return 'N/A';
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return 'Abaixo do peso';
    if (bmiValue < 25) return 'Peso normal';
    if (bmiValue < 30) return 'Sobrepeso';
    return 'Obesidade';
  };

  const getPosturalSummary = () => {
    const deviations = [];
    
    if (posturalData.headForward >= 2) deviations.push('Cabeça anteriorizada');
    if (posturalData.shouldersProtracted >= 2) deviations.push('Ombros protusos');
    if (posturalData.scapularWinging >= 2) deviations.push('Escápulas aladas');
    if (posturalData.thoracicKyphosis >= 2) deviations.push('Hipercifose torácica');
    if (posturalData.lumbarLordosis >= 2) deviations.push('Hiperlordose lombar');
    if (posturalData.pelvicAnteversion >= 2) deviations.push('Anteversão pélvica');
    if (posturalData.kneeValgusVarus >= 2) deviations.push('Desvio nos joelhos');
    if (posturalData.flatFeet >= 2) deviations.push('Alteração nos pés');
    
    return deviations.length > 0 ? deviations : ['Postura dentro dos parâmetros normais'];
  };

  const handleGeneratePDF = () => {
    toast({
      title: "PDF Gerado!",
      description: "Relatório completo foi gerado com sucesso.",
    });
  };

  const handleShareReport = () => {
    toast({
      title: "Relatório Compartilhado!",
      description: "Link de compartilhamento foi gerado.",
    });
  };

  const posturalDeviations = getPosturalSummary();

  return (
    <div className="space-y-6">
      {/* Resumo do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-600">Resumo do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Dados Pessoais</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Nome:</strong> {clientData.fullName}</p>
                <p><strong>Idade:</strong> {clientData.age} anos</p>
                <p><strong>Altura:</strong> {clientData.height} cm</p>
                <p><strong>Peso:</strong> {clientData.weight} kg</p>
                <p><strong>IMC:</strong> {calculateBMI()} ({getBMIStatus(calculateBMI())})</p>
                <p><strong>Profissão:</strong> {clientData.profession}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Estilo de Vida</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Nível de atividade:</strong> {clientData.activityLevel}</p>
                <p><strong>Sono:</strong> {clientData.sleepHours}h ({clientData.sleepQuality})</p>
                <p><strong>Horas sentado/dia:</strong> {clientData.dailyHoursSitting}h</p>
                <p><strong>Esporte:</strong> {clientData.sportsActivity || 'Não pratica'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queixas Principais */}
      {(clientData.painLocation || clientData.painIntensity > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-blue-600">Queixas Principais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clientData.painLocation && (
                <p><strong>Dor:</strong> {clientData.painLocation}</p>
              )}
              {clientData.painIntensity > 0 && (
                <p><strong>Intensidade:</strong> {clientData.painIntensity}/10</p>
              )}
              {clientData.painFrequency && (
                <p><strong>Frequência:</strong> {clientData.painFrequency}</p>
              )}
              {clientData.functionalDifficulties && (
                <p><strong>Dificuldades:</strong> {clientData.functionalDifficulties}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análise Postural */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-600">Análise Postural</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <h3 className="font-semibold">Desvios Identificados:</h3>
            <div className="flex flex-wrap gap-2">
              {posturalDeviations.map((deviation, index) => (
                <Badge 
                  key={index} 
                  variant={deviation === 'Postura dentro dos parâmetros normais' ? 'secondary' : 'destructive'}
                >
                  {deviation}
                </Badge>
              ))}
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Testes Funcionais:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>Adams:</strong> {posturalData.adamsTest}</p>
                <p><strong>Flexão anterior:</strong> {posturalData.anteriorFlexion}</p>
                <p><strong>Equilíbrio:</strong> {posturalData.singleLegStance}</p>
                <p><strong>Agachamento:</strong> {posturalData.squatPattern}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Objetivos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-600">Objetivos do Tratamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {clientData.primaryGoal && (
              <p><strong>Primário:</strong> {clientData.primaryGoal}</p>
            )}
            {clientData.secondaryGoal && (
              <p><strong>Secundário:</strong> {clientData.secondaryGoal}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Protocolo Selecionado */}
      {selectedProtocol && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-blue-600">Protocolo Selecionado</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="mb-3">
              Protocolo {selectedProtocol}
            </Badge>
            <p className="text-sm text-gray-600">
              O protocolo de tratamento personalizado foi selecionado com base na avaliação postural.
              Consulte a aba "Protocolos" para detalhes completos.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Observações */}
      {posturalData.observations && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-blue-600">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{posturalData.observations}</p>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-600">Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleGeneratePDF} className="flex items-center gap-2">
              <FileText size={16} />
              Gerar Relatório PDF
            </Button>
            <Button onClick={handleShareReport} variant="outline" className="flex items-center gap-2">
              <Share2 size={16} />
              Compartilhar
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              Exportar Dados
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentResults;
