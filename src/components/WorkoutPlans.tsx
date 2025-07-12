
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  Edit3, 
  Plus, 
  Clock, 
  Target, 
  Users, 
  Watch,
  Smartphone,
  Heart,
  Activity,
  BookOpen,
  Trophy,
  ChevronRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  duration: number;
  targetMuscles: string[];
  equipment: string[];
  videoUrl?: string;
  instructions: string[];
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  duration: number;
  exercises: Exercise[];
  targetConditions: string[];
  isEditable: boolean;
}

interface StudentPortalData {
  studentId: string;
  name: string;
  currentPlan: WorkoutPlan | null;
  progress: {
    completedWorkouts: number;
    totalWorkouts: number;
    weeklyGoal: number;
    streak: number;
  };
  wearableData?: {
    heartRate: number;
    steps: number;
    caloriesBurned: number;
    activeMinutes: number;
  };
}

const WorkoutPlans: React.FC = () => {
  const [activeTab, setActiveTab] = useState('library');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [students, setStudents] = useState<StudentPortalData[]>([]);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [wearableConnected, setWearableConnected] = useState(false);

  useEffect(() => {
    // Inicializar dados
    initializeData();
  }, []);

  const initializeData = () => {
    // Biblioteca expandida de exercícios
    const exerciseLibrary: Exercise[] = [
      {
        id: '1',
        name: 'Alongamento Cervical Lateral',
        description: 'Exercício para reduzir tensão cervical e melhorar mobilidade do pescoço',
        category: 'Mobilidade',
        difficulty: 'Iniciante',
        duration: 3,
        targetMuscles: ['Trapézio superior', 'Esternocleidomastóideo', 'Escalenos'],
        equipment: [],
        instructions: [
          'Sente-se com a coluna ereta',
          'Incline a cabeça para o lado direito',
          'Mantenha por 30 segundos',
          'Repita para o lado esquerdo'
        ]
      },
      {
        id: '2',
        name: 'Fortalecimento Core - Prancha',
        description: 'Exercício isométrico para fortalecimento do core e estabilização lombar',
        category: 'Fortalecimento',
        difficulty: 'Intermediário',
        duration: 5,
        targetMuscles: ['Reto abdominal', 'Transverso do abdome', 'Multífidos'],
        equipment: ['Tapete'],
        instructions: [
          'Posição de prancha com antebraços no chão',
          'Mantenha o corpo alinhado',
          'Contraia o abdome',
          'Respire normalmente'
        ]
      },
      {
        id: '3',
        name: 'Mobilização Torácica',
        description: 'Exercício para melhorar a mobilidade da coluna torácica',
        category: 'Mobilidade',
        difficulty: 'Iniciante',
        duration: 4,
        targetMuscles: ['Músculos intercostais', 'Serrátil anterior'],
        equipment: ['Bastão ou toalha'],
        instructions: [
          'Em pé, segure um bastão com as duas mãos',
          'Eleve os braços acima da cabeça',
          'Faça rotações lentas do tronco',
          'Mantenha os pés fixos'
        ]
      },
      {
        id: '4',
        name: 'Estabilização Lombar - Dead Bug',
        description: 'Exercício avançado para estabilização lombar e coordenação',
        category: 'Estabilização',
        difficulty: 'Avançado',
        duration: 8,
        targetMuscles: ['Transverso do abdome', 'Diafragma', 'Multífidos'],
        equipment: ['Tapete'],
        instructions: [
          'Deite de costas, joelhos flexionados a 90°',
          'Estenda alternadamente braço e perna opostos',
          'Mantenha a lombar neutra',
          'Movimento lento e controlado'
        ]
      },
      {
        id: '5',
        name: 'Correção Postural - Wall Sit',
        description: 'Exercício para correção da postura e fortalecimento de glúteos',
        category: 'Correção Postural',
        difficulty: 'Intermediário',
        duration: 6,
        targetMuscles: ['Glúteo máximo', 'Quadríceps', 'Core'],
        equipment: ['Parede'],
        instructions: [
          'Encoste as costas na parede',
          'Deslize até posição de agachamento',
          'Mantenha joelhos a 90°',
          'Respire profundamente'
        ]
      }
    ];

    const defaultPlans: WorkoutPlan[] = [
      {
        id: '1',
        name: 'Correção Postural - Cervical',
        description: 'Plano focado na correção de desvios cervicais e redução de tensão',
        difficulty: 'Iniciante',
        duration: 15,
        exercises: [exerciseLibrary[0], exerciseLibrary[2]],
        targetConditions: ['Hipercifose', 'Protrusão cervical'],
        isEditable: true
      },
      {
        id: '2',
        name: 'Fortalecimento Core Avançado',
        description: 'Programa intensivo para fortalecimento do core e estabilização',
        difficulty: 'Avançado',
        duration: 25,
        exercises: [exerciseLibrary[1], exerciseLibrary[3], exerciseLibrary[4]],
        targetConditions: ['Hiperlordose lombar', 'Instabilidade pélvica'],
        isEditable: true
      }
    ];

    const studentData: StudentPortalData[] = [
      {
        studentId: '1',
        name: 'Maria Silva',
        currentPlan: defaultPlans[0],
        progress: {
          completedWorkouts: 8,
          totalWorkouts: 12,
          weeklyGoal: 3,
          streak: 5
        },
        wearableData: {
          heartRate: 72,
          steps: 8420,
          caloriesBurned: 285,
          activeMinutes: 45
        }
      },
      {
        studentId: '2',
        name: 'João Santos',
        currentPlan: defaultPlans[1],
        progress: {
          completedWorkouts: 15,
          totalWorkouts: 20,
          weeklyGoal: 4,
          streak: 12
        },
        wearableData: {
          heartRate: 68,
          steps: 12340,
          caloriesBurned: 420,
          activeMinutes: 65
        }
      }
    ];

    setExercises(exerciseLibrary);
    setWorkoutPlans(defaultPlans);
    setStudents(studentData);
  };

  const handleCreatePlan = () => {
    const newPlan: WorkoutPlan = {
      id: Date.now().toString(),
      name: 'Novo Plano',
      description: 'Descrição do plano',
      difficulty: 'Iniciante',
      duration: 15,
      exercises: [],
      targetConditions: [],
      isEditable: true
    };
    setEditingPlan(newPlan);
  };

  const handleSavePlan = (plan: WorkoutPlan) => {
    if (workoutPlans.find(p => p.id === plan.id)) {
      setWorkoutPlans(prev => prev.map(p => p.id === plan.id ? plan : p));
    } else {
      setWorkoutPlans(prev => [...prev, plan]);
    }
    setEditingPlan(null);
  };

  const connectWearable = () => {
    // Simulação de conexão com dispositivo wearable
    setWearableConnected(!wearableConnected);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Planos de Treino Personalizados</h2>
          <p className="text-muted-foreground">Gerencie exercícios, planos e acompanhe o progresso dos alunos</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={connectWearable} variant={wearableConnected ? "default" : "outline"}>
            <Watch className="w-4 h-4 mr-2" />
            {wearableConnected ? 'Conectado' : 'Conectar Wearable'}
          </Button>
          <Button onClick={handleCreatePlan}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="library">Biblioteca de Exercícios</TabsTrigger>
          <TabsTrigger value="plans">Planos de Treino</TabsTrigger>
          <TabsTrigger value="students">Portal dos Alunos</TabsTrigger>
          <TabsTrigger value="wearable">Dispositivos Conectados</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise) => (
              <Card key={exercise.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <Badge variant={exercise.difficulty === 'Iniciante' ? 'secondary' : 
                                 exercise.difficulty === 'Intermediário' ? 'default' : 'destructive'}>
                      {exercise.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{exercise.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {exercise.duration} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {exercise.category}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Músculos Alvo:</Label>
                    <div className="flex flex-wrap gap-1">
                      {exercise.targetMuscles.map((muscle, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Instruções:</Label>
                    <ol className="text-xs space-y-1">
                      {exercise.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="font-medium">{index + 1}.</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Ver Demonstração
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {workoutPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={plan.difficulty === 'Iniciante' ? 'secondary' : 
                                   plan.difficulty === 'Intermediário' ? 'default' : 'destructive'}>
                        {plan.difficulty}
                      </Badge>
                      {plan.isEditable && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPlan(plan)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {plan.duration} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="w-4 h-4" />
                      {plan.exercises.length} exercícios
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Condições Alvo:</Label>
                    <div className="flex flex-wrap gap-1">
                      {plan.targetConditions.map((condition, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Exercícios:</Label>
                    <div className="space-y-1">
                      {plan.exercises.map((exercise, index) => (
                        <div key={exercise.id} className="flex items-center gap-2 text-xs">
                          <span className="font-medium">{index + 1}.</span>
                          <span>{exercise.name}</span>
                          <span className="text-muted-foreground">({exercise.duration}min)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {students.map((student) => (
              <Card key={student.studentId} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <Button variant="outline" size="sm">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Ver Portal
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {student.currentPlan && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Plano Atual:</Label>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{student.currentPlan.name}</span>
                        <Badge variant="outline">{student.currentPlan.difficulty}</Badge>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Progresso:</Label>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          <span>Treinos: {student.progress.completedWorkouts}/{student.progress.totalWorkouts}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${(student.progress.completedWorkouts / student.progress.totalWorkouts) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span>Meta Semanal: {student.progress.weeklyGoal}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          <span>Sequência: {student.progress.streak} dias</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {student.wearableData && wearableConnected && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Dados do Wearable:</Label>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span>{student.wearableData.heartRate} bpm</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4 text-blue-500" />
                          <span>{student.wearableData.steps.toLocaleString()} passos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4 text-orange-500" />
                          <span>{student.wearableData.caloriesBurned} cal</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span>{student.wearableData.activeMinutes} min ativos</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wearable" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Watch className="w-5 h-5" />
                Dispositivos Wearable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${wearableConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="font-medium">Apple Watch / Fitbit / Garmin</p>
                    <p className="text-sm text-muted-foreground">
                      {wearableConnected ? 'Conectado e sincronizando' : 'Desconectado'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={wearableConnected}
                  onCheckedChange={connectWearable}
                />
              </div>

              {wearableConnected && (
                <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Dados Sincronizados:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>Frequência cardíaca em tempo real</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span>Contagem de passos diária</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-orange-500" />
                      <span>Calorias queimadas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span>Minutos de atividade</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Os dados são sincronizados automaticamente e integrados aos relatórios de progresso dos alunos.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">Dispositivos Suportados:</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span>Apple Watch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Watch className="w-4 h-4" />
                    <span>Fitbit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>Garmin</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editingPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Editar Plano de Treino</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Plano</Label>
                  <Input
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Dificuldade</Label>
                  <Select
                    value={editingPlan.difficulty}
                    onValueChange={(value: any) => setEditingPlan({...editingPlan, difficulty: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Iniciante">Iniciante</SelectItem>
                      <SelectItem value="Intermediário">Intermediário</SelectItem>
                      <SelectItem value="Avançado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({...editingPlan, description: e.target.value})}
                />
              </div>

              <div>
                <Label>Duração Total (minutos)</Label>
                <Input
                  type="number"
                  value={editingPlan.duration}
                  onChange={(e) => setEditingPlan({...editingPlan, duration: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label>Exercícios Selecionados:</Label>
                <div className="border rounded p-3 space-y-2 max-h-32 overflow-y-auto">
                  {editingPlan.exercises.map((exercise, index) => (
                    <div key={exercise.id} className="flex items-center justify-between text-sm">
                      <span>{exercise.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newExercises = editingPlan.exercises.filter((_, i) => i !== index);
                          setEditingPlan({...editingPlan, exercises: newExercises});
                        }}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adicionar Exercícios:</Label>
                <div className="grid gap-2 max-h-32 overflow-y-auto border rounded p-2">
                  {exercises
                    .filter(ex => !editingPlan.exercises.find(e => e.id === ex.id))
                    .map((exercise) => (
                    <div key={exercise.id} className="flex items-center justify-between text-sm p-2 hover:bg-secondary rounded">
                      <span>{exercise.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPlan({
                            ...editingPlan,
                            exercises: [...editingPlan.exercises, exercise]
                          });
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleSavePlan(editingPlan)}>
                  Salvar Plano
                </Button>
                <Button variant="outline" onClick={() => setEditingPlan(null)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkoutPlans;
