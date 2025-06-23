
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

export const useAuthActions = (setLoading: (loading: boolean) => void, setSession: any, setUser: any) => {
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await authService.signIn(email, password);

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

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const { data, error } = await authService.signUp(email, password, fullName);

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
          title: "Welcome to AquaAI!",
          description: "Account created successfully! All features are now available to you.",
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
      
      if (!setSession && !setUser) {
        console.log('User is already signed out');
        toast({
          title: "Already signed out",
          description: "You are already signed out.",
        });
        return;
      }

      setLoading(true);
      
      setSession(null);
      setUser(null);
      
      const { error } = await authService.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        if (!error.message.includes('Auth session missing')) {
          toast({
            title: "Sign out failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          console.log('Session was already missing, treating as successful signout');
        }
      } else {
        console.log('Sign out successful');
      }
    } catch (error: any) {
      console.error('Unexpected sign out error:', error);
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

  return { signIn, signUp, signOut };
};
