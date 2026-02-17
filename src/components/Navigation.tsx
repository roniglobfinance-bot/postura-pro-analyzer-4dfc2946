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
    { id: 'clients', label: 'Alunos', icon: Users },
    { id: 'assessment-wizard', label: 'Avaliações', icon: Scan },
    { id: 'results-hud', label: 'Resultados', icon: BarChart3 },
    { id: 'plan-builder', label: 'Plano', icon: Brain },
    { id: 'session-tracker', label: 'Sessões', icon: Camera },
    { id: 'protocol-library', label: 'Biblioteca', icon: BookOpen },
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
