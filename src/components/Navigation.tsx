import { Button } from '@/components/ui/button';
import { 
  Camera, 
  FileText, 
  Users, 
  Settings,
  User,
  BarChart3,
  BookOpen,
  Home,
  Scan,
  Brain
} from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation = ({ activeSection, onSectionChange }: NavigationProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'photo-docs', label: 'Documentação Fotográfica', icon: Camera },
    { id: 'assessment', label: 'Avaliação Postural', icon: FileText },
    { id: 'diagnostic', label: 'Motor de Diagnóstico', icon: Brain },
    { id: 'advanced-analysis', label: 'Análise Avançada IA', icon: Scan },
    { id: 'progress', label: 'Relatórios', icon: BarChart3 },
    { id: 'workouts', label: 'Exercícios', icon: BookOpen },
    { id: 'clients', label: 'Gerenciar Alunos', icon: Users },
    { id: 'system-summary', label: 'Status do Sistema', icon: Settings },
    { id: 'profile', label: 'Perfil', icon: User }
  ];

  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-6 px-4 py-6 bg-gradient-to-br from-[#2E5A88] to-[#4CAF50] rounded-lg text-white">
        <h2 className="text-xl font-bold mb-1">PosturaPro</h2>
        <p className="text-sm opacity-90">Sistema de Análise</p>
      </div>
      
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
