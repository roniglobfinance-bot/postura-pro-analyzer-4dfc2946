
import { Button } from '@/components/ui/button';
import { Save, FileText } from 'lucide-react';

interface AssessmentHeaderProps {
  onSave: () => void;
  onGenerateReport: () => void;
}

const AssessmentHeader = ({ onSave, onGenerateReport }: AssessmentHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Avaliação Postural SAARS</h2>
        <p className="text-gray-600">Sistema de Avaliação e Análise Rigorosa da Postura</p>
      </div>
      <div className="flex space-x-2">
        <Button onClick={onSave} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
        <Button onClick={onGenerateReport} className="bg-blue-600 hover:bg-blue-700">
          <FileText className="h-4 w-4 mr-2" />
          Gerar Relatório
        </Button>
      </div>
    </div>
  );
};

export default AssessmentHeader;
