import { createContext, useContext, useState, ReactNode } from 'react';

export interface ActiveAssessmentState {
  assessmentId: string | null;
  studentId: string | null;
  studentName: string | null;
  analysisRunId: string | null;
  status: 'novo' | 'em_coleta' | 'analisando' | 'pronto' | 'plano_gerado';
  context: Record<string, string>;
  pain: { regiao: string; intensidade: number; gatilhos: string };
}

interface ActiveAssessmentContextType {
  active: ActiveAssessmentState;
  setAssessment: (id: string, studentId: string, studentName: string) => void;
  setStatus: (status: ActiveAssessmentState['status']) => void;
  setAnalysisRunId: (id: string) => void;
  setContext: (ctx: Record<string, string>) => void;
  setPain: (pain: ActiveAssessmentState['pain']) => void;
  reset: () => void;
}

const initialState: ActiveAssessmentState = {
  assessmentId: null,
  studentId: null,
  studentName: null,
  analysisRunId: null,
  status: 'novo',
  context: {},
  pain: { regiao: '', intensidade: 0, gatilhos: '' },
};

const ActiveAssessmentContext = createContext<ActiveAssessmentContextType | undefined>(undefined);

export const ActiveAssessmentProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState<ActiveAssessmentState>(initialState);

  const setAssessment = (id: string, studentId: string, studentName: string) => {
    setActive(prev => ({ ...prev, assessmentId: id, studentId, studentName }));
  };

  const setStatus = (status: ActiveAssessmentState['status']) => {
    setActive(prev => ({ ...prev, status }));
  };

  const setAnalysisRunId = (id: string) => {
    setActive(prev => ({ ...prev, analysisRunId: id }));
  };

  const setCtx = (ctx: Record<string, string>) => {
    setActive(prev => ({ ...prev, context: ctx }));
  };

  const setPain = (pain: ActiveAssessmentState['pain']) => {
    setActive(prev => ({ ...prev, pain }));
  };

  const reset = () => setActive(initialState);

  return (
    <ActiveAssessmentContext.Provider value={{
      active,
      setAssessment,
      setStatus,
      setAnalysisRunId,
      setContext: setCtx,
      setPain,
      reset,
    }}>
      {children}
    </ActiveAssessmentContext.Provider>
  );
};

export const useActiveAssessment = () => {
  const ctx = useContext(ActiveAssessmentContext);
  if (!ctx) throw new Error('useActiveAssessment must be used within ActiveAssessmentProvider');
  return ctx;
};
