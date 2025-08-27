// Configurações centralizadas de autenticação
export const AUTH_CONFIG = {
  // URLs de redirecionamento
  redirectUrls: {
    signIn: '/',
    signUp: '/',
    signOut: '/auth',
    emailConfirmation: '/'
  },
  
  // Configurações de sessão
  session: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true
  },
  
  // Configurações de segurança
  security: {
    minPasswordLength: 6,
    requireEmailConfirmation: false, // Desabilitado para desenvolvimento
    maxLoginAttempts: 5
  },
  
  // Mensagens de erro customizadas
  errorMessages: {
    'Invalid login credentials': 'Email ou senha incorretos',
    'Email not confirmed': 'Confirme seu email antes de fazer login',
    'User already registered': 'Este email já está cadastrado',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
    'Invalid email': 'Formato de email inválido',
    'Too many requests': 'Muitas tentativas. Aguarde alguns minutos',
    'captcha': 'Erro de verificação. Tente novamente',
    'Network error': 'Erro de conexão. Verifique sua internet'
  }
};

// Utilitário para traduzir mensagens de erro
export const translateAuthError = (error: any): string => {
  if (!error || !error.message) return 'Erro desconhecido';
  
  const message = error.message.toLowerCase();
  
  for (const [key, translation] of Object.entries(AUTH_CONFIG.errorMessages)) {
    if (message.includes(key.toLowerCase())) {
      return translation;
    }
  }
  
  return error.message || 'Erro de autenticação';
};