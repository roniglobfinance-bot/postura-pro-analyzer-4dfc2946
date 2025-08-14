import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Bell, 
  Palette, 
  Zap, 
  Shield, 
  Save,
  RotateCcw,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdvancedSettingsProps {
  onSettingsChange?: (settings: any) => void;
}

interface AppSettings {
  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  notificationFrequency: 'immediate' | 'daily' | 'weekly';
  
  // Display Settings
  theme: 'light' | 'dark' | 'auto';
  language: 'pt-BR' | 'en-US' | 'es-ES';
  fontSize: number;
  colorScheme: 'blue' | 'green' | 'purple' | 'orange';
  
  // Performance Settings
  autoSaveInterval: number;
  imageQuality: 'low' | 'medium' | 'high';
  enableAnimations: boolean;
  preloadImages: boolean;
  
  // Privacy & Security
  dataRetention: number; // days
  shareAnalytics: boolean;
  requireAuth: boolean;
  sessionTimeout: number; // minutes
  
  // Measurement Settings
  measurementUnits: 'metric' | 'imperial';
  defaultMeasurementTool: 'angle' | 'distance' | 'ruler';
  showGridOverlay: boolean;
  autoCalculateAngles: boolean;
}

const AdvancedSettings = ({ onSettingsChange }: AdvancedSettingsProps) => {
  const [settings, setSettings] = useState<AppSettings>({
    // Default values
    emailNotifications: true,
    pushNotifications: false,
    soundEnabled: true,
    notificationFrequency: 'daily',
    theme: 'auto',
    language: 'pt-BR',
    fontSize: 14,
    colorScheme: 'blue',
    autoSaveInterval: 30,
    imageQuality: 'high',
    enableAnimations: true,
    preloadImages: true,
    dataRetention: 90,
    shareAnalytics: false,
    requireAuth: true,
    sessionTimeout: 60,
    measurementUnits: 'metric',
    defaultMeasurementTool: 'angle',
    showGridOverlay: true,
    autoCalculateAngles: true
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('advancedSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const updateSetting = <K extends keyof AppSettings>(
    key: K, 
    value: AppSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('advancedSettings', JSON.stringify(settings));
      onSettingsChange?.(settings);
      setHasChanges(false);
      
      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram salvas com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    }
  };

  const resetSettings = () => {
    const defaultSettings: AppSettings = {
      emailNotifications: true,
      pushNotifications: false,
      soundEnabled: true,
      notificationFrequency: 'daily',
      theme: 'auto',
      language: 'pt-BR',
      fontSize: 14,
      colorScheme: 'blue',
      autoSaveInterval: 30,
      imageQuality: 'high',
      enableAnimations: true,
      preloadImages: true,
      dataRetention: 90,
      shareAnalytics: false,
      requireAuth: true,
      sessionTimeout: 60,
      measurementUnits: 'metric',
      defaultMeasurementTool: 'angle',
      showGridOverlay: true,
      autoCalculateAngles: true
    };
    
    setSettings(defaultSettings);
    setHasChanges(true);
    
    toast({
      title: "Configurações resetadas",
      description: "Todas as configurações foram restauradas aos valores padrão."
    });
  };

  const getThemeIcon = () => {
    switch (settings.theme) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Configurações Avançadas
            </div>
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600">
                Alterações não salvas
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="display">
                <Palette className="h-4 w-4 mr-2" />
                Aparência
              </TabsTrigger>
              <TabsTrigger value="performance">
                <Zap className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="privacy">
                <Shield className="h-4 w-4 mr-2" />
                Privacidade
              </TabsTrigger>
              <TabsTrigger value="measurements">
                <Settings className="h-4 w-4 mr-2" />
                Medições
              </TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Preferências de Notificação</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por E-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber atualizações importantes por e-mail
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações do navegador
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sons do Sistema</Label>
                    <p className="text-sm text-muted-foreground">
                      Reproduzir sons para ações importantes
                    </p>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Frequência de Notificações</Label>
                  <Select 
                    value={settings.notificationFrequency} 
                    onValueChange={(value: any) => updateSetting('notificationFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Imediata</SelectItem>
                      <SelectItem value="daily">Diária</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Display Tab */}
            <TabsContent value="display" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configurações de Aparência</h3>
                
                <div className="space-y-2">
                  <Label className="flex items-center">
                    {getThemeIcon()}
                    <span className="ml-2">Tema</span>
                  </Label>
                  <Select 
                    value={settings.theme} 
                    onValueChange={(value: any) => updateSetting('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="auto">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value: any) => updateSetting('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tamanho da Fonte: {settings.fontSize}px</Label>
                  <Slider
                    value={[settings.fontSize]}
                    onValueChange={([value]) => updateSetting('fontSize', value)}
                    min={12}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Esquema de Cores</Label>
                  <Select 
                    value={settings.colorScheme} 
                    onValueChange={(value: any) => updateSetting('colorScheme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Azul</SelectItem>
                      <SelectItem value="green">Verde</SelectItem>
                      <SelectItem value="purple">Roxo</SelectItem>
                      <SelectItem value="orange">Laranja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configurações de Performance</h3>
                
                <div className="space-y-2">
                  <Label>Intervalo de Auto-salvamento: {settings.autoSaveInterval}s</Label>
                  <Slider
                    value={[settings.autoSaveInterval]}
                    onValueChange={([value]) => updateSetting('autoSaveInterval', value)}
                    min={10}
                    max={120}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Qualidade de Imagem</Label>
                  <Select 
                    value={settings.imageQuality} 
                    onValueChange={(value: any) => updateSetting('imageQuality', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa (mais rápido)</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta (melhor qualidade)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Animações</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilitar animações e transições
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableAnimations}
                    onCheckedChange={(checked) => updateSetting('enableAnimations', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Pré-carregar Imagens</Label>
                    <p className="text-sm text-muted-foreground">
                      Carregar imagens antecipadamente para melhor experiência
                    </p>
                  </div>
                  <Switch
                    checked={settings.preloadImages}
                    onCheckedChange={(checked) => updateSetting('preloadImages', checked)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Privacidade e Segurança</h3>
                
                <div className="space-y-2">
                  <Label>Retenção de Dados: {settings.dataRetention} dias</Label>
                  <Slider
                    value={[settings.dataRetention]}
                    onValueChange={([value]) => updateSetting('dataRetention', value)}
                    min={30}
                    max={365}
                    step={30}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Timeout da Sessão: {settings.sessionTimeout} minutos</Label>
                  <Slider
                    value={[settings.sessionTimeout]}
                    onValueChange={([value]) => updateSetting('sessionTimeout', value)}
                    min={15}
                    max={480}
                    step={15}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compartilhar Dados Analíticos</Label>
                    <p className="text-sm text-muted-foreground">
                      Ajudar a melhorar o produto compartilhando dados anônimos
                    </p>
                  </div>
                  <Switch
                    checked={settings.shareAnalytics}
                    onCheckedChange={(checked) => updateSetting('shareAnalytics', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Exigir Autenticação</Label>
                    <p className="text-sm text-muted-foreground">
                      Sempre exigir login para acessar dados
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireAuth}
                    onCheckedChange={(checked) => updateSetting('requireAuth', checked)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Measurements Tab */}
            <TabsContent value="measurements" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configurações de Medição</h3>
                
                <div className="space-y-2">
                  <Label>Sistema de Unidades</Label>
                  <Select 
                    value={settings.measurementUnits} 
                    onValueChange={(value: any) => updateSetting('measurementUnits', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Métrico (cm, kg)</SelectItem>
                      <SelectItem value="imperial">Imperial (in, lb)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ferramenta Padrão</Label>
                  <Select 
                    value={settings.defaultMeasurementTool} 
                    onValueChange={(value: any) => updateSetting('defaultMeasurementTool', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="angle">Medição Angular</SelectItem>
                      <SelectItem value="distance">Medição de Distância</SelectItem>
                      <SelectItem value="ruler">Régua</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Grade de Referência</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar grade sobre as imagens para melhor precisão
                    </p>
                  </div>
                  <Switch
                    checked={settings.showGridOverlay}
                    onCheckedChange={(checked) => updateSetting('showGridOverlay', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cálculo Automático de Ângulos</Label>
                    <p className="text-sm text-muted-foreground">
                      Calcular automaticamente ângulos complementares
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoCalculateAngles}
                    onCheckedChange={(checked) => updateSetting('autoCalculateAngles', checked)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={resetSettings}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar Padrões
            </Button>
            
            <Button 
              onClick={saveSettings} 
              disabled={!hasChanges}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedSettings;