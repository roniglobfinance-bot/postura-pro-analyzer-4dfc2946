
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accessibility, Type, Eye, Volume2, MousePointer } from 'lucide-react';

interface AccessibilitySettings {
  highContrast: boolean;
  largeFonts: boolean;
  fontSize: number;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindMode: string;
  voiceAnnouncements: boolean;
}

const AccessibilityEnhancements = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeFonts: false,
    fontSize: 16,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    colorBlindMode: 'none',
    voiceAnnouncements: false
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved accessibility settings
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    // Apply settings to document
    applySettings(settings);
    
    // Save settings
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [settings]);

  const applySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('accessibility-high-contrast');
    } else {
      root.classList.remove('accessibility-high-contrast');
    }

    // Font size
    root.style.setProperty('--accessibility-font-size', `${settings.fontSize}px`);

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('accessibility-reduced-motion');
    } else {
      root.classList.remove('accessibility-reduced-motion');
    }

    // Color blind mode
    root.setAttribute('data-colorblind-mode', settings.colorBlindMode);

    // Keyboard navigation
    if (settings.keyboardNavigation) {
      root.classList.add('accessibility-keyboard-nav');
    } else {
      root.classList.remove('accessibility-keyboard-nav');
    }
  };

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      highContrast: false,
      largeFonts: false,
      fontSize: 16,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      colorBlindMode: 'none',
      voiceAnnouncements: false
    };
    setSettings(defaultSettings);
  };

  const announceText = (text: string) => {
    if (settings.voiceAnnouncements && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* Accessibility Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
        aria-label="Abrir configurações de acessibilidade"
        title="Configurações de Acessibilidade"
      >
        <Accessibility className="h-6 w-6" />
      </Button>

      {/* Accessibility Panel */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 z-50 w-80 max-h-96 overflow-y-auto shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Accessibility className="h-5 w-5 mr-2" />
                Acessibilidade
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                aria-label="Fechar configurações de acessibilidade"
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <Label htmlFor="high-contrast">Alto Contraste</Label>
              </div>
              <Switch
                id="high-contrast"
                checked={settings.highContrast}
                onCheckedChange={(checked) => {
                  updateSetting('highContrast', checked);
                  announceText(checked ? 'Alto contraste ativado' : 'Alto contraste desativado');
                }}
              />
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Type className="h-4 w-4" />
                <Label>Tamanho da Fonte: {settings.fontSize}px</Label>
              </div>
              <Slider
                value={[settings.fontSize]}
                onValueChange={(value) => updateSetting('fontSize', value[0])}
                min={12}
                max={24}
                step={1}
                className="w-full"
                aria-label="Tamanho da fonte"
              />
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MousePointer className="h-4 w-4" />
                <Label htmlFor="reduced-motion">Reduzir Animações</Label>
              </div>
              <Switch
                id="reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => {
                  updateSetting('reducedMotion', checked);
                  announceText(checked ? 'Animações reduzidas' : 'Animações normais');
                }}
              />
            </div>

            {/* Color Blind Mode */}
            <div className="space-y-2">
              <Label>Modo para Daltonismo</Label>
              <Select 
                value={settings.colorBlindMode} 
                onValueChange={(value) => updateSetting('colorBlindMode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  <SelectItem value="protanopia">Protanopia</SelectItem>
                  <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
                  <SelectItem value="tritanopia">Tritanopia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Voice Announcements */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4" />
                <Label htmlFor="voice-announcements">Anúncios por Voz</Label>
              </div>
              <Switch
                id="voice-announcements"
                checked={settings.voiceAnnouncements}
                onCheckedChange={(checked) => {
                  updateSetting('voiceAnnouncements', checked);
                  if (checked) {
                    announceText('Anúncios por voz ativados');
                  }
                }}
              />
            </div>

            {/* Keyboard Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MousePointer className="h-4 w-4" />
                <Label htmlFor="keyboard-nav">Navegação por Teclado</Label>
              </div>
              <Switch
                id="keyboard-nav"
                checked={settings.keyboardNavigation}
                onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
              />
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              onClick={resetSettings}
              className="w-full"
              aria-label="Restaurar configurações padrão de acessibilidade"
            >
              Restaurar Padrões
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add CSS styles */}
      <style>{`
        /* High Contrast Mode */
        .accessibility-high-contrast {
          filter: contrast(150%) brightness(110%);
        }

        .accessibility-high-contrast * {
          border-color: #000 !important;
        }

        .accessibility-high-contrast button {
          border: 2px solid #000 !important;
        }

        /* Font Size */
        .accessibility-font-size * {
          font-size: var(--accessibility-font-size) !important;
        }

        /* Reduced Motion */
        .accessibility-reduced-motion *,
        .accessibility-reduced-motion *::before,
        .accessibility-reduced-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }

        /* Keyboard Navigation */
        .accessibility-keyboard-nav *:focus {
          outline: 3px solid #4A90E2 !important;
          outline-offset: 2px !important;
        }

        /* Color Blind Modes */
        [data-colorblind-mode="protanopia"] {
          filter: url('#protanopia-filter');
        }

        [data-colorblind-mode="deuteranopia"] {
          filter: url('#deuteranopia-filter');
        }

        [data-colorblind-mode="tritanopia"] {
          filter: url('#tritanopia-filter');
        }

        /* Print Styles */
        @media print {
          .no-print {
            display: none !important;
          }

          .print-page-break {
            page-break-before: always;
          }

          body {
            font-size: 12pt !important;
            line-height: 1.4 !important;
            color: #000 !important;
            background: #fff !important;
          }

          .print-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 50px;
            padding: 10px;
            border-bottom: 1px solid #000;
            background: #fff;
          }

          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 30px;
            padding: 5px 10px;
            border-top: 1px solid #000;
            background: #fff;
            font-size: 10pt;
            text-align: center;
          }

          .print-content {
            margin-top: 60px;
            margin-bottom: 40px;
          }

          /* Chart and image optimizations for print */
          canvas, svg {
            max-width: 100% !important;
            height: auto !important;
          }

          /* Ensure tables print properly */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }

          th, td {
            border: 1px solid #000 !important;
            padding: 8px !important;
          }

          /* Page breaks */
          .card {
            page-break-inside: avoid;
            margin-bottom: 20px;
          }

          h1, h2, h3 {
            page-break-after: avoid;
          }
        }

        /* Skip Links for Screen Readers */
        .skip-link {
          position: absolute;
          top: -40px;
          left: 6px;
          background: #000;
          color: #fff;
          padding: 8px;
          text-decoration: none;
          z-index: 1000;
        }

        .skip-link:focus {
          top: 6px;
        }

        /* ARIA Live Regions */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        /* Focus management */
        .focus-trap {
          outline: none;
        }

        /* High contrast button states */
        .accessibility-high-contrast button:hover {
          background: #000 !important;
          color: #fff !important;
        }

        .accessibility-high-contrast button:focus {
          background: #fff !important;
          color: #000 !important;
          outline: 3px solid #000 !important;
        }
      `}</style>

      {/* SVG Filters for Color Blind Support */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix values="0.567, 0.433, 0,     0, 0
                                   0.558, 0.442, 0,     0, 0
                                   0,     0.242, 0.758, 0, 0
                                   0,     0,     0,     1, 0"/>
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix values="0.625, 0.375, 0,   0, 0
                                   0.7,   0.3,   0,   0, 0
                                   0,     0.3,   0.7, 0, 0
                                   0,     0,     0,   1, 0"/>
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix values="0.95, 0.05,  0,     0, 0
                                   0,    0.433, 0.567, 0, 0
                                   0,    0.475, 0.525, 0, 0
                                   0,    0,     0,     1, 0"/>
          </filter>
        </defs>
      </svg>

      {/* ARIA Live Region for Announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="accessibility-announcements"
      />

      {/* Skip Links */}
      <a href="#main-content" className="skip-link">
        Pular para conteúdo principal
      </a>
      <a href="#navigation" className="skip-link">
        Pular para navegação
      </a>
    </>
  );
};

export default AccessibilityEnhancements;
