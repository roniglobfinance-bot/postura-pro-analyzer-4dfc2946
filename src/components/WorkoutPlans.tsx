
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Play, CheckCircle, Crown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const WorkoutPlans = () => {
  const [completedWorkouts, setCompletedWorkouts] = useState(2);
  const [userPlan, setUserPlan] = useState('free'); // free, pro, premium
  
  const workouts = [
    {
      id: 1,
      title: 'Correção Postural - Cervical',
      duration: '15 min',
      difficulty: 'Iniciante',
      description: 'Exercícios específicos para corrigir a postura cervical',
      isLocked: false
    },
    {
      id: 2,
      title: 'Fortalecimento Core',
      duration: '20 min',
      difficulty: 'Intermediário',
      description: 'Exercícios para fortalecer a musculatura do core',
      isLocked: false
    },
    {
      id: 3,
      title: 'Mobilidade Torácica',
      duration: '12 min',
      difficulty: 'Iniciante',
      description: 'Melhore a mobilidade da coluna torácica',
      isLocked: completedWorkouts >= 3 && userPlan === 'free'
    },
    {
      id: 4,
      title: 'Estabilização Lombar',
      duration: '25 min',
      difficulty: 'Avançado',
      description: 'Exercícios avançados para estabilização lombar',
      isLocked: completedWorkouts >= 3 && userPlan === 'free'
    }
  ];

  const handleStartWorkout = (workout: any) => {
    if (workout.isLocked) {
      toast({
        title: "Treino Bloqueado! 🔒",
        description: "Quer treinos ilimitados? Ative o plano Pro!",
        action: (
          <Button 
            size="sm" 
            className="bg-[#2E5A88] hover:bg-[#1e3a5f]"
            onClick={() => window.open('#pricing', '_self')}
          >
            Ver Planos
          </Button>
        )
      });
      return;
    }
    
    setCompletedWorkouts(prev => prev + 1);
    toast({
      title: "Treino Iniciado! 🏋️‍♂️",
      description: `Começando: ${workout.title}`,
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Treinos Personalizados</h2>
          <p className="text-gray-600">Baseados na sua avaliação postural SAARS</p>
        </div>
        {userPlan === 'free' && (
          <Badge variant="outline" className="bg-[#4CAF50] text-white border-[#4CAF50]">
            Plano Gratuito
          </Badge>
        )}
      </div>

      {userPlan === 'free' && (
        <Card className="border-[#2E5A88] bg-gradient-to-r from-[#2E5A88]/5 to-[#4CAF50]/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#2E5A88]">
                  Treinos realizados: {completedWorkouts}/3
                </p>
                <p className="text-sm text-gray-600">
                  {3 - completedWorkouts} treinos restantes no plano gratuito
                </p>
              </div>
              <Button 
                size="sm" 
                className="bg-[#2E5A88] hover:bg-[#1e3a5f]"
                onClick={() => window.open('#pricing', '_self')}
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade
              </Button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-[#4CAF50] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedWorkouts / 3) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workouts.map((workout) => (
          <Card key={workout.id} className={`${workout.isLocked ? 'opacity-60' : ''} hover:shadow-lg transition-shadow`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  {workout.isLocked && <Lock className="h-4 w-4 mr-2 text-gray-400" />}
                  {workout.title}
                </CardTitle>
                <Badge variant={workout.difficulty === 'Iniciante' ? 'secondary' : workout.difficulty === 'Intermediário' ? 'default' : 'destructive'}>
                  {workout.difficulty}
                </Badge>
              </div>
              <CardDescription>{workout.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">⏱️ {workout.duration}</span>
                <Button 
                  onClick={() => handleStartWorkout(workout)}
                  className={`${workout.isLocked ? 'bg-gray-400' : 'bg-[#2E5A88] hover:bg-[#1e3a5f]'}`}
                  disabled={workout.isLocked}
                >
                  {workout.isLocked ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Bloqueado
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {completedWorkouts >= 3 && userPlan === 'free' && (
        <Card className="border-[#2E5A88] bg-gradient-to-r from-[#2E5A88]/10 to-[#4CAF50]/10">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-[#4CAF50] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#2E5A88] mb-2">
              Parabéns! Você completou seus treinos gratuitos! 🎉
            </h3>
            <p className="text-gray-600 mb-4">
              Continue sua jornada de correção postural com treinos ilimitados
            </p>
            <Button 
              className="bg-[#2E5A88] hover:bg-[#1e3a5f]"
              onClick={() => window.open('#pricing', '_self')}
            >
              <Crown className="h-4 w-4 mr-2" />
              Ativar Plano Pro
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkoutPlans;
