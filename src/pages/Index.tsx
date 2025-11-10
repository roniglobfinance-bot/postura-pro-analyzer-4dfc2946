
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import RoleDashboard from '@/components/RoleDashboard';
import ClientManagement from '@/components/ClientManagement';
import PosturalAssessment from '@/components/PosturalAssessment';
import PhotoDocumentation from '@/components/PhotoDocumentation';
import ProgressReports from '@/components/ProgressReports';
import WorkoutPlans from '@/components/WorkoutPlans';
import PricingPlans from '@/components/PricingPlans';
import UserProfile from '@/components/UserProfile';
import SystemSummary from '@/components/SystemSummary';
import AdvancedPosturalAnalysis from '@/components/AdvancedPosturalAnalysis';

const Index = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [userRole] = useState<'teacher' | 'student'>('teacher');

  console.log('Index - currentView:', currentView);

  // Verificar se há uma avaliação completa no localStorage
  useEffect(() => {
    try {
      const assessment = localStorage.getItem('posturalAssessment');
      if (assessment) {
        const data = JSON.parse(assessment);
        // Verificar se os campos básicos estão preenchidos
        if (data.clientName && data.age && data.height && data.weight) {
          setHasCompletedAssessment(true);
        }
      }
    } catch (error) {
      console.error('Error checking assessment:', error);
    }
  }, [currentView]);

  // Redirecionamento condicional pós-cadastro
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      
      if (redirect === 'assessment') {
        setCurrentView('assessment');
      }
    } catch (error) {
      console.error('Error checking URL params:', error);
    }
  }, []);

  const renderCurrentView = () => {
    try {
      switch (currentView) {
        case 'dashboard':
          return <RoleDashboard userRole={userRole} />;
        case 'clients':
          return <ClientManagement />;
        case 'assessment':
          return <PosturalAssessment />;
        case 'advanced-analysis':
          return <AdvancedPosturalAnalysis />;
        case 'photo-docs':
          return <PhotoDocumentation />;
        case 'progress':
          return <ProgressReports />;
        case 'workouts':
          return <WorkoutPlans />;
        case 'pricing':
          return <PricingPlans />;
        case 'profile':
          return <UserProfile />;
        case 'system-summary':
          return <SystemSummary />;
        case 'assessment-prompt':
          return renderAssessmentPrompt();
        case 'settings':
          return (
            <div className="p-8 text-center pb-20 md:pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Configurações</h2>
              <p className="text-gray-600">Esta seção está em desenvolvimento.</p>
            </div>
          );
        default:
          return <RoleDashboard userRole={userRole} />;
      }
    } catch (error) {
      console.error('Error rendering view:', error);
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-600">Ocorreu um erro ao carregar esta seção.</p>
          <button 
            onClick={() => setCurrentView('dashboard')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Voltar ao Dashboard
          </button>
        </div>
      );
    }
  };

  const renderAssessmentPrompt = () => (
    <div className="flex items-center justify-center min-h-[60vh] p-6 pb-20 md:pb-6">
      <div className="text-center max-w-md mx-auto">
        <div className="bg-gradient-to-r from-[#2E5A88]/10 to-[#4CAF50]/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🏋️‍♂️</span>
        </div>
        <h2 className="text-2xl font-bold text-[#2E5A88] mb-4">
          Complete sua Análise Postural! 
        </h2>
        <p className="text-gray-600 mb-6">
          Para começar sua jornada de correção postural, precisamos fazer uma avaliação completa usando o sistema SAARS.
        </p>
        <button
          onClick={() => setCurrentView('assessment')}
          className="bg-[#2E5A88] hover:bg-[#1e3a5f] text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
        >
          ✨ Iniciar Avaliação Agora
        </button>
        <p className="text-sm text-gray-500 mt-4">
          ⏱️ Leva apenas 10-15 minutos
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />
      <div className="flex">
        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <Navigation activeSection={currentView} onSectionChange={setCurrentView} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderCurrentView()}
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <BottomNavigation currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
};

export default Index;
