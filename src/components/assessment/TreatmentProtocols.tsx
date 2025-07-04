
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientData, PosturalAssessmentData } from '../PosturalAssessment';

interface TreatmentProtocolsProps {
  clientData: ClientData;
  posturalData: PosturalAssessmentData;
  selectedProtocol: string | null;
  onProtocolSelect: (protocol: string) => void;
  onNext: () => void;
}

interface Protocol {
  id: string;
  name: string;
  cause: string;
  symptoms: string[];
  exercises: {
    phase: string;
    weeks: string;
    exercises: string[];
  }[];
  duration: string;
  reminders: string[];
}

const TreatmentProtocols = ({
  clientData,
  posturalData,
  selectedProtocol,
  onProtocolSelect,
  onNext
}: TreatmentProtocolsProps) => {
  
  const protocols: Protocol[] = [
    {
      id: 'P01',
      name: 'Correção de Hipercifose Torácica',
      cause: 'Fraqueza dos extensores torácicos + postura sentada',
      symptoms: ['Dor interescapular', 'Respiração curta', 'Fadiga muscular'],
      exercises: [
        {
          phase: 'Fase 1',
          weeks: 'Semanas 1-4',
          exercises: [
            'Liberação peitoral com rolo (2x/dia)',
            'Cat-Camel (3x10 reps)',
            'Alongamento de peitoral (3x30s)'
          ]
        },
        {
          phase: 'Fase 2',
          weeks: 'Semanas 5-8',
          exercises: [
            'Superman hold (3x20 segundos)',
            'Remada com elástico (3x15)',
            'Fortalecimento romboides (3x12)'
          ]
        },
        {
          phase: 'Fase 3',
          weeks: 'Semanas 9-12',
          exercises: [
            'Deadlift romeno (3x10)',
            'Prancha inversa (3x15s)',
            'Exercícios funcionais'
          ]
        }
      ],
      duration: '12 semanas',
      reminders: [
        'Evite cadeiras sem apoio lombar',
        'Pause a cada hora de trabalho',
        'Mantenha monitor na altura dos olhos'
      ]
    },
    {
      id: 'P02',
      name: 'Síndrome do Cruzamento Superior',
      cause: 'Desequilíbrio muscular entre músculos anteriores e posteriores',
      symptoms: ['Dor cervical', 'Cefaléia tensional', 'Rigidez ombros'],
      exercises: [
        {
          phase: 'Fase 1',
          weeks: 'Semanas 1-4',
          exercises: [
            'Liberação de trapézio superior',
            'Alongamento de esternocleidomastóideo',
            'Mobilização cervical'
          ]
        },
        {
          phase: 'Fase 2',
          weeks: 'Semanas 5-8',
          exercises: [
            'Fortalecimento de flexores cervicais profundos',
            'Exercícios para serrátil anterior',
            'Correção postural ativa'
          ]
        }
      ],
      duration: '8 semanas',
      reminders: [
        'Ajuste altura do travesseiro',
        'Evite dormir de bruços',
        'Exercícios de aquecimento antes do treino'
      ]
    },
    {
      id: 'P03',
      name: 'Hiperlordose Lombar',
      cause: 'Encurtamento de flexores do quadril + fraqueza abdominal',
      symptoms: ['Dor lombar baixa', 'Rigidez matinal', 'Fadiga postural'],
      exercises: [
        {
          phase: 'Fase 1',
          weeks: 'Semanas 1-4',
          exercises: [
            'Alongamento de psoas (3x30s)',
            'Mobilização pélvica',
            'Ativação de core básico'
          ]
        },
        {
          phase: 'Fase 2',
          weeks: 'Semanas 5-8',
          exercises: [
            'Prancha frontal (3x30s)',
            'Dead bug (3x10 cada lado)',
            'Ponte glútea (3x15)'
          ]
        }
      ],
      duration: '10 semanas',
      reminders: [
        'Evite sapatos de salto alto',
        'Fortaleça glúteos regularmente',
        'Mantenha peso corporal adequado'
      ]
    },
    {
      id: 'P04',
      name: 'Síndrome do Cruzamento Inferior',
      cause: 'Desequilíbrio entre músculos flexores e extensores do quadril',
      symptoms: ['Dor lombar', 'Rigidez quadril', 'Alterações na marcha'],
      exercises: [
        {
          phase: 'Fase 1',
          weeks: 'Semanas 1-4',
          exercises: [
            'Liberação de TFL e IT band',
            'Alongamento de flexores do quadril',
            'Ativação de glúteo médio'
          ]
        },
        {
          phase: 'Fase 2',
          weeks: 'Semanas 5-8',
          exercises: [
            'Fortalecimento de glúteos',
            'Estabilização de core',
            'Exercícios funcionais'
          ]
        }
      ],
      duration: '8 semanas',
      reminders: [
        'Evite ficar muito tempo sentado',
        'Use apoio lombar',
        'Pratique caminhadas regulares'
      ]
    },
    {
      id: 'P05',
      name: 'Pé Pronado/Plano',
      cause: 'Fraqueza do tibial posterior + colapso do arco plantar',
      symptoms: ['Dor plantar', 'Fadiga em pé', 'Desvios nos joelhos'],
      exercises: [
        {
          phase: 'Fase 1',
          weeks: 'Semanas 1-4',
          exercises: [
            'Exercícios de consciência corporal do pé',
            'Fortalecimento de músculos intrínsecos',
            'Mobilização do tornozelo'
          ]
        },
        {
          phase: 'Fase 2',
          weeks: 'Semanas 5-8',
          exercises: [
            'Elevação de calcanhar (3x15)',
            'Caminhada na ponta dos pés (1 min/dia)',
            'Exercícios proprioceptivos'
          ]
        }
      ],
      duration: '12 semanas',
      reminders: [
        'Use calçados com suporte de arco',
        'Evite andar descalço em superfícies duras',
        'Considere palmilhas ortopédicas'
      ]
    }
  ];

  const getRecommendedProtocols = () => {
    const recommended = [];
    
    // Análise baseada nos dados posturais
    if (posturalData.thoracicKyphosis >= 2) {
      recommended.push('P01');
    }
    
    if (posturalData.headForward >= 2 || posturalData.shouldersProtracted >= 2) {
      recommended.push('P02');
    }
    
    if (posturalData.lumbarLordosis >= 2) {
      recommended.push('P03');
    }
    
    if (posturalData.pelvicAnteversion >= 2) {
      recommended.push('P04');
    }
    
    if (posturalData.flatFeet >= 2) {
      recommended.push('P05');
    }
    
    return recommended;
  };

  const recommendedProtocols = getRecommendedProtocols();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-600">Protocolos de Tratamento Recomendados</CardTitle>
          <p className="text-sm text-gray-600">
            Baseado na avaliação postural, os seguintes protocolos são recomendados:
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {protocols.map((protocol) => {
              const isRecommended = recommendedProtocols.includes(protocol.id);
              const isSelected = selectedProtocol === protocol.id;
              
              return (
                <div
                  key={protocol.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : isRecommended
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onProtocolSelect(protocol.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {protocol.id} - {protocol.name}
                      </h3>
                      {isRecommended && (
                        <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
                          Recomendado
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline">{protocol.duration}</Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Causa:</strong> {protocol.cause}
                  </p>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Sintomas:</p>
                    <div className="flex flex-wrap gap-1">
                      {protocol.symptoms.map((symptom, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="mt-4 space-y-3">
                      <h4 className="font-medium text-gray-900">Fases do Tratamento:</h4>
                      {protocol.exercises.map((phase, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <h5 className="font-medium text-blue-600 mb-2">
                            {phase.phase} ({phase.weeks})
                          </h5>
                          <ul className="space-y-1">
                            {phase.exercises.map((exercise, exIndex) => (
                              <li key={exIndex} className="text-sm text-gray-700">
                                • {exercise}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      
                      <div className="mt-3">
                        <h5 className="font-medium text-gray-900 mb-2">Lembretes:</h5>
                        <ul className="space-y-1">
                          {protocol.reminders.map((reminder, index) => (
                            <li key={index} className="text-sm text-gray-600">
                              ⚠️ {reminder}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {recommendedProtocols.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Nenhum protocolo específico recomendado. Avaliação indica postura dentro dos parâmetros normais.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Próximo: Ver Resultados
        </Button>
      </div>
    </div>
  );
};

export default TreatmentProtocols;
