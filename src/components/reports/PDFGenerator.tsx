
import { useState } from 'react';
import jsPDF from 'jspdf';
import { toast } from '@/hooks/use-toast';

interface Photo {
  id: string;
  view: string;
  imageUrl: string;
  measurements: any[];
  date: string;
}

interface PDFGeneratorProps {
  photos: Photo[];
  clientName: string;
  clientHeight: number;
  onGenerate: () => void;
}

const PDFGenerator = ({ photos, clientName, clientHeight, onGenerate }: PDFGeneratorProps) => {
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
      
      onGenerate();
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

  return { generatePDFReport, isGenerating };
};

export default PDFGenerator;
