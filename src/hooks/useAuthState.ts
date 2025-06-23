
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
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_UP' && session?.user) {
          console.log('New user signed up:', session.user.id);
          toast({
            title: "Welcome to AquaAI!",
            description: "Your account has been created successfully. You now have access to all features!",
          });
        }
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in:', session.user.id);
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in to AquaAI.",
          });
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out successfully');
          toast({
            title: "Signed out",
            description: "You've been successfully signed out.",
          });
        }
      }
    );

    authService.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  return { user, session, loading, setLoading, setSession, setUser };
};
