import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { evaluationFlags } from '@/data/knowledgeBase';
import { CheckCircle2, Circle } from 'lucide-react';

interface FlagSelectorProps {
  selectedFlags: string[];
  onFlagsChange: (flags: string[]) => void;
}

const FlagSelector = ({ selectedFlags, onFlagsChange }: FlagSelectorProps) => {
  const toggleFlag = (flagCode: string) => {
    if (selectedFlags.includes(flagCode)) {
      onFlagsChange(selectedFlags.filter(f => f !== flagCode));
    } else {
      onFlagsChange([...selectedFlags, flagCode]);
    }
  };

  const renderFlagCategory = (category: any, title: string, color: string) => {
    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          {title}
        </h3>
        <div className="space-y-2">
          {Object.entries(category).map(([code, info]: [string, any]) => {
            const isSelected = selectedFlags.includes(code);
            return (
              <div
                key={code}
                onClick={() => toggleFlag(code)}
                className={`
                  flex items-start gap-3 p-3 rounded-lg border cursor-pointer
                  transition-all hover:border-primary/50 hover:bg-accent/50
                  ${isSelected ? 'border-primary bg-accent' : 'border-border'}
                `}
              >
                <div className="pt-0.5">
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {code}
                    </Badge>
                    <span className={`font-medium text-sm ${isSelected ? 'text-primary' : ''}`}>
                      {info.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Severidade: {info.severity}/4</span>
                    {info.implies && (
                      <>
                        <span>•</span>
                        <span>Implica: {info.implies.join(', ')}</span>
                      </>
                    )}
                    {info.location && (
                      <>
                        <span>•</span>
                        <span>Local: {info.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Seleção de Flags de Avaliação</CardTitle>
          <Badge variant="secondary" className="font-mono">
            {selectedFlags.length} selecionados
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Selecione os achados clínicos identificados na avaliação física
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="postural" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="postural">Posturais</TabsTrigger>
            <TabsTrigger value="dynamic">Dinâmicos</TabsTrigger>
            <TabsTrigger value="tests">Testes</TabsTrigger>
            <TabsTrigger value="pain">Dor</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[600px] mt-4">
            <TabsContent value="postural" className="space-y-4 mt-0">
              {renderFlagCategory(evaluationFlags.postural, 'Flags Posturais Estáticos', 'blue')}
            </TabsContent>

            <TabsContent value="dynamic" className="space-y-4 mt-0">
              {renderFlagCategory(evaluationFlags.dynamic, 'Flags Funcionais Dinâmicos', 'green')}
            </TabsContent>

            <TabsContent value="tests" className="space-y-4 mt-0">
              {renderFlagCategory(evaluationFlags.tests, 'Flags de Testes Funcionais', 'purple')}
            </TabsContent>

            <TabsContent value="pain" className="space-y-4 mt-0">
              {renderFlagCategory(evaluationFlags.pain, 'Flags de Dor', 'red')}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {selectedFlags.length > 0 && (
          <div className="mt-4 p-4 bg-accent rounded-lg">
            <p className="text-sm font-medium mb-2">Flags Selecionados:</p>
            <div className="flex flex-wrap gap-2">
              {selectedFlags.map(flag => (
                <Badge key={flag} variant="default" className="font-mono">
                  {flag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FlagSelector;
