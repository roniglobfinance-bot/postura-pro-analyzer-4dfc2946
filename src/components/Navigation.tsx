import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  User,
  BarChart3,
  BookOpen,
  Home
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation = ({ activeSection, onSectionChange }: NavigationProps) => {
  const { user, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState({
    name: user?.user_metadata?.full_name || user?.email || 'Usuário',
    role: user?.user_metadata?.role || 'student',
    avatar: user?.user_metadata?.avatar_url
  });

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'photo-docs', label: 'Documentação Fotográfica', icon: Camera },
    { id: 'assessment', label: 'Avaliação Postural', icon: FileText },
    { id: 'progress', label: 'Relatórios', icon: BarChart3 },
    { id: 'workouts', label: 'Exercícios', icon: BookOpen },
    ...(userProfile.role === 'teacher' ? [
      { id: 'clients', label: 'Gerenciar Alunos', icon: Users }
    ] : []),
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <Card className="mb-4">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={userProfile.avatar} />
              <AvatarFallback>
                {userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">{userProfile.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={userProfile.role === 'teacher' ? 'default' : 'secondary'}>
                  {userProfile.role === 'teacher' ? 'Professor' : 'Aluno'}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <div className="space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onSectionChange(item.id)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        ))}
        
        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
