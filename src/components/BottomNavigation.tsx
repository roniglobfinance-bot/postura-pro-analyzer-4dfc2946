
import { useState } from 'react';
import { Home, BarChart3, Dumbbell, User, Camera, Brain } from 'lucide-react';

interface BottomNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const BottomNavigation = ({ currentView, onViewChange }: BottomNavigationProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'diagnostic', label: 'Diagnóstico', icon: Brain },
    { id: 'photo-docs', label: 'Análise', icon: Camera },
    { id: 'progress', label: 'Relatório', icon: BarChart3 },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 transition-colors ${
                isActive ? 'text-[#2E5A88]' : 'text-gray-500'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-[#2E5A88]' : 'text-gray-500'}`} />
              <span className={`text-xs truncate ${isActive ? 'text-[#2E5A88] font-medium' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
