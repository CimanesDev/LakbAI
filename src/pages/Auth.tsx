import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plane } from 'lucide-react';
import Navbar from "@/components/Navbar";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, signOut } = useAuth();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, fullName);
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      } else {
        await signIn(email, password);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Authentication failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google sign in error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign in with Google",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <AnimatedBackground />
      
      <Navbar user={user} onSignOut={handleSignOut} />

      <div className="container mx-auto px-4 h-[calc(100vh-4rem)] flex items-center justify-center relative z-10">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/images/1.png" 
                alt="LakbAI Logo" 
                className="h-12 w-auto" 
              />
            </div>
            <h1 className="text-3xl font-bold text-[#0032A0] mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-[#0032A0]/70">
              {isSignUp ? 'Start planning your dream trips' : 'Sign in to continue your journey'}
            </p>
          </div>

          <Card className="border border-[#0032A0]/20">
            <CardHeader>
              <CardTitle className="text-[#0032A0]">{isSignUp ? 'Sign Up' : 'Sign In'}</CardTitle>
              <CardDescription className="text-[#0032A0]/70">
                {isSignUp
                  ? 'Create your account to start planning amazing trips'
                  : 'Enter your credentials to access your account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#0032A0]">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="border-[#0032A0]/20 focus:border-[#0032A0]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#0032A0]">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="border-[#0032A0]/20 focus:border-[#0032A0]"
                  />
                </div>
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-[#0032A0]">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="border-[#0032A0]/20 focus:border-[#0032A0]"
                    />
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0032A0] hover:bg-[#0032A0]/90 text-white"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#0032A0]/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-[#0032A0]/70">Or continue with</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full border-[#0032A0]/20 text-[#0032A0] hover:bg-[#0032A0]/10"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
              <div className="text-center text-sm text-[#0032A0]/70">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="font-medium text-[#0032A0] hover:text-[#0032A0]/90"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
