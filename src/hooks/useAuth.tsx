import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AUTH_CONFIG, translateAuthError } from '@/utils/authConfig';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, fullName: string, role: 'teacher' | 'student') => Promise<AuthResult>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  userRole: string | null;
  refreshSession: () => Promise<void>;
}

interface AuthResult {
  success: boolean;
  error?: string;
  needsConfirmation?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Resolve role from multiple sources without ever locking a teacher into student mode.
// Priority: user metadata (instant) -> profiles.role -> RPC get_user_role -> keep metadata or 'student'
const loadProfileRole = async (
  user: User,
  setUserRole: (r: string | null) => void
) => {
  const metaRole =
    (user.user_metadata as any)?.role ||
    (user.app_metadata as any)?.role ||
    null;
  if (metaRole) setUserRole(metaRole);

  const withTimeout = <T,>(p: Promise<T>, ms = 4000) =>
    Promise.race<T | null>([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);

  try {
    const profileRole = await withTimeout(
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => ((data as any)?.role as string) || null)
    );
    if (profileRole) {
      setUserRole(profileRole);
      return;
    }
  } catch (err) {
    console.warn('⚠️ Profile fetch failed:', err);
  }

  try {
    const rpcRole = await withTimeout(
      supabase
        .rpc('get_user_role', { user_id: user.id })
        .then(({ data }) => ((data as any) as string) || null)
    );
    if (rpcRole) {
      setUserRole(rpcRole);
      return;
    }
  } catch (err) {
    console.warn('⚠️ RPC get_user_role failed:', err);
  }

  if (!metaRole) setUserRole('student');
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const initRan = useRef(false);

  useEffect(() => {
    if (initRan.current) return;
    initRan.current = true;

    let mounted = true;

    // Listener FIRST (no await inside callback — Supabase deadlock guard)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      console.log('🔐 Auth state change:', event, newSession?.user?.email);
      setSession(newSession);
      setUser(newSession?.user || null);
      if (newSession?.user) {
        loadProfileRole(newSession.user, setUserRole);
      } else {
        setUserRole(null);
      }
      if (event === 'SIGNED_OUT') setLoading(false);
    });

    // Then initial session
    (async () => {
      try {
        console.log('🔐 Inicializando sistema de autenticação...');
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) console.error('Erro ao obter sessão:', error);

        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user || null);
        setLoading(false);
        setInitialized(true);

        console.log('🔐 Autenticação inicializada:', {
          hasSession: !!currentSession,
          email: currentSession?.user?.email,
        });

        if (currentSession?.user) {
          loadProfileRole(currentSession.user.id, setUserRole);
        }
      } catch (err) {
        console.error('Erro na inicialização da auth:', err);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    })();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return { success: false, error: translateAuthError(error) };
      if (data.user) return { success: true };
      return { success: false, error: 'Erro inesperado no login' };
    } catch {
      return { success: false, error: 'Erro de conexão. Verifique sua internet.' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'teacher' | 'student'): Promise<AuthResult> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${AUTH_CONFIG.redirectUrls.signUp}`,
          data: { full_name: fullName.trim(), role },
        },
      });
      if (error) return { success: false, error: translateAuthError(error) };
      if (data.user) {
        if (!data.session && !data.user.email_confirmed_at) {
          return { success: true, needsConfirmation: true };
        }
        return { success: true };
      }
      return { success: false, error: 'Erro inesperado no registro' };
    } catch {
      return { success: false, error: 'Erro de conexão. Verifique sua internet.' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async (): Promise<void> => {
    try {
      await supabase.auth.refreshSession();
    } catch (err) {
      console.error('Erro ao renovar sessão:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        initialized,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
        userRole,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
