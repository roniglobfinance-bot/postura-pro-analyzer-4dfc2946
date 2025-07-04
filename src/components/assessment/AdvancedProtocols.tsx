
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface Protocol {
  code: string;
  name: string;
  cause: string;
  symptoms: string[];
  keyExercises: string[];
  duration: string;
  reminders: string[];
  category: 'postural' | 'neurological' | 'orthopedic' | 'degenerative' | 'functional';
  complexity: 'basic' | 'intermediate' | 'advanced';
  phases?: {
    phase: string;
    weeks: string;
    exercises: string[];
  }[];
}

const AdvancedProtocols = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allProtocols: Protocol[] = [
    // Protocolos Posturais (P01-P20)
    {
      code: 'P01',
      name: 'Correção de Hipercifose Torácica',
      cause: 'Fraqueza dos extensores torácicos + postura sentada prolongada',
      symptoms: ['Dor interescapular', 'Respiração curta', 'Ombros curvados para frente'],
      keyExercises: [
        'Liberação peitoral com rolo (2x/dia, 1 minuto)',
        'Extensão torácica sobre foam roller (3x10 reps)',
        'Superman hold progressivo (15s → 45s)'
      ],
      duration: '8 semanas',
      reminders: ['A cada 1h sentado, faça 2 minutos de correção postural'],
      category: 'postural',
      complexity: 'basic'
    },
    {
      code: 'P02',
      name: 'Alinhamento de Cabeça Anterior',
      cause: 'Uso excessivo de dispositivos móveis',
      symptoms: ['Dor na nuca', 'Cefaleia tensional'],
      keyExercises: [
        'Chin tuck contra resistência manual (3x12 reps)',
        'Flexão cervical isométrica (4x20s)'
      ],
      duration: '6 semanas',
      reminders: ['Ajuste a tela na altura dos olhos'],
      category: 'postural',
      complexity: 'basic'
    },
    {
      code: 'P23',
      name: 'Disfunção ATM Postural',
      cause: 'Tensão muscular cervical/palatal',
      symptoms: ['Dor mandibular', 'Bruxismo'],
      keyExercises: [
        'Auto-massagem masseter (2x/dia)',
        'Alongamento cervical lateral (3x30s)'
      ],
      duration: '6 semanas',
      reminders: ['Evite mascar chicletes'],
      category: 'postural',
      complexity: 'intermediate'
    },
    // Protocolos Neurológicos (P28, P42, P46, P48, P49, P50)
    {
      code: 'P28',
      name: 'Marcha Parkinsoniana',
      cause: 'Rigidez basal',
      symptoms: ['Passos curtos arrastados'],
      keyExercises: [
        'Marcha com marcações no chão',
        'Balanço pendular de braços'
      ],
      duration: '16 semanas',
      reminders: ['Pratique diariamente em casa'],
      category: 'neurological',
      complexity: 'advanced'
    },
    {
      code: 'P42',
      name: 'Paralisia Facial Periférica',
      cause: 'Comprometimento nervo VII',
      symptoms: ['Assimetria facial'],
      keyExercises: [
        'Biofeedback muscular',
        'Massagem de drenagem'
      ],
      duration: '8 semanas',
      reminders: ['Proteja o olho afetado'],
      category: 'neurological',
      complexity: 'advanced'
    },
    {
      code: 'P50',
      name: 'Reabilitação Pós-ACV',
      cause: 'Sequelas neurológicas',
      symptoms: ['Hemiparesia'],
      keyExercises: [
        'Terapia por restrição',
        'Padrões sinérgicos'
      ],
      duration: '36 semanas',
      reminders: ['Supervisão médica contínua'],
      category: 'neurological',
      complexity: 'advanced'
    },
    // Protocolos Ortopédicos (P31-P45)
    {
      code: 'P31',
      name: 'Capsulite Adesiva',
      cause: 'Rigidez articular glenoumeral',
      symptoms: ['Perda ativa/passiva de movimento'],
      keyExercises: [
        'Pêndulos de Codman',
        'Escalada digital na parede'
      ],
      duration: '18 semanas',
      reminders: ['Respeite os limites de dor'],
      category: 'orthopedic',
      complexity: 'intermediate'
    },
    {
      code: 'P33',
      name: 'Tendinopatia Patelar',
      cause: 'Overuse do mecanismo extensor',
      symptoms: ['Dor abaixo da patela'],
      keyExercises: [
        'Agachamento excêntrico (25°)',
        'Isometria em extensão'
      ],
      duration: '10 semanas',
      reminders: ['Evite saltos nas primeiras semanas'],
      category: 'orthopedic',
      complexity: 'intermediate'
    },
    // Protocolos Degenerativos (P38, P40, P47)
    {
      code: 'P38',
      name: 'Osteoartrose Joelho',
      cause: 'Degeneração cartilaginosa',
      symptoms: ['Dor ao peso'],
      keyExercises: [
        'Cadeia cinética fechada',
        'Hidroterapia'
      ],
      duration: '12 semanas',
      reminders: ['Controle o peso corporal'],
      category: 'degenerative',
      complexity: 'basic'
    },
    {
      code: 'P47',
      name: 'Osteoporose Senil',
      cause: 'Perda massa óssea',
      symptoms: ['Fraturas por fragilidade'],
      keyExercises: [
        'Carga axial progressiva',
        'Equilíbrio dinâmico'
      ],
      duration: '24 semanas',
      reminders: ['Suplementação de cálcio'],
      category: 'degenerative',
      complexity: 'basic'
    },
    // Protocolos Funcionais (P15, P27, P35-P37)
    {
      code: 'P15',
      name: 'Valgo Dinâmico',
      cause: 'Padrão de movimento errado',
      symptoms: ['Joelhos para dentro ao agachar'],
      keyExercises: [
        'Agachamento com feedback',
        'Step-up lateral'
      ],
      duration: '10 semanas',
      reminders: ['Monitore padrão durante exercícios'],
      category: 'functional',
      complexity: 'intermediate'
    }
  ];

  const filteredProtocols = allProtocols.filter(protocol => {
    const matchesSearch = protocol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         protocol.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || protocol.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'postural': return '🧍';
      case 'neurological': return '🧠';
      case 'orthopedic': return '🦴';
      case 'degenerative': return '⏳';
      case 'functional': return '⚡';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Biblioteca Completa de Protocolos SAARS
          </CardTitle>
          <p className="text-sm text-gray-600">
            50 protocolos especializados para diferentes condições posturais e funcionais
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar protocolo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as categorias</option>
                <option value="postural">Posturais</option>
                <option value="neurological">Neurológicos</option>
                <option value="orthopedic">Ortopédicos</option>
                <option value="degenerative">Degenerativos</option>
                <option value="functional">Funcionais</option>
              </select>
            </div>
          </div>

          <Tabs defaultValue="grid" className="space-y-4">
            <TabsList>
              <TabsTrigger value="grid">Visualização em Grade</TabsTrigger>
              <TabsTrigger value="detailed">Visualização Detalhada</TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProtocols.map((protocol) => (
                  <Card key={protocol.code} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-sm">
                            {getCategoryIcon(protocol.category)} {protocol.code}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">{protocol.name}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getComplexityColor(protocol.complexity)}
                        >
                          {protocol.complexity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600">
                          <strong>Causa:</strong> {protocol.cause}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {protocol.duration}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {protocol.symptoms.slice(0, 2).map((symptom, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                          {protocol.symptoms.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{protocol.symptoms.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="detailed">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredProtocols.map((protocol) => (
                    <Card key={protocol.code} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {getCategoryIcon(protocol.category)} {protocol.code} - {protocol.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Causa:</strong> {protocol.cause}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{protocol.duration}</Badge>
                          <Badge 
                            variant="outline" 
                            className={getComplexityColor(protocol.complexity)}
                          >
                            {protocol.complexity}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Sintomas:</h4>
                          <ul className="space-y-1">
                            {protocol.symptoms.map((symptom, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start">
                                <span className="text-red-500 mr-2">•</span>
                                {symptom}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Exercícios-Chave:</h4>
                          <ul className="space-y-1">
                            {protocol.keyExercises.map((exercise, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                {exercise}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Lembretes Importantes:
                        </h4>
                        {protocol.reminders.map((reminder, idx) => (
                          <p key={idx} className="text-sm text-yellow-800">
                            ⚠️ {reminder}
                          </p>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedProtocols;
