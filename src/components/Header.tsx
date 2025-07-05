
import { Button } from '@/components/ui/button';
import { Bell, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#2E5A88]">PosturaPro</h1>
            <p className="text-sm text-gray-600">Sistema de Análise Postural</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="text-right">
            <p className="text-sm font-medium">Sistema Ativo</p>
            <p className="text-xs text-gray-500">Versão 2.0</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
