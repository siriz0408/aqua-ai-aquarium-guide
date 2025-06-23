
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = authService.onAuthStateChange(
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
    authService.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  return { user, session, loading, setLoading, setSession, setUser };
};
