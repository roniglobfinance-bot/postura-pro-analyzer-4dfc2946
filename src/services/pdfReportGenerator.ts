import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DiagnosticOutput, ProtocolOutput } from './diagnosticEngine';

interface ReportData {
  clientData: {
    name: string;
    height: number;
    age?: number;
    weight?: number;
    complaints?: string;
  };
  photos: Array<{
    id: string;
    view: string;
    imageUrl: string;
    imageElement?: HTMLImageElement;
  }>;
  measurements: Array<{
    name: string;
    value: number;
    unit: string;
    viewType: string;
  }>;
  diagnosticFlags: Array<{
    code: string;
    name: string;
    confidence: number;
  }>;
  diagnoses: DiagnosticOutput[];
  protocols: ProtocolOutput[];
  aiAnalysis?: {
    overallScore: number;
    identifiedPatterns: any[];
  };
}

export class PDFReportGenerator {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private yPosition: number = 20;

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
  }

  async generate(data: ReportData): Promise<void> {
    // Página 1: Capa e Dados do Cliente
    this.addCoverPage(data);

    // Página 2: Fotos Anotadas
    await this.addPhotosPage(data);

    // Página 3: Medições e Análise
    this.addMeasurementsPage(data);

    // Página 4+: Diagnósticos
    this.addDiagnosesPages(data);

    // Página Final: Protocolos de Exercícios
    this.addProtocolsPages(data);

    // Rodapé em todas as páginas
    this.addFooters();

    // Salvar PDF
    const fileName = `9FIT_Relatorio_${data.clientData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    this.pdf.save(fileName);
  }

  private addCoverPage(data: ReportData): void {
    // Logo/Título
    this.pdf.setFontSize(24);
    this.pdf.setTextColor(30, 58, 138); // blue-900
    this.pdf.text('9FIT OS', this.pageWidth / 2, 40, { align: 'center' });
    
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(71, 85, 105); // slate-600
    this.pdf.text('Sistema de Inteligência Biomecânica', this.pageWidth / 2, 50, { align: 'center' });
    
    this.pdf.setFontSize(14);
    this.pdf.text('Relatório de Avaliação Postural', this.pageWidth / 2, 60, { align: 'center' });

    // Linha separadora
    this.pdf.setDrawColor(203, 213, 225); // slate-300
    this.pdf.line(this.margin, 70, this.pageWidth - this.margin, 70);

    // Dados do Cliente
    this.yPosition = 85;
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(15, 23, 42); // slate-900
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('DADOS DO CLIENTE', this.margin, this.yPosition);
    
    this.yPosition += 10;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Nome: ${data.clientData.name}`, this.margin, this.yPosition);
    
    this.yPosition += 8;
    this.pdf.text(`Altura: ${data.clientData.height} cm`, this.margin, this.yPosition);
    
    if (data.clientData.age) {
      this.yPosition += 8;
      this.pdf.text(`Idade: ${data.clientData.age} anos`, this.margin, this.yPosition);
    }
    
    if (data.clientData.weight) {
      this.yPosition += 8;
      this.pdf.text(`Peso: ${data.clientData.weight} kg`, this.margin, this.yPosition);
    }

    if (data.clientData.complaints) {
      this.yPosition += 12;
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Queixas Principais:', this.margin, this.yPosition);
      this.yPosition += 8;
      this.pdf.setFont('helvetica', 'normal');
      const complaints = this.pdf.splitTextToSize(data.clientData.complaints, this.pageWidth - 2 * this.margin);
      this.pdf.text(complaints, this.margin, this.yPosition);
      this.yPosition += complaints.length * 6;
    }

    // Resumo da Avaliação
    this.yPosition += 15;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('RESUMO DA AVALIAÇÃO', this.margin, this.yPosition);
    
    this.yPosition += 10;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, this.margin, this.yPosition);
    
    this.yPosition += 8;
    this.pdf.text(`Total de Fotos: ${data.photos.length}`, this.margin, this.yPosition);
    
    this.yPosition += 8;
    this.pdf.text(`Medições Realizadas: ${data.measurements.length}`, this.margin, this.yPosition);
    
    this.yPosition += 8;
    this.pdf.text(`Flags Identificados: ${data.diagnosticFlags.length}`, this.margin, this.yPosition);
    
    this.yPosition += 8;
    this.pdf.text(`Diagnósticos: ${data.diagnoses.length}`, this.margin, this.yPosition);

    if (data.aiAnalysis) {
      this.yPosition += 12;
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('ANÁLISE AI', this.margin, this.yPosition);
      this.yPosition += 10;
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(`Score Geral: ${data.aiAnalysis.overallScore}/100`, this.margin, this.yPosition);
    }
  }

  private async addPhotosPage(data: ReportData): Promise<void> {
    this.pdf.addPage();
    this.yPosition = 20;

    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(30, 58, 138);
    this.pdf.text('DOCUMENTAÇÃO FOTOGRÁFICA', this.margin, this.yPosition);

    this.yPosition += 15;

    // Adicionar fotos (2 por página)
    for (let i = 0; i < data.photos.length; i++) {
      const photo = data.photos[i];

      if (i > 0 && i % 2 === 0) {
        this.pdf.addPage();
        this.yPosition = 20;
      }

      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(15, 23, 42);
      this.pdf.text(`Vista: ${photo.view.toUpperCase()}`, this.margin, this.yPosition);

      this.yPosition += 5;

      try {
        // Tentar adicionar a imagem
        const imgWidth = this.pageWidth - 2 * this.margin;
        const imgHeight = 90;

        if (photo.imageUrl.startsWith('data:image')) {
          this.pdf.addImage(photo.imageUrl, 'JPEG', this.margin, this.yPosition, imgWidth, imgHeight);
        } else if (photo.imageElement) {
          const canvas = await html2canvas(photo.imageElement);
          const imgData = canvas.toDataURL('image/jpeg');
          this.pdf.addImage(imgData, 'JPEG', this.margin, this.yPosition, imgWidth, imgHeight);
        }

        this.yPosition += imgHeight + 10;
      } catch (error) {
        console.error('Erro ao adicionar foto ao PDF:', error);
        this.pdf.setFontSize(10);
        this.pdf.setTextColor(153, 27, 27);
        this.pdf.text('(Imagem não disponível)', this.margin, this.yPosition);
        this.yPosition += 10;
      }
    }
  }

  private addMeasurementsPage(data: ReportData): void {
    this.pdf.addPage();
    this.yPosition = 20;

    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(30, 58, 138);
    this.pdf.text('MEDIÇÕES E ANÁLISE QUANTITATIVA', this.margin, this.yPosition);

    this.yPosition += 15;

    if (data.measurements.length === 0) {
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(71, 85, 105);
      this.pdf.text('Nenhuma medição realizada.', this.margin, this.yPosition);
      return;
    }

    // Agrupar medições por vista
    const measurementsByView: Record<string, typeof data.measurements> = {};
    data.measurements.forEach(m => {
      if (!measurementsByView[m.viewType]) {
        measurementsByView[m.viewType] = [];
      }
      measurementsByView[m.viewType].push(m);
    });

    // Exibir medições por vista
    Object.entries(measurementsByView).forEach(([view, measurements]) => {
      if (this.yPosition > this.pageHeight - 40) {
        this.pdf.addPage();
        this.yPosition = 20;
      }

      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(15, 23, 42);
      this.pdf.text(`Vista ${view.toUpperCase()}:`, this.margin, this.yPosition);

      this.yPosition += 8;

      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');

      measurements.forEach(m => {
        if (this.yPosition > this.pageHeight - 30) {
          this.pdf.addPage();
          this.yPosition = 20;
        }

        const valueStr = `${m.value.toFixed(2)} ${m.unit}`;
        this.pdf.text(`• ${m.name}: ${valueStr}`, this.margin + 5, this.yPosition);
        this.yPosition += 6;
      });

      this.yPosition += 5;
    });

    // Flags Identificados
    this.yPosition += 10;
    if (this.yPosition > this.pageHeight - 60) {
      this.pdf.addPage();
      this.yPosition = 20;
    }

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(30, 58, 138);
    this.pdf.text('FLAGS DE AVALIAÇÃO IDENTIFICADOS', this.margin, this.yPosition);

    this.yPosition += 10;

    if (data.diagnosticFlags.length === 0) {
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(71, 85, 105);
      this.pdf.text('Nenhum flag identificado automaticamente.', this.margin, this.yPosition);
    } else {
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');

      data.diagnosticFlags.forEach(flag => {
        if (this.yPosition > this.pageHeight - 30) {
          this.pdf.addPage();
          this.yPosition = 20;
        }

        this.pdf.text(`• [${flag.code}] ${flag.name} (Confiança: ${flag.confidence}%)`, this.margin + 5, this.yPosition);
        this.yPosition += 6;
      });
    }
  }

  private addDiagnosesPages(data: ReportData): void {
    this.pdf.addPage();
    this.yPosition = 20;

    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(220, 38, 38); // red-600
    this.pdf.text('🟥 RESUMO DO DIAGNÓSTICO', this.margin, this.yPosition);

    this.yPosition += 15;

    if (data.diagnoses.length === 0) {
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(71, 85, 105);
      this.pdf.text('Nenhuma regra de diagnóstico correspondente encontrada.', this.margin, this.yPosition);
      return;
    }

    data.diagnoses.forEach((diagnosis, index) => {
      if (this.yPosition > this.pageHeight - 80) {
        this.pdf.addPage();
        this.yPosition = 20;
      }

      // Título do Diagnóstico
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(15, 23, 42);
      this.pdf.text(`${index + 1}. ${diagnosis.diagnosis}`, this.margin, this.yPosition);

      this.yPosition += 8;

      // Informações básicas
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(71, 85, 105);
      
      this.pdf.text(`Severidade: ${diagnosis.severity}/4 | Confiança: ${diagnosis.confidence}%`, this.margin + 5, this.yPosition);
      this.yPosition += 6;

      this.pdf.text(`Linhas Afetadas: ${diagnosis.affectedLines.join(', ')}`, this.margin + 5, this.yPosition);
      this.yPosition += 10;

      // Análise Biomecânica
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(37, 99, 235); // blue-600
      this.pdf.text('🟦 ANÁLISE BIOMECÂNICA', this.margin + 5, this.yPosition);

      this.yPosition += 8;

      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(51, 65, 85);

      diagnosis.mechanisms.forEach(mechanism => {
        if (this.yPosition > this.pageHeight - 30) {
          this.pdf.addPage();
          this.yPosition = 20;
        }

        const lines = this.pdf.splitTextToSize(`• ${mechanism}`, this.pageWidth - 2 * this.margin - 10);
        this.pdf.text(lines, this.margin + 10, this.yPosition);
        this.yPosition += lines.length * 5;
      });

      this.yPosition += 8;

      // Prognóstico
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Prognóstico:', this.margin + 5, this.yPosition);
      this.yPosition += 6;

      this.pdf.setFont('helvetica', 'normal');
      const prognosisLines = this.pdf.splitTextToSize(diagnosis.prognosis, this.pageWidth - 2 * this.margin - 10);
      this.pdf.text(prognosisLines, this.margin + 10, this.yPosition);
      this.yPosition += prognosisLines.length * 5 + 10;
    });
  }

  private addProtocolsPages(data: ReportData): void {
    if (data.protocols.length === 0) return;

    this.pdf.addPage();
    this.yPosition = 20;

    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(34, 197, 94); // green-500
    this.pdf.text('🟩 PROTOCOLOS DE CORREÇÃO', this.margin, this.yPosition);

    this.yPosition += 15;

    data.protocols.forEach((protocol, protocolIndex) => {
      if (this.yPosition > this.pageHeight - 100) {
        this.pdf.addPage();
        this.yPosition = 20;
      }

      // Nome do Protocolo
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(15, 23, 42);
      this.pdf.text(`PROTOCOLO ${protocolIndex + 1}: ${protocol.name}`, this.margin, this.yPosition);

      this.yPosition += 8;

      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(71, 85, 105);
      this.pdf.text(`Duração: ${protocol.duration}`, this.margin + 5, this.yPosition);

      this.yPosition += 10;

      // Fases
      protocol.phases.forEach((phase, phaseIndex) => {
        if (this.yPosition > this.pageHeight - 60) {
          this.pdf.addPage();
          this.yPosition = 20;
        }

        this.pdf.setFontSize(11);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(37, 99, 235);
        this.pdf.text(`${phase.name}`, this.margin + 5, this.yPosition);

        this.yPosition += 7;

        // Blocos
        phase.blocks.forEach((block: any) => {
          if (this.yPosition > this.pageHeight - 40) {
            this.pdf.addPage();
            this.yPosition = 20;
          }

          const blockTypeNames: Record<string, string> = {
            liberacao: 'Liberação Miofascial',
            respiracao: 'Respiração',
            ativacao: 'Pré-Ativação',
            estabilidade: 'Estabilidade/Integração',
            fortalecimento: 'Fortalecimento',
            funcional: 'Reorganização Funcional',
            alongamento: 'Alongamento Final'
          };

          const blockName = blockTypeNames[block.type] || block.type;

          this.pdf.setFontSize(10);
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.setTextColor(51, 65, 85);
          this.pdf.text(`${blockName}:`, this.margin + 10, this.yPosition);

          this.yPosition += 6;

          this.pdf.setFont('helvetica', 'normal');
          this.pdf.setFontSize(9);

          block.exercises.forEach((exercise: any) => {
            if (this.yPosition > this.pageHeight - 25) {
              this.pdf.addPage();
              this.yPosition = 20;
            }

            let exerciseDetails = `  • ${exercise.name}`;
            
            if (exercise.sets) exerciseDetails += ` - ${exercise.sets} séries`;
            if (exercise.reps) exerciseDetails += ` x ${exercise.reps}`;
            if (exercise.duration) exerciseDetails += ` (${exercise.duration})`;
            if (exercise.load) exerciseDetails += ` | Carga: ${exercise.load}`;
            if (exercise.tool) exerciseDetails += ` | Ferramenta: ${exercise.tool}`;

            const lines = this.pdf.splitTextToSize(exerciseDetails, this.pageWidth - 2 * this.margin - 15);
            this.pdf.text(lines, this.margin + 15, this.yPosition);
            this.yPosition += lines.length * 4.5;
          });

          this.yPosition += 5;
        });

        this.yPosition += 3;
      });

      this.yPosition += 10;
    });
  }

  private addFooters(): void {
    const totalPages = this.pdf.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(148, 163, 184);
      this.pdf.text(
        `Gerado pelo 9FIT OS - Sistema de Inteligência Biomecânica | Página ${i} de ${totalPages}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
    }
  }
}

export default PDFReportGenerator;
