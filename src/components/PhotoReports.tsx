
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import ReportSummary from './reports/ReportSummary';
import ViewAnalysis from './reports/ViewAnalysis';
import RecommendationCard from './reports/RecommendationCard';
import PDFGenerator from './reports/PDFGenerator';

interface PhotoReportsProps {
  photos: Array<{
    id: string;
    view: string;
    imageUrl: string;
    measurements: any[];
    date: string;
  }>;
  clientName: string;
  clientHeight: number;
}

const PhotoReports = ({ photos, clientName, clientHeight }: PhotoReportsProps) => {
  const totalMeasurements = photos.reduce((total, photo) => total + photo.measurements.length, 0);
  
  const { generatePDFReport, isGenerating } = PDFGenerator({
    photos,
    clientName,
    clientHeight,
    onGenerate: () => {}
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Relatórios e Análises
          </div>
          <Button 
            onClick={generatePDFReport}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? 'Gerando...' : 'Baixar PDF'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ReportSummary 
          totalPhotos={photos.length}
          totalMeasurements={totalMeasurements}
        />
        
        <ViewAnalysis photos={photos} />
        
        <RecommendationCard />
      </CardContent>
    </Card>
  );
};

export default PhotoReports;
