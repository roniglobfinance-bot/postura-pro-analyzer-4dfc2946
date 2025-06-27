
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, CreditCard, HelpCircle, LogOut, Crown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const UserProfile = () => {
  const [userPlan] = useState('free'); // Simular plano do usuário
  
  const userData = {
    name: 'João Silva',
    email: 'joao.silva@email.com',
    joinDate: '15 de Janeiro, 2024',
    completedWorkouts: 12,
    assessments: 3
  };

  const menuItems = [
    {
      icon: Settings,
      title: 'Configurações',
      description: 'Preferências e notificações',
      action: () => toast({ title: "Em desenvolvimento", description: "Esta funcionalidade será implementada em breve." })
    },
    {
      icon: CreditCard,
      title: 'Planos e Pagamentos',
      description: 'Gerencie sua assinatura',
      action: () => window.open('#pricing', '_self')
    },
    {
      icon: HelpCircle,
      title: 'Ajuda e Suporte',
      description: 'Central de ajuda e FAQ',
      action: () => window.open('https://wa.me/5511999999999?text=Olá! Preciso de ajuda com o app de postura.', '_blank')
    },
    {
      icon: LogOut,
      title: 'Sair',
      description: 'Fazer logout da conta',
      action: () => toast({ title: "Logout realizado", description: "Você foi desconectado com sucesso." })
    }
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
        <p className="text-gray-600">Gerencie sua conta e configurações</p>
      </div>

      {/* Informações do usuário */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-[#2E5A88] text-white text-xl">
                {userData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{userData.name}</h3>
              <p className="text-gray-600">{userData.email}</p>
              <p className="text-sm text-gray-500">Membro desde {userData.joinDate}</p>
            </div>
            <div className="text-right">
              <Badge 
                className={`${
                  userPlan === 'free' 
                    ? 'bg-[#4CAF50]' 
                    : userPlan === 'pro' 
                      ? 'bg-[#2E5A88]' 
                      : 'bg-gradient-to-r from-[#2E5A88] to-[#4CAF50]'
                } text-white`}
              >
                {userPlan === 'free' && 'Plano Gratuito'}
                {userPlan === 'pro' && (
                  <>
                    <Crown className="h-3 w-3 mr-1" />
                    Plano Pro
                  </>
                )}
                {userPlan === 'premium' && (
                  <>
                    <Crown className="h-3 w-3 mr-1" />
                    Plano Premium
                  </>
                )}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-[#2E5A88]">{userData.completedWorkouts}</div>
            <p className="text-gray-600">Treinos Realizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-[#4CAF50]">{userData.assessments}</div>
            <p className="text-gray-600">Avaliações Feitas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-500">85%</div>
            <p className="text-gray-600">Melhoria Postural</p>
          </CardContent>
        </Card>
      </div>

      {/* Menu de opções */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações da Conta</CardTitle>
          <CardDescription>Gerencie suas preferências e configurações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={item.action}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-[#2E5A88]" />
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="text-gray-400">→</div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Upgrade para plano pago */}
      {userPlan === 'free' && (
        <Card className="border-[#2E5A88] bg-gradient-to-r from-[#2E5A88]/5 to-[#4CAF50]/5">
          <CardContent className="p-6 text-center">
            <Crown className="h-12 w-12 text-[#2E5A88] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#2E5A88] mb-2">
              Maximize seus Resultados! 🚀
            </h3>
            <p className="text-gray-600 mb-4">
              Upgrade para o Plano Pro e tenha acesso a treinos ilimitados e análises avançadas
            </p>
            <Button 
              className="bg-[#2E5A88] hover:bg-[#1e3a5f]"
              onClick={() => window.open('#pricing', '_self')}
            >
              <Crown className="h-4 w-4 mr-2" />
              Fazer Upgrade
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserProfile;
