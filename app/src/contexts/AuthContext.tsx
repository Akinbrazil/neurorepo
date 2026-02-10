// NeuroScope VR - Authentication Context
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getCurrentUser, getProfile } from '@/lib/supabase';
import type { Profile, AppView, UserRole } from '@/types';

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  error: string | null;
  currentView: AppView;
  role: UserRole | null;
  setCurrentView: (view: AppView) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [role, setRole] = useState<UserRole | null>(null);

  // Helper to log session metadata
  const logSessionMetadata = async (userId: string) => {
    try {
      // In a real browser environment, we might use a service to get IP
      // Here we'll simulate or capture what we can from navigator
      const metadata = {
        user_id: userId,
        device_type: navigator.userAgent.includes('Mobi') ? 'mobile' : 'desktop',
        platform: navigator.platform,
        language: navigator.language,
        timestamp: new Date().toISOString()
      };

      console.log("Logging session metadata:", metadata);

      // In a real Supabase setup, we'd insert into a 'session_logs' table
      // await supabase.from('session_logs').insert([metadata]);
    } catch (err) {
      console.warn("Failed to log session metadata", err);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { user: authUser, error: authError } = await getCurrentUser();

        if (authError || !authUser) {
          setIsLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await getProfile(authUser.id);

        if (profileError) {
          setError('Erro ao carregar perfil');
          setIsLoading(false);
          return;
        }

        setUser(profile);
        setRole(profile?.role || 'therapist');
        setCurrentView('dashboard');
        if (authUser.id) logSessionMetadata(authUser.id);
      } catch (err) {
        setError('Erro de autenticação');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await getProfile(session.user.id);
          setUser(profile);
          setRole(profile?.role || 'therapist');
          setCurrentView(prev => (prev === 'landing' || prev === 'login') ? 'dashboard' : prev);
          logSessionMetadata(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setRole(null);
          setCurrentView('landing');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw new Error(signInError.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos'
          : signInError.message
        );
      }

      if (data.user) {
        const { data: profile, error: profileError } = await getProfile(data.user.id);

        if (profileError) {
          throw new Error('Erro ao carregar perfil');
        }

        setUser(profile);
        setCurrentView('dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      setCurrentView('landing');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (data.user) {
        setError('Verifique seu email para confirmar o cadastro');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        currentView,
        role,
        setCurrentView,
        login,
        logout,
        register,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
