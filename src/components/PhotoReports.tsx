
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Camera, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDFReport = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Cabeçalho
      pdf.setFontSize(20);
      pdf.text('SAARS - Relatório de Avaliação Postural', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(`Cliente: ${clientName}`, 20, 40);
      pdf.text(`Altura: ${clientHeight} cm`, 20, 50);
      pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 60);
      pdf.text(`Total de Fotos: ${photos.length}`, 20, 70);
      
      let yPosition = 90;
      
      // Resumo das fotos
      pdf.setFontSize(14);
      pdf.text('Resumo da Documentação Fotográfica:', 20, yPosition);
      yPosition += 15;
      
      photos.forEach((photo, index) => {
        pdf.setFontSize(10);
        pdf.text(`• Vista ${photo.view}: ${photo.measurements.length} medições aplicadas`, 25, yPosition);
        yPosition += 10;
      });
      
      yPosition += 10;
      
      // Análise detalhada
      pdf.setFontSize(14);
      pdf.text('Análise Detalhada por Vista:', 20, yPosition);
      yPosition += 15;
      
      photos.forEach((photo) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(12);
        pdf.text(`Vista ${photo.view.toUpperCase()}:`, 20, yPosition);
        yPosition += 10;
        
        if (photo.measurements.length > 0) {
          pdf.setFontSize(10);
          photo.measurements.forEach((measurement) => {
            pdf.text(`• ${measurement.type} - ID: ${measurement.id}`, 25, yPosition);
            yPosition += 8;
          });
        } else {
          pdf.setFontSize(10);
          pdf.text('• Nenhuma medição aplicada', 25, yPosition);
          yPosition += 8;
        }
        
        yPosition += 10;
      });
      
      // Rodapé
      pdf.setFontSize(8);
      pdf.text('Gerado pelo Sistema SAARS - Avaliação e Análise Rigorosa da Postura', pageWidth / 2, 280, { align: 'center' });
      
      pdf.save(`SAARS_Relatorio_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Relatório gerado!",
        description: "O relatório PDF foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório PDF.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
        {/* Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900">Total de Fotos</h4>
            <p className="text-2xl font-bold text-blue-700">{photos.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900">Medições Aplicadas</h4>
            <p className="text-2xl font-bold text-green-700">
              {photos.reduce((total, photo) => total + photo.measurements.length, 0)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900">Status Geral</h4>
            <p className="text-2xl font-bold text-purple-700">
              {photos.length > 0 ? 'Em Análise' : 'Pendente'}
            </p>
          </div>
        </div>

        {/* Análise por Vista */}
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

        {/* Recomendações */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">Recomendações para Melhor Análise</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Certifique-se de ter pelo menos 2-3 medições por vista para análise completa</li>
            <li>• Use linhas de referência horizontais para avaliar simetrias</li>
            <li>• Aplique medições angulares para quantificar desvios posturais</li>
            <li>• Mantenha calibração precisa informando a altura correta do cliente</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoReports;
