
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

  const signUp = async (email: string, password: string, fullName: string, requestAdminAccess: boolean = false) => {
    try {
      setLoading(true);
      const { data, error } = await authService.signUp(email, password, fullName, requestAdminAccess);

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
      if (!setSession && !setUser) {
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
      const { error } = await authService.signOut();
      
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

  return { signIn, signUp, signOut };
};
