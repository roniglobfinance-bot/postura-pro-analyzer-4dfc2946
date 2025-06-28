
import { Badge } from '@/components/ui/badge';
import { Camera } from 'lucide-react';

interface Photo {
  id: string;
  view: string;
  imageUrl: string;
  measurements: any[];
  date: string;
}

interface ViewAnalysisProps {
  photos: Photo[];
}

const ViewAnalysis = ({ photos }: ViewAnalysisProps) => {
  const getViewAnalysis = (view: string, measurements: any[]) => {
    const measurementCount = measurements.length;
    
    if (measurementCount === 0) {
      return { status: 'pending', message: 'Aguardando medições' };
    } else if (measurementCount < 2) {
      return { status: 'partial', message: 'Análise parcial' };
    } else {
      return { status: 'complete', message: 'Análise completa' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-4">Análise por Vista Corporal</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {photos.map((photo) => {
          const analysis = getViewAnalysis(photo.view, photo.measurements);
          return (
            <div key={photo.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Camera className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium">Vista {photo.view}</span>
                </div>
                <Badge className={getStatusColor(analysis.status)}>
                  {analysis.message}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p>Medições aplicadas: {photo.measurements.length}</p>
                <p>Data: {new Date(photo.date).toLocaleDateString('pt-BR')}</p>
                
                {photo.measurements.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 mt-2">Tipos de medição:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {photo.measurements.map((measurement, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {measurement.type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ViewAnalysis;
