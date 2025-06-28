
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import PosturalAnalysisSection from './assessment/PosturalAnalysisSection';
import AutomaticDiagnosis from './assessment/AutomaticDiagnosis';
import ClientDataSection from './assessment/ClientDataSection';
import FunctionalTestsSection from './assessment/FunctionalTestsSection';
import AssessmentHeader from './assessment/AssessmentHeader';
import ObservationsSection from './assessment/ObservationsSection';

const PosturalAssessment = () => {
  const [assessmentData, setAssessmentData] = useState({
    // Dados básicos
    clientName: '',
    age: '',
    height: '',
    weight: '',
    date: new Date().toISOString().split('T')[0],
    
    // Medições angulares - Vista Sagital
    cranioCervicalAngle: 55,
    thoracicKyphosis: 30,
    lumbarLordosis: 50,
    pelvicTilt: 12,
    
    // Assimetrias - Vista Frontal
    shoulderImbalance: 0,
    cobbAngle: 0,
    pelvicImbalance: 0,
    
    // Vista Posterior
    scapularAbduction: 'normal',
    scapularElevation: 'symmetric',
    
    // Testes funcionais específicos
    thomasTest: 'negative',
    oberTest: 'negative',
    adamsTest: 'negative',
    beightonTest: 'negative',
    
    // Avaliação dinâmica
    squatPattern: 'normal',
    walkingPattern: 'normal',
    
    // Observações
    observations: '',
    complaints: ''
  });

  const handleDataChange = (field: string, value: any) => {
    setAssessmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAssessment = () => {
    console.log('Salvando avaliação:', assessmentData);
    toast({
      title: "Avaliação Salva!",
      description: "A avaliação postural SAARS foi salva com sucesso.",
    });
  };

  const handleGenerateReport = () => {
    toast({
      title: "Relatório Gerado!",
      description: "O relatório com diagnóstico e prescrições foi gerado.",
    });
  };

  const handleGeneratePrescription = () => {
    toast({
      title: "Protocolo Gerado!",
      description: "Protocolo de exercícios personalizado foi criado com base na avaliação.",
    });
  };

  return (
    <div className="space-y-6">
      <AssessmentHeader 
        onSave={handleSaveAssessment}
        onGenerateReport={handleGenerateReport}
      />

      <Tabs defaultValue="client-data" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="client-data">Dados do Cliente</TabsTrigger>
          <TabsTrigger value="postural-analysis">Análise Postural</TabsTrigger>
          <TabsTrigger value="functional-tests">Testes Funcionais</TabsTrigger>
          <TabsTrigger value="diagnosis">Diagnóstico</TabsTrigger>
        </TabsList>

        <TabsContent value="client-data" className="space-y-4">
          <ClientDataSection 
            data={assessmentData}
            onChange={handleDataChange}
          />
        </TabsContent>

        <TabsContent value="postural-analysis" className="space-y-4">
          <PosturalAnalysisSection 
            data={assessmentData} 
            onChange={handleDataChange}
          />
        </TabsContent>

        <TabsContent value="functional-tests" className="space-y-4">
          <FunctionalTestsSection
            data={assessmentData}
            onChange={handleDataChange}
          />
        </TabsContent>

        <TabsContent value="diagnosis" className="space-y-4">
          <AutomaticDiagnosis 
            assessmentData={assessmentData}
            onGeneratePrescription={handleGeneratePrescription}
          />
        </TabsContent>
      </Tabs>

      <ObservationsSection
        observations={assessmentData.observations}
        onChange={(value) => handleDataChange('observations', value)}
      />
    </div>
  );
};

export default PosturalAssessment;
