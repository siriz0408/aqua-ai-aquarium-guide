
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, requestAdminAccess?: boolean) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle successful sign up
        if (event === 'SIGNED_UP' && session?.user) {
          toast({
            title: "Welcome to AquaAI!",
            description: "Your 1-day free trial has started. Enjoy full access to all features!",
          });
        }
        
        // Handle successful sign in
        if (event === 'SIGNED_IN' && session?.user) {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in to AquaAI.",
          });
        }
        
        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out successfully');
          toast({
            title: "Signed out",
            description: "You've been successfully signed out.",
          });
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          toast({
            title: "Sign in failed",
            description: "Invalid email or password. Please check your credentials and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return { error };
      }

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, requestAdminAccess: boolean = false) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            request_admin_access: requestAdminAccess
          }
        }
      });

      if (error) {
        if (error.message === 'User already registered') {
          toast({
            title: "Account exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return { error };
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link. Please check your email to complete registration.",
        });
      }

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      // Check if user is already signed out
      if (!session && !user) {
        console.log('User is already signed out');
        toast({
          title: "Already signed out",
          description: "You are already signed out.",
        });
        return;
      }

      setLoading(true);
      
      // Clear local state immediately to prevent race conditions
      setSession(null);
      setUser(null);
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        // Only show error toast if it's not a session missing error
        if (!error.message.includes('Auth session missing')) {
          toast({
            title: "Sign out failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          // For session missing errors, just log and treat as successful
          console.log('Session was already missing, treating as successful signout');
        }
      } else {
        console.log('Sign out successful');
      }
    } catch (error: any) {
      console.error('Unexpected sign out error:', error);
      // For session missing errors, don't show error toast
      if (!error.message?.includes('Auth session missing')) {
        toast({
          title: "Sign out failed",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
