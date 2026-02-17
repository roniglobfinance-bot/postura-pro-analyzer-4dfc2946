
import { useState } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import ClientManagement from '@/components/ClientManagement';
import AssessmentWizard from '@/components/pages/AssessmentWizard';
import MediaCollector from '@/components/pages/MediaCollector';
import ResultsHUD from '@/components/pages/ResultsHUD';
import PlanBuilder from '@/components/pages/PlanBuilder';
import SessionTracker from '@/components/pages/SessionTracker';
import ProtocolLibrary from '@/components/pages/ProtocolLibrary';

const Index = () => {
  const [currentView, setCurrentView] = useState('clients');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'clients':
        return <ClientManagement />;
      case 'assessment-wizard':
        return <AssessmentWizard onNavigate={setCurrentView} />;
      case 'media-collector':
        return <MediaCollector />;
      case 'results-hud':
        return <ResultsHUD />;
      case 'plan-builder':
        return <PlanBuilder />;
      case 'session-tracker':
        return <SessionTracker />;
      case 'protocol-library':
        return <ProtocolLibrary />;
      default:
        return <ClientManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <div className="hidden md:block">
          <Navigation activeSection={currentView} onSectionChange={setCurrentView} />
        </div>
        <main className="flex-1 p-6">
          {renderCurrentView()}
        </main>
      </div>
      <BottomNavigation currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
};

export default Index;
