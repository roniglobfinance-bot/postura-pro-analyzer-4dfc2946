
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface DiagnosisProps {
  assessmentData: any;
  onGeneratePrescription: () => void;
}

const AutomaticDiagnosis = ({ assessmentData, onGeneratePrescription }: DiagnosisProps) => {
  // Cálculo do Score SAARS
  const calculateSAARSScore = () => {
    let score = 100; // Começa com score perfeito
    
    // Deduções por alterações angulares
    const cranioCervical = assessmentData.cranioCervicalAngle || 55;
    if (cranioCervical < 45 || cranioCervical > 65) score -= 10;
    if (cranioCervical < 40 || cranioCervical > 70) score -= 5;
    
    const thoracicKyphosis = assessmentData.thoracicKyphosis || 30;
    if (thoracicKyphosis < 15 || thoracicKyphosis > 45) score -= 15;
    if (thoracicKyphosis < 10 || thoracicKyphosis > 50) score -= 10;
    
    const lumbarLordosis = assessmentData.lumbarLordosis || 50;
    if (lumbarLordosis < 35 || lumbarLordosis > 65) score -= 15;
    if (lumbarLordosis < 30 || lumbarLordosis > 70) score -= 10;
    
    const pelvicTilt = assessmentData.pelvicTilt || 12;
    if (pelvicTilt < 5 || pelvicTilt > 18) score -= 10;
    if (pelvicTilt < 0 || pelvicTilt > 25) score -= 5;
    
    // Deduções por assimetrias
    const shoulderImbalance = Math.abs(assessmentData.shoulderImbalance || 0);
    if (shoulderImbalance > 5) score -= 5;
    if (shoulderImbalance > 10) score -= 5;
    if (shoulderImbalance > 15) score -= 5;
    
    const cobbAngle = assessmentData.cobbAngle || 0;
    if (cobbAngle > 5) score -= 10;
    if (cobbAngle > 15) score -= 10;
    if (cobbAngle > 25) score -= 15;
    
    // Deduções por testes funcionais positivos
    if (assessmentData.thomasTest === 'positive-mild') score -= 5;
    if (assessmentData.thomasTest === 'positive-severe') score -= 10;
    if (assessmentData.oberTest === 'positive-mild') score -= 5;
    if (assessmentData.oberTest === 'positive-severe') score -= 10;
    if (assessmentData.adamsTest === 'positive-mild') score -= 5;
    if (assessmentData.adamsTest === 'positive-severe') score -= 10;
    
    return Math.max(0, score);
  };

  const getSeverityLevel = (score: number) => {
    if (score >= 85) return { level: 'Normal', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    if (score >= 70) return { level: 'Leve', color: 'bg-yellow-100 text-yellow-800', icon: Info };
    if (score >= 50) return { level: 'Moderado', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle };
    return { level: 'Grave', color: 'bg-red-100 text-red-800', icon: XCircle };
  };

  const generateDiagnosis = () => {
    const findings = [];
    const recommendations = [];
    
    // Análise de cada parâmetro
    const cranioCervical = assessmentData.cranioCervicalAngle || 55;
    if (cranioCervical > 60) {
      findings.push('Protrusão anterior de cabeça detectada');
      recommendations.push('Fortalecimento dos flexores profundos do pescoço');
      recommendations.push('Alongamento dos músculos suboccipitais');
    }
    
    const thoracicKyphosis = assessmentData.thoracicKyphosis || 30;
    if (thoracicKyphosis > 40) {
      findings.push('Hipercifose torácica identificada');
      recommendations.push('Exercícios de extensão torácica');
      recommendations.push('Fortalecimento dos romboides e trapézio médio');
    }
    
    const lumbarLordosis = assessmentData.lumbarLordosis || 50;
    if (lumbarLordosis > 60) {
      findings.push('Hiperlordose lombar presente');
      recommendations.push('Fortalecimento do core');
      recommendations.push('Alongamento dos flexores do quadril');
    } else if (lumbarLordosis < 40) {
      findings.push('Retificação da lordose lombar');
      recommendations.push('Mobilização da coluna lombar');
      recommendations.push('Fortalecimento dos extensores lombares');
    }
    
    const cobbAngle = assessmentData.cobbAngle || 0;
    if (cobbAngle > 10) {
      findings.push(`Escoliose estrutural detectada (${cobbAngle}°)`);
      recommendations.push('Exercícios assimétricos específicos');
      recommendations.push('Alongamento da concavidade');
    }
    
    // Análise de testes funcionais
    if (assessmentData.thomasTest === 'positive-severe') {
      findings.push('Encurtamento severo dos flexores do quadril');
      recommendations.push('Alongamento intensivo do iliopsoas');
    }
    
    if (assessmentData.oberTest === 'positive-severe') {
      findings.push('Síndrome da banda iliotibial presente');
      recommendations.push('Liberação miofascial da banda iliotibial');
    }
    
    return { findings, recommendations };
  };

  const saarsScore = calculateSAARSScore();
  const severity = getSeverityLevel(saarsScore);
  const diagnosis = generateDiagnosis();
  const SeverityIcon = severity.icon;

  return (
    <div className="space-y-6">
      {/* Score SAARS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Diagnóstico Automático SAARS</span>
            <Badge className={severity.color} variant="secondary">
              <SeverityIcon className="h-4 w-4 mr-1" />
              {severity.level}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-2">{saarsScore}</div>
            <p className="text-gray-600">Score SAARS (0-100)</p>
          </div>
          
          <div className="bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                saarsScore >= 85 ? 'bg-green-500' :
                saarsScore >= 70 ? 'bg-yellow-500' :
                saarsScore >= 50 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${saarsScore}%` }}
            />
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-xs text-center">
            <div className="text-red-600">Grave<br/>(0-49)</div>
            <div className="text-orange-600">Moderado<br/>(50-69)</div>
            <div className="text-yellow-600">Leve<br/>(70-84)</div>
            <div className="text-green-600">Normal<br/>(85-100)</div>
          </div>
        </CardContent>
      </Card>

      {/* Principais Achados */}
      <Card>
        <CardHeader>
          <CardTitle>Principais Achados Clínicos</CardTitle>
        </CardHeader>
        <CardContent>
          {diagnosis.findings.length > 0 ? (
            <div className="space-y-2">
              {diagnosis.findings.map((finding, index) => (
                <div key={index} className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mr-2 flex-shrink-0" />
                  <span className="text-sm">{finding}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm">Nenhuma alteração postural significativa detectada</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescrição Automática */}
      <Card>
        <CardHeader>
          <CardTitle>Prescrição de Exercícios Automatizada</CardTitle>
        </CardHeader>
        <CardContent>
          {diagnosis.recommendations.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {diagnosis.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <Info className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <Button 
                onClick={onGeneratePrescription}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Gerar Protocolo de Exercícios Detalhado
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-600">Postura dentro dos parâmetros normais</p>
              <p className="text-sm text-gray-500">Manutenção dos exercícios preventivos recomendada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomaticDiagnosis;
