import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProtocolOutput } from '@/services/diagnosticEngine';
import { Clock, Dumbbell, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProtocolViewerProps {
  protocols: ProtocolOutput[];
}

const ProtocolViewer = ({ protocols }: ProtocolViewerProps) => {
  if (protocols.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Nenhum protocolo disponível. Selecione flags e gere diagnósticos primeiro.
        </AlertDescription>
      </Alert>
    );
  }

  const getBlockTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      liberacao: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      alongamento: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      ativacao: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      fortalecimento: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      funcional: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      respiracao: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      neuro_controle: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getBlockTypeName = (type: string) => {
    const names: Record<string, string> = {
      liberacao: 'Liberação Miofascial',
      alongamento: 'Alongamento',
      ativacao: 'Ativação',
      fortalecimento: 'Fortalecimento',
      funcional: 'Funcional',
      respiracao: 'Respiração',
      neuro_controle: 'Controle Neuromotor'
    };
    return names[type] || type;
  };

  return (
    <div className="space-y-4">
      {protocols.map((protocol, protocolIndex) => (
        <Card key={protocolIndex}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>{protocol.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{protocol.duration}</span>
                </div>
              </div>
              <Badge variant="outline" className="font-mono">
                {protocol.id}
              </Badge>
            </div>
            {protocol.note && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription className="text-xs">{protocol.note}</AlertDescription>
              </Alert>
            )}
          </CardHeader>

          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {protocol.phases.map((phase, phaseIndex) => (
                <AccordionItem key={phaseIndex} value={`phase-${phaseIndex}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{phaseIndex + 1}</Badge>
                      <span className="font-semibold text-left">{phase.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-6 pt-4">
                        {phase.blocks.map((block: any, blockIndex: number) => (
                          <div key={blockIndex} className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Dumbbell className="h-4 w-4" />
                              <Badge className={getBlockTypeColor(block.type)}>
                                {getBlockTypeName(block.type)}
                              </Badge>
                            </div>
                            
                            <div className="pl-6 space-y-3">
                              {block.exercises.map((exercise: any, exerciseIndex: number) => (
                                <div
                                  key={exerciseIndex}
                                  className="p-3 rounded-lg bg-accent border border-border"
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{exercise.name}</p>
                                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                                        {exercise.sets && (
                                          <span>
                                            <span className="font-semibold">Sets:</span> {exercise.sets}
                                          </span>
                                        )}
                                        {exercise.reps && (
                                          <span>
                                            <span className="font-semibold">Reps:</span> {exercise.reps}
                                          </span>
                                        )}
                                        {exercise.duration && (
                                          <span>
                                            <span className="font-semibold">Duração:</span> {exercise.duration}
                                          </span>
                                        )}
                                        {exercise.load && (
                                          <span>
                                            <span className="font-semibold">Carga:</span> {exercise.load}
                                          </span>
                                        )}
                                        {exercise.tool && (
                                          <span>
                                            <span className="font-semibold">Ferramenta:</span> {exercise.tool}
                                          </span>
                                        )}
                                        {exercise.intensity && (
                                          <span>
                                            <span className="font-semibold">Intensidade:</span> {exercise.intensity}
                                          </span>
                                        )}
                                        {exercise.position && (
                                          <span>
                                            <span className="font-semibold">Posição:</span> {exercise.position}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProtocolViewer;
