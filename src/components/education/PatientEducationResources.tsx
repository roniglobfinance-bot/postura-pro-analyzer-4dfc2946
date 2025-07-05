
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Play, FileText, Award, CheckCircle, Clock, Target } from 'lucide-react';

interface EducationalContent {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'exercise' | 'quiz';
  duration: string;
  difficulty: 'básico' | 'intermediário' | 'avançado';
  category: string;
  completed?: boolean;
  progress?: number;
}

interface PatientEducationResourcesProps {
  patientConditions: string[];
  onProgressUpdate: (contentId: string, progress: number) => void;
}

const PatientEducationResources = ({ patientConditions, onProgressUpdate }: PatientEducationResourcesProps) => {
  const [completedContent, setCompletedContent] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('todos');

  const educationalContent: EducationalContent[] = [
    {
      id: '1',
      title: 'Entendendo sua Postura',
      description: 'Aprenda os conceitos básicos sobre postura e como ela afeta sua saúde.',
      type: 'video',
      duration: '5 min',
      difficulty: 'básico',
      category: 'fundamentos',
      progress: 0
    },
    {
      id: '2',
      title: 'Hipercifose: Causas e Tratamento',
      description: 'Tudo sobre hipercifose torácica, suas causas e opções de tratamento.',
      type: 'article',
      duration: '8 min',
      difficulty: 'intermediário',
      category: 'condições',
      progress: 0
    },
    {
      id: '3',
      title: 'Exercícios para Correção Cervical',
      description: 'Série de exercícios práticos para melhorar o alinhamento cervical.',
      type: 'exercise',
      duration: '15 min',
      difficulty: 'básico',
      category: 'exercícios',
      progress: 0
    },
    {
      id: '4',
      title: 'Ergonomia no Trabalho',
      description: 'Como configurar seu ambiente de trabalho para manter boa postura.',
      type: 'article',
      duration: '6 min',
      difficulty: 'básico',
      category: 'prevenção',
      progress: 0
    },
    {
      id: '5',
      title: 'Teste seus Conhecimentos',
      description: 'Quiz interativo sobre conceitos importantes de saúde postural.',
      type: 'quiz',
      duration: '10 min',
      difficulty: 'intermediário',
      category: 'avaliação',
      progress: 0
    },
    {
      id: '6',
      title: 'Fortalecimento do Core',
      description: 'Exercícios essenciais para fortalecer a musculatura estabilizadora.',
      type: 'exercise',
      duration: '20 min',
      difficulty: 'intermediário',
      category: 'exercícios',
      progress: 0
    },
    {
      id: '7',
      title: 'Respiração e Postura',
      description: 'A relação entre respiração adequada e alinhamento postural.',
      type: 'video',
      duration: '7 min',
      difficulty: 'básico',
      category: 'fundamentos',
      progress: 0
    },
    {
      id: '8',
      title: 'Escoliose: Mitos e Verdades',
      description: 'Desmistificando conceitos sobre escoliose e seu tratamento.',
      type: 'article',
      duration: '12 min',
      difficulty: 'avançado',
      category: 'condições',
      progress: 0
    }
  ];

  const categories = [
    { id: 'todos', name: 'Todos', icon: BookOpen },
    { id: 'fundamentos', name: 'Fundamentos', icon: Target },
    { id: 'condições', name: 'Condições', icon: FileText },
    { id: 'exercícios', name: 'Exercícios', icon: Play },
    { id: 'prevenção', name: 'Prevenção', icon: CheckCircle },
    { id: 'avaliação', name: 'Avaliação', icon: Award }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'exercise': return <Target className="h-4 w-4" />;
      case 'quiz': return <Award className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'básico': return 'bg-green-100 text-green-800';
      case 'intermediário': return 'bg-yellow-100 text-yellow-800';
      case 'avançado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredContent = selectedCategory === 'todos' 
    ? educationalContent 
    : educationalContent.filter(content => content.category === selectedCategory);

  const completionRate = Math.round((completedContent.size / educationalContent.length) * 100);

  const handleContentComplete = (contentId: string) => {
    const newCompleted = new Set(completedContent);
    newCompleted.add(contentId);
    setCompletedContent(newCompleted);
    onProgressUpdate(contentId, 100);
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Recursos Educativos
            </span>
            <Badge variant="secondary">
              {completedContent.size}/{educationalContent.length} concluídos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso Geral</span>
              <span>{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Category Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContent.map(content => {
          const isCompleted = completedContent.has(content.id);
          return (
            <Card key={content.id} className={`transition-all hover:shadow-md ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(content.type)}
                    <Badge className={getDifficultyColor(content.difficulty)}>
                      {content.difficulty}
                    </Badge>
                  </div>
                  {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
                </div>
                <CardTitle className="text-lg">{content.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{content.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {content.duration}
                  </div>
                  <Badge variant="outline">{content.category}</Badge>
                </div>

                {content.progress !== undefined && content.progress > 0 && content.progress < 100 && (
                  <div className="mb-3">
                    <Progress value={content.progress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">{content.progress}% concluído</p>
                  </div>
                )}

                <Button
                  className="w-full"
                  variant={isCompleted ? 'outline' : 'default'}
                  onClick={() => !isCompleted && handleContentComplete(content.id)}
                  disabled={isCompleted}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Concluído
                    </>
                  ) : (
                    <>
                      {getTypeIcon(content.type)}
                      <span className="ml-2">
                        {content.type === 'video' && 'Assistir'}
                        {content.type === 'article' && 'Ler'}
                        {content.type === 'exercise' && 'Praticar'}
                        {content.type === 'quiz' && 'Responder'}
                      </span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recommended Content Based on Conditions */}
      {patientConditions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Recomendado para Você
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Com base em suas condições posturais identificadas, recomendamos:
            </p>
            <div className="space-y-3">
              {patientConditions.map((condition, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900">{condition}</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Sugerimos focar nos conteúdos sobre exercícios específicos e fundamentos posturais.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg text-center ${completedContent.size >= 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
              <div className="text-2xl mb-1">🎯</div>
              <div className="font-medium">Primeiro Passo</div>
              <div className="text-xs">Complete 1 conteúdo</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${completedContent.size >= 3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
              <div className="text-2xl mb-1">📚</div>
              <div className="font-medium">Estudioso</div>
              <div className="text-xs">Complete 3 conteúdos</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${completedContent.size >= 5 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
              <div className="text-2xl mb-1">🏆</div>
              <div className="font-medium">Dedicado</div>
              <div className="text-xs">Complete 5 conteúdos</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${completionRate === 100 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
              <div className="text-2xl mb-1">👑</div>
              <div className="font-medium">Mestre</div>
              <div className="text-xs">Complete todos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientEducationResources;
