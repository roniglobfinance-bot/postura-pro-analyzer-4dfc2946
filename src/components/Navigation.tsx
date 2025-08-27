
import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  FileText, 
  Users, 
  Settings,
  User,
  BarChart3,
  BookOpen,
  Home
} from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation = ({ activeSection, onSectionChange }: NavigationProps) => {
  const [userProfile] = useState({
    name: 'Usuário PosturaPro',
    role: 'teacher' as 'teacher' | 'student'
  });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'photo-docs', label: 'Documentação Fotográfica', icon: Camera },
    { id: 'assessment', label: 'Avaliação Postural', icon: FileText },
    { id: 'progress', label: 'Relatórios', icon: BarChart3 },
    { id: 'workouts', label: 'Exercícios', icon: BookOpen },
    { id: 'clients', label: 'Gerenciar Alunos', icon: Users },
    { id: 'system-summary', label: 'Status do Sistema', icon: Settings },
    { id: 'profile', label: 'Perfil', icon: User }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <Card className="mb-4">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>
                {getInitials(userProfile.name)}
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
      </div>
    </nav>
  );
};

export default Navigation;
