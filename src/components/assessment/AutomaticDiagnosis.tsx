
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, Info, Brain, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ClientData, PosturalAssessmentData } from '../PosturalAssessment';

interface AutomaticDiagnosisProps {
  clientData: ClientData;
  posturalData: PosturalAssessmentData;
  onGenerateReport: () => void;
}

const AutomaticDiagnosis = ({ clientData, posturalData, onGenerateReport }: AutomaticDiagnosisProps) => {
  // Sistema de análise automática completo
  const analyzePosturalPatterns = () => {
    const identifiedPatterns = [];
    const recommendations = [];
    let totalScore = 100;

    // P01 - Hipercifose Torácica
    if (posturalData.thoracicKyphosis >= 2) {
      identifiedPatterns.push({
        code: 'P01',
        name: 'Correção de Hipercifose Torácica',
        cause: 'Fraqueza dos extensores torácicos + postura sentada prolongada',
        symptoms: ['Dor interescapular', 'Respiração curta', 'Ombros curvados para frente'],
        severity: posturalData.thoracicKyphosis,
        keyExercises: [
          'Liberação peitoral com rolo (2x/dia, 1 minuto)',
          'Extensão torácica sobre foam roller (3x10 reps)',
          'Superman hold progressivo (15s → 45s)'
        ],
        duration: '8 semanas',
        reminders: ['A cada 1h sentado, faça 2 minutos de correção postural']
      });
      totalScore -= 15;
      recommendations.push('Protocolo P01 - Correção de Hipercifose Torácica');
    }

    // P02 - Alinhamento de Cabeça Anterior
    if (posturalData.headForward >= 2) {
      identifiedPatterns.push({
        code: 'P02',
        name: 'Alinhamento de Cabeça Anterior',
        cause: 'Uso excessivo de dispositivos móveis',
        symptoms: ['Dor na nuca', 'Cefaleia tensional'],
        severity: posturalData.headForward,
        keyExercises: [
          'Chin tuck contra resistência manual (3x12 reps)',
          'Flexão cervical isométrica (4x20s)'
        ],
        duration: '6 semanas',
        reminders: ['Ajuste a tela na altura dos olhos']
      });
      totalScore -= 12;
      recommendations.push('Protocolo P02 - Alinhamento de Cabeça Anterior');
    }

    // P03 - Escápulas Aladas
    if (posturalData.scapularWinging >= 2) {
      identifiedPatterns.push({
        code: 'P03',
        name: 'Escápulas Aladas',
        cause: 'Fraqueza do serrátil anterior',
        symptoms: ['Asas salientes nas costas'],
        severity: posturalData.scapularWinging,
        keyExercises: [
          'Push-up plus modificado (3x8 reps)',
          'Protração escapular com banda'
        ],
        duration: '10 semanas',
        reminders: ['Fortaleça serrátil anterior diariamente']
      });
      totalScore -= 10;
      recommendations.push('Protocolo P03 - Escápulas Aladas');
    }

    // P04 - Hiperlordose Lombar
    if (posturalData.lumbarLordosis >= 2) {
      identifiedPatterns.push({
        code: 'P04',
        name: 'Hiperlordose Lombar',
        cause: 'Encurtamento do iliopsoas',
        symptoms: ['Dor lombar em pé'],
        severity: posturalData.lumbarLordosis,
        keyExercises: [
          'Alongamento do iliopsoas (3x30s/lado)',
          'Deadbug (3x10)'
        ],
        duration: '8 semanas',
        reminders: ['Evite sapatos de salto alto']
      });
      totalScore -= 12;
      recommendations.push('Protocolo P04 - Hiperlordose Lombar');
    }

    // P05 - Pélvis Anteriorizada
    if (posturalData.pelvicAnteversion >= 2) {
      identifiedPatterns.push({
        code: 'P05',
        name: 'Pélvis Anteriorizada',
        cause: 'Desequilíbrio flexores/glúteos',
        symptoms: ['Dores ao acordar'],
        severity: posturalData.pelvicAnteversion,
        keyExercises: [
          'Alongamento de quadríceps (2x15/lado)',
          'Good morning com bastão (3x8)'
        ],
        duration: '12 semanas',
        reminders: ['Fortaleça glúteos regularmente']
      });
      totalScore -= 10;
      recommendations.push('Protocolo P05 - Pélvis Anteriorizada');
    }

    // P06 - Assimetria de Ombros
    if (posturalData.shouldersProtracted >= 2) {
      identifiedPatterns.push({
        code: 'P06',
        name: 'Assimetria de Ombros',
        cause: 'Padrões assimétricos',
        symptoms: ['Ombro mais alto'],
        severity: posturalData.shouldersProtracted,
        keyExercises: [
          'Elevação escapular unilateral (3x12)',
          'Remada unilateral (3x10)'
        ],
        duration: '8 semanas',
        reminders: ['Evite carregar peso em um lado só']
      });
      totalScore -= 8;
      recommendations.push('Protocolo P06 - Assimetria de Ombros');
    }

    // P08 - Joelho Valgo Estático
    if (posturalData.kneeValgusVarus >= 2) {
      identifiedPatterns.push({
        code: 'P08',
        name: 'Joelho Valgo Estático',
        cause: 'Fraqueza do glúteo médio',
        symptoms: ['Joelhos colados'],
        severity: posturalData.kneeValgusVarus,
        keyExercises: [
          'Clamshell (3x15/lado)',
          'Agachamento com banda'
        ],
        duration: '8 semanas',
        reminders: ['Fortaleça glúteo médio diariamente']
      });
      totalScore -= 10;
      recommendations.push('Protocolo P08 - Joelho Valgo Estático');
    }

    // P09 - Pé Plano Estrutural
    if (posturalData.flatFeet >= 2) {
      identifiedPatterns.push({
        code: 'P09',
        name: 'Pé Plano Estrutural',
        cause: 'Arco colapsado',
        symptoms: ['Dor no arco plantar'],
        severity: posturalData.flatFeet,
        keyExercises: [
          'Elevação de calcanhar (3x15)',
          'Coleta de toalha com os pés'
        ],
        duration: '12 semanas',
        reminders: ['Use palmilhas com suporte de arco']
      });
      totalScore -= 8;
      recommendations.push('Protocolo P09 - Pé Plano Estrutural');
    }

    // Análise baseada em testes funcionais
    if (posturalData.adamsTest === 'positive') {
      identifiedPatterns.push({
        code: 'P13',
        name: 'Escoliose Torácica',
        cause: 'Assimetria estrutural/funcional',
        symptoms: ['Ombro e quadril assimétricos', 'Giba costal'],
        severity: 2,
        keyExercises: [
          'Respiração costal diferencial',
          'Correção ativa no espelho',
          'Alongamento específico da concavidade'
        ],
        duration: '12 semanas',
        reminders: ['Monitore progressão regularmente']
      });
      totalScore -= 15;
      recommendations.push('Protocolo P13 - Escoliose Torácica (Adams positivo)');
    }

    if (posturalData.anteriorFlexion === 'limited') {
      identifiedPatterns.push({
        code: 'P14',
        name: 'Pélvis Retroversa',
        cause: 'Encurtamento isquiotibiais',
        symptoms: ['Achatamento lombar', 'Rigidez posterior'],
        severity: 2,
        keyExercises: [
          'Alongamento de isquiotibiais (3x30s)',
          'Inclinação pélvica ativa'
        ],
        duration: '8 semanas',
        reminders: ['Alongue diariamente cadeia posterior']
      });
      totalScore -= 10;
      recommendations.push('Protocolo P14 - Encurtamento Posterior');
    }

    if (posturalData.singleLegStance === 'poor') {
      identifiedPatterns.push({
        code: 'P27',
        name: 'Instabilidade Postural',
        cause: 'Déficit proprioceptivo',
        symptoms: ['Desequilíbrio frequente', 'Instabilidade'],
        severity: 2,
        keyExercises: [
          'Treino de apoio monopodal',
          'Exercícios proprioceptivos',
          'Olhos fechados em superfície instável'
        ],
        duration: '8 semanas',
        reminders: ['Pratique equilíbrio diariamente']
      });
      totalScore -= 12;
      recommendations.push('Protocolo P27 - Treino Proprioceptivo');
    }

    if (posturalData.squatPattern === 'compensated') {
      identifiedPatterns.push({
        code: 'P15',
        name: 'Valgo Dinâmico',
        cause: 'Padrão de movimento errado',
        symptoms: ['Joelhos para dentro ao agachar'],
        severity: 2,
        keyExercises: [
          'Agachamento com feedback visual',
          'Step-up lateral',
          'Fortalecimento glúteo médio'
        ],
        duration: '10 semanas',
        reminders: ['Monitore padrão durante exercícios']
      });
      totalScore -= 10;
      recommendations.push('Protocolo P15 - Correção Valgo Dinâmico');
    }

    // Análise baseada em dados do cliente
    if (clientData.dailyHoursSitting > 6) {
      identifiedPatterns.push({
        code: 'P20',
        name: 'Síndrome Cruzada Superior',
        cause: 'Desequilíbrio muscular por postura sentada',
        symptoms: ['Dor cervicotorácica', 'Fadiga postural'],
        severity: 2,
        keyExercises: [
          'Alongamento peitoral',
          'Fortalecimento cervical profundo',
          'Mobilização torácica'
        ],
        duration: '10 semanas',
        reminders: ['Pause a cada hora para movimentar-se']
      });
      totalScore -= 12;
      recommendations.push('Protocolo P20 - Síndrome Cruzada Superior');
    }

    if (clientData.painIntensity >= 7) {
      identifiedPatterns.push({
        code: 'P32',
        name: 'Síndrome do Piriforme',
        cause: 'Compressão ciática',
        symptoms: ['Dor glútea profunda', 'Irradiação ciática'],
        severity: 3,
        keyExercises: [
          'Alongamento PIR do piriforme',
          'Mobilização neural',
          'Liberação miofascial'
        ],
        duration: '8 semanas',
        reminders: ['Evite sentar por períodos prolongados']
      });
      totalScore -= 15;
      recommendations.push('Protocolo Urgente P32 - Síndrome do Piriforme');
    }

    return {
      patterns: identifiedPatterns,
      recommendations,
      totalScore: Math.max(0, totalScore),
      riskLevel: identifiedPatterns.length
    };
  };

  const getSeverityColor = (score: number) => {
    if (score >= 85) return { color: 'bg-green-100 text-green-800', icon: CheckCircle, level: 'Normal' };
    if (score >= 70) return { color: 'bg-yellow-100 text-yellow-800', icon: Info, level: 'Leve' };
    if (score >= 50) return { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle, level: 'Moderado' };
    return { color: 'bg-red-100 text-red-800', icon: XCircle, level: 'Grave' };
  };

  const analysis = analyzePosturalPatterns();
  const severity = getSeverityColor(analysis.totalScore);
  const SeverityIcon = severity.icon;

  return (
    <div className="space-y-6">
      {/* Análise Automática Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <span>Diagnóstico Automático SAARS</span>
            </div>
            <Badge className={severity.color} variant="secondary">
              <SeverityIcon className="h-4 w-4 mr-1" />
              {severity.level}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-2">{analysis.totalScore}</div>
            <p className="text-gray-600">Score SAARS (0-100)</p>
            <p className="text-sm text-gray-500">{analysis.patterns.length} padrões identificados</p>
          </div>
          
          <div className="bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                analysis.totalScore >= 85 ? 'bg-green-500' :
                analysis.totalScore >= 70 ? 'bg-yellow-500' :
                analysis.totalScore >= 50 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${analysis.totalScore}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Padrões Identificados */}
      <Card>
        <CardHeader>
          <CardTitle>Padrões Posturais Identificados</CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.patterns.length > 0 ? (
            <div className="space-y-4">
              {analysis.patterns.map((pattern, index) => (
                <div key={pattern.code} className="border rounded-lg p-4 bg-orange-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {pattern.code} - {pattern.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Causa:</strong> {pattern.cause}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline">{pattern.duration}</Badge>
                      <div className="flex">
                        {[...Array(pattern.severity)].map((_, i) => (
                          <div key={i} className="w-2 h-2 bg-red-500 rounded-full mr-1" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Sintomas:</p>
                    <div className="flex flex-wrap gap-1">
                      {pattern.symptoms.map((symptom, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Exercícios-Chave:</p>
                    <ul className="space-y-1">
                      {pattern.keyExercises.map((exercise, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          {exercise}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="border-t pt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Lembretes:</p>
                    {pattern.reminders.map((reminder, idx) => (
                      <p key={idx} className="text-sm text-orange-700">
                        ⚠️ {reminder}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Excelente! Postura Dentro dos Parâmetros Normais
              </h3>
              <p className="text-gray-500">
                Nenhum padrão postural patológico foi identificado na análise.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Recomenda-se manutenção com exercícios preventivos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relatório Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório Completo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Resumo da Análise</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Cliente: {clientData.fullName || 'Não informado'}</li>
                <li>• Idade: {clientData.age || 'Não informado'} anos</li>
                <li>• Nível de atividade: {clientData.activityLevel}</li>
                <li>• Horas sentado/dia: {clientData.dailyHoursSitting}h</li>
                <li>• Intensidade da dor: {clientData.painIntensity}/10</li>
                <li>• Padrões identificados: {analysis.patterns.length}</li>
                <li>• Score SAARS: {analysis.totalScore}/100</li>
              </ul>
            </div>
            
            {analysis.recommendations.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Recomendações Prioritárias</h4>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-green-800 flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Separator />
            
            <Button 
              onClick={onGenerateReport}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              Gerar Relatório Completo PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomaticDiagnosis;
