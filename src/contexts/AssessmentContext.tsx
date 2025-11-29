import { createContext, useContext, useState, ReactNode } from 'react';

export interface AnatomicalPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'landmark' | 'reference';
}

export interface PosturalMeasurement {
  id: string;
  name: string;
  value: number;
  unit: string;
  reference: string;
  deviation: number;
  viewType: string;
}

export interface DiagnosticFlag {
  code: string;
  name: string;
  severity: number;
  source: 'manual' | 'auto-detected';
  confidence?: number;
}

export interface SharedAssessmentData {
  // Dados do Cliente
  clientData: {
    fullName: string;
    age: number;
    height: number;
    weight: number;
    complaints?: string;
  };
  
  // Imagens e Fotos
  photos: {
    anterior?: string;
    posterior?: string;
    lateralDireita?: string;
    lateralEsquerda?: string;
  };
  
  // Pontos Anatômicos Marcados
  anatomicalPoints: Record<string, AnatomicalPoint[]>;
  
  // Medições Posturais
  measurements: PosturalMeasurement[];
  
  // Flags de Diagnóstico
  diagnosticFlags: DiagnosticFlag[];
  
  // Análises de IA
  aiAnalysis: {
    skeletonDetection?: any;
    angleAnalysis?: any;
    myofascialLines?: any;
    overallScore?: number;
    identifiedPatterns?: any[];
  };
  
  // Diagnóstico Gerado
  diagnosis?: {
    diagnoses: any[];
    protocols: any[];
    summary: string;
  };
}

interface AssessmentContextType {
  data: SharedAssessmentData;
  updateClientData: (data: Partial<SharedAssessmentData['clientData']>) => void;
  updatePhoto: (view: keyof SharedAssessmentData['photos'], url: string) => void;
  addAnatomicalPoints: (view: string, points: AnatomicalPoint[]) => void;
  addMeasurement: (measurement: PosturalMeasurement) => void;
  addDiagnosticFlag: (flag: DiagnosticFlag) => void;
  updateAIAnalysis: (key: keyof SharedAssessmentData['aiAnalysis'], data: any) => void;
  setDiagnosis: (diagnosis: SharedAssessmentData['diagnosis']) => void;
  resetAssessment: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

const initialData: SharedAssessmentData = {
  clientData: {
    fullName: '',
    age: 0,
    height: 0,
    weight: 0,
  },
  photos: {},
  anatomicalPoints: {},
  measurements: [],
  diagnosticFlags: [],
  aiAnalysis: {},
};

export const AssessmentProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<SharedAssessmentData>(initialData);

  const updateClientData = (newData: Partial<SharedAssessmentData['clientData']>) => {
    setData(prev => ({
      ...prev,
      clientData: { ...prev.clientData, ...newData }
    }));
  };

  const updatePhoto = (view: keyof SharedAssessmentData['photos'], url: string) => {
    setData(prev => ({
      ...prev,
      photos: { ...prev.photos, [view]: url }
    }));
  };

  const addAnatomicalPoints = (view: string, points: AnatomicalPoint[]) => {
    setData(prev => ({
      ...prev,
      anatomicalPoints: { ...prev.anatomicalPoints, [view]: points }
    }));
  };

  const addMeasurement = (measurement: PosturalMeasurement) => {
    setData(prev => ({
      ...prev,
      measurements: [...prev.measurements, measurement]
    }));
  };

  const addDiagnosticFlag = (flag: DiagnosticFlag) => {
    setData(prev => ({
      ...prev,
      diagnosticFlags: [...prev.diagnosticFlags, flag]
    }));
  };

  const updateAIAnalysis = (key: keyof SharedAssessmentData['aiAnalysis'], analysisData: any) => {
    setData(prev => ({
      ...prev,
      aiAnalysis: { ...prev.aiAnalysis, [key]: analysisData }
    }));
  };

  const setDiagnosis = (diagnosis: SharedAssessmentData['diagnosis']) => {
    setData(prev => ({
      ...prev,
      diagnosis
    }));
  };

  const resetAssessment = () => {
    setData(initialData);
  };

  return (
    <AssessmentContext.Provider
      value={{
        data,
        updateClientData,
        updatePhoto,
        addAnatomicalPoints,
        addMeasurement,
        addDiagnosticFlag,
        updateAIAnalysis,
        setDiagnosis,
        resetAssessment,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within AssessmentProvider');
  }
  return context;
};
