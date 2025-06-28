
import { Camera, FileText } from 'lucide-react';

interface ReportSummaryProps {
  totalPhotos: number;
  totalMeasurements: number;
}

const ReportSummary = ({ totalPhotos, totalMeasurements }: ReportSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900">Total de Fotos</h4>
        <p className="text-2xl font-bold text-blue-700">{totalPhotos}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-900">Medições Aplicadas</h4>
        <p className="text-2xl font-bold text-green-700">{totalMeasurements}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-medium text-purple-900">Status Geral</h4>
        <p className="text-2xl font-bold text-purple-700">
          {totalPhotos > 0 ? 'Em Análise' : 'Pendente'}
        </p>
      </div>
    </div>
  );
};

export default ReportSummary;
