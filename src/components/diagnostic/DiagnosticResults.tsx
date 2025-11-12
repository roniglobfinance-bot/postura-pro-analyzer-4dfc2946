import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { DiagnosticOutput } from '@/services/diagnosticEngine';
import { AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react';

interface DiagnosticResultsProps {
  diagnoses: DiagnosticOutput[];
}

const DiagnosticResults = ({ diagnoses }: DiagnosticResultsProps) => {
  if (diagnoses.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Nenhum diagnóstico identificado</AlertTitle>
        <AlertDescription>
          Selecione flags de avaliação para gerar diagnósticos.
        </AlertDescription>
      </Alert>
    );
  }

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return 'destructive';
    if (severity >= 3) return 'default';
    if (severity >= 2) return 'secondary';
    return 'outline';
  };

  const getSeverityIcon = (severity: number) => {
    if (severity >= 3) return <AlertTriangle className="h-4 w-4" />;
    if (severity >= 2) return <Info className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Diagnósticos Identificados</span>
            <Badge variant="secondary">{diagnoses.length} resultado(s)</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {diagnoses.map((diagnosis, index) => (
        <Card key={index} className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl">{diagnosis.diagnosis}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={getSeverityColor(diagnosis.severity)} className="gap-1">
                    {getSeverityIcon(diagnosis.severity)}
                    Severidade {diagnosis.severity}/4
                  </Badge>
                  <Badge variant="outline" className="font-mono">
                    {diagnosis.matchedRule}
                  </Badge>
                  <Badge variant="secondary">
                    {diagnosis.confidence}% confiança
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Linhas Miofasciais Afetadas */}
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Linhas Miofasciais Afetadas
              </h4>
              <div className="flex flex-wrap gap-2">
                {diagnosis.affectedLines.map(line => (
                  <Badge key={line} variant="outline">
                    {line}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Mecanismos Causais */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Mecanismos Causais</h4>
              <ul className="space-y-2">
                {diagnosis.mechanisms.map((mechanism, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="flex-1">{mechanism}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Prognóstico */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Prognóstico</h4>
              <p className="text-sm text-muted-foreground">{diagnosis.prognosis}</p>
            </div>

            {/* Protocolo Recomendado */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Protocolo Recomendado</AlertTitle>
              <AlertDescription className="font-mono text-xs">
                {diagnosis.protocolRef}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DiagnosticResults;
