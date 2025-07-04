
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [requestAdminAccess, setRequestAdminAccess] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showAdminSignup, setShowAdminSignup] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp || showAdminSignup) {
        if (!fullName.trim()) {
          toast({
            title: "Full name required",
            description: "Please enter your full name to create an account.",
            variant: "destructive",
          });
          return;
        }
        
        await signUp(email, password, fullName, requestAdminAccess);
      } else {
        const { error } = await signIn(email, password);
        if (!error) {
          navigate('/');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const getTitle = () => {
    if (showAdminSignup) return 'Admin Registration';
    if (isSignUp) return 'Start Your Free Trial';
    return 'Welcome Back';
  };

  const getDescription = () => {
    if (showAdminSignup) return 'Create an admin account for AquaAI';
    if (isSignUp) return 'Create your account and start your 3-day free trial';
    return 'Sign in to access your AquaAI account';
  };

  return (
    <Layout title={getTitle()}>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full ocean-gradient flex items-center justify-center">
              <span className="text-white font-bold text-lg">🐠</span>
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {getTitle()}
            </CardTitle>
            <CardDescription>
              {getDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google OAuth Button - only show for regular flows */}
            {!showAdminSignup && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {(isSignUp || showAdminSignup) && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={isSignUp || showAdminSignup}
                    disabled={loading || googleLoading}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || googleLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || googleLoading}
                  minLength={6}
                />
                {(isSignUp || showAdminSignup) && (
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>

              {/* Admin Access Request - only show for admin signup */}
              {showAdminSignup && (
                <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requestAdminAccess"
                      checked={requestAdminAccess}
                      onCheckedChange={(checked) => setRequestAdminAccess(checked === true)}
                      disabled={loading || googleLoading}
                    />
                    <Label 
                      htmlFor="requestAdminAccess" 
                      className="text-sm font-medium cursor-pointer flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4 text-blue-600" />
                      Request Admin Access
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    Check this box to request administrator privileges for your account. 
                    Admin access includes user management, analytics, and system settings.
                  </p>
                </div>
              )}

              {/* Stay Logged In Option - only show for sign in */}
              {!isSignUp && !showAdminSignup && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="stayLoggedIn"
                    checked={stayLoggedIn}
                    onCheckedChange={(checked) => setStayLoggedIn(checked === true)}
                    disabled={loading || googleLoading}
                  />
                  <Label 
                    htmlFor="stayLoggedIn" 
                    className="text-sm font-normal cursor-pointer"
                  >
                    Keep me signed in
                  </Label>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full ocean-gradient hover:opacity-90"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp || showAdminSignup ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  <>
                    {showAdminSignup ? 'Create Admin Account' : 
                     isSignUp ? 'Start Free Trial' : 'Sign In'}
                  </>
                )}
              </Button>
            </form>

            {/* Trial Benefits - only show for regular signup */}
            {isSignUp && !showAdminSignup && (
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  🎉 3-Day Free Trial Includes:
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• AI-Powered AquaBot Chat</li>
                  <li>• Advanced Setup Planner</li>
                  <li>• Unlimited tank tracking</li>
                  <li>• Water parameter logging</li>
                  <li>• Equipment management</li>
                </ul>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  No credit card required • Cancel anytime
                </p>
              </div>
            )}
            
            {/* Toggle between sign in/up and admin registration */}
            <div className="text-center space-y-2">
              {!showAdminSignup ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  </p>
                  <Button 
                    variant="link" 
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => setIsSignUp(!isSignUp)}
                    disabled={loading || googleLoading}
                  >
                    {isSignUp ? 'Sign In' : 'Start Free Trial'}
                  </Button>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Need admin access?</p>
                    <Button 
                      variant="link" 
                      className="text-blue-600 hover:text-blue-700 text-sm"
                      onClick={() => setShowAdminSignup(true)}
                      disabled={loading || googleLoading}
                    >
                      Admin Registration
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Already have an account?
                  </p>
                  <Button 
                    variant="link" 
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => {
                      setShowAdminSignup(false);
                      setIsSignUp(false);
                    }}
                    disabled={loading || googleLoading}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
