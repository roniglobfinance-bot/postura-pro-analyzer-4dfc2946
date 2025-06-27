
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PricingPlans = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 'Grátis',
      period: '',
      description: 'Ideal para começar',
      features: [
        'Avaliação postural básica',
        '3 treinos personalizados',
        'Relatório inicial',
        'Suporte por email'
      ],
      buttonText: 'Já ativado ✅',
      buttonVariant: 'secondary' as const,
      disabled: true,
      icon: Star
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'R$ 29,90',
      period: '/mês',
      description: 'Para resultados consistentes',
      features: [
        'Tudo do plano Free',
        'Treinos ilimitados',
        'Análise postural avançada',
        'Relatórios detalhados',
        'Acompanhamento temporal',
        'Suporte prioritário'
      ],
      buttonText: 'Assinar Pro 💳',
      buttonVariant: 'default' as const,
      disabled: false,
      popular: true,
      icon: Crown
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 99,90',
      period: '/mês',
      description: 'Para profissionais e clínicas',
      features: [
        'Tudo do plano Pro',
        'Múltiplos clientes',
        'Dashboard profissional',
        'Prescrição automática avançada',
        'Integração com sistemas',
        'Suporte 24/7',
        'Treinamento personalizado'
      ],
      buttonText: 'Assinar Premium 🚀',
      buttonVariant: 'default' as const,
      disabled: false,
      icon: Zap
    }
  ];

  const handleSubscribe = async (planId: string, planName: string, price: string) => {
    setIsProcessing(true);
    
    // Simular integração com Google Sheets para pagamentos
    try {
      // Aqui você integraria com Stripe ou outro gateway de pagamento
      // Por enquanto, vamos simular o processo
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular loading
      
      toast({
        title: "Redirecionando para pagamento... 💳",
        description: `Plano ${planName} - ${price}`,
      });
      
      // Simular redirecionamento para checkout
      console.log(`Processando assinatura do plano ${planName}`);
      
      // Aqui você poderia enviar dados para Google Sheets
      const subscriptionData = {
        plan: planName,
        price: price,
        timestamp: new Date().toISOString(),
        userId: 'user-' + Math.random().toString(36).substr(2, 9)
      };
      
      console.log('Dados da assinatura:', subscriptionData);
      
    } catch (error) {
      toast({
        title: "Erro no processamento",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Escolha seu Plano</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Transforme sua postura com nosso sistema de avaliação e correção personalizada. 
          Escolha o plano ideal para suas necessidades.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-[#2E5A88] shadow-lg scale-105' : ''} hover:shadow-lg transition-all`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#2E5A88] text-white">
                  Mais Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <Icon className={`h-8 w-8 mx-auto mb-4 ${plan.popular ? 'text-[#2E5A88]' : 'text-gray-600'}`} />
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-[#2E5A88]' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-[#4CAF50] mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-[#2E5A88] hover:bg-[#1e3a5f]' 
                      : plan.disabled 
                        ? 'bg-[#4CAF50]' 
                        : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                  variant={plan.buttonVariant}
                  disabled={plan.disabled || isProcessing}
                  onClick={() => !plan.disabled && handleSubscribe(plan.id, plan.name, plan.price)}
                >
                  {isProcessing ? 'Processando...' : plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-gray-500 max-w-2xl mx-auto">
        <p>
          🔒 Pagamento seguro via Stripe • Cancele quando quiser • 
          Suporte especializado • Garantia de 7 dias
        </p>
      </div>
    </div>
  );
};

export default PricingPlans;
