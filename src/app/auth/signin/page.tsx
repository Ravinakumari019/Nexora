'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Bot, Mail, MessageCircle, AlertTriangle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function SignInContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Map NextAuth error codes to user friendly messages
  useEffect(() => {
    if (errorCode) {
      switch (errorCode.toLowerCase()) {
        case 'credentialssignin':
          setErrorMsg('Invalid credentials. Please verify your email and try again.');
          break;
        case 'oauthsignin':
          setErrorMsg('Could not start the login handshake. Please try again.');
          break;
        case 'oauthcallback':
          setErrorMsg('An error occurred during Google authentication. Try again.');
          break;
        case 'oauthcreateaccount':
          setErrorMsg('Could not register a user profile using your Google account.');
          break;
        case 'emailcreateaccount':
          setErrorMsg('Could not register credentials user in the database.');
          break;
        case 'callback':
          setErrorMsg('An error occurred during verification callback.');
          break;
        default:
          setErrorMsg('An authentication error occurred. Please try again.');
          break;
      }
    }
  }, [errorCode]);

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    setErrorMsg(null);
    try {
      await signIn('google', { callbackUrl: '/chat' });
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to redirect to Google Login.');
      setLoadingGoogle(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loadingCredentials) return;

    setLoadingCredentials(true);
    setErrorMsg(null);

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        callbackUrl: '/chat',
        redirect: true,
      });
      
      if (result?.error) {
        setErrorMsg('Invalid login attempt. Please check your credentials.');
        setLoadingCredentials(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred signing in. Please check if your servers are running.');
      setLoadingCredentials(false);
    }
  };

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="bg-radial from-orange-50 via-background to-background dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 relative flex min-h-screen items-center justify-center p-4 overflow-hidden font-sans antialiased">
      {/* Background patterns */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl dark:bg-orange-500/5" />

      <div className="mx-auto w-full max-w-md space-y-6 relative z-10">
        {/* Branding */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg shadow-primary/20">
            <MessageCircle className="text-primary-foreground h-6 w-6" />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Nexora</h1>
          <p className="text-muted-foreground text-sm max-w-xs">
            Premium Real-Time Chat & AI Collaborative Workspace
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="border border-destructive/20 bg-destructive/10 text-destructive flex items-start gap-3 rounded-xl p-3 text-sm animate-shake shadow-sm">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Login Container */}
        <Card className="border-border/50 bg-background/50 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-center">Sign In to Your Account</CardTitle>
            <CardDescription className="text-center text-xs">
              Connect via Google OAuth or Development credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Login Button */}
            <Button
              type="button"
              variant="outline"
              disabled={loadingGoogle || loadingCredentials}
              onClick={handleGoogleSignIn}
              className="bg-background hover:bg-accent border-border flex w-full items-center justify-center gap-2.5 rounded-xl h-11 text-sm font-semibold transition-all duration-200"
            >
              {loadingGoogle ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
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
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            {/* Dev Mode Credentials */}
            {isDev ? (
              <div className="space-y-4 pt-2">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-border/60"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    Development Credentials
                  </span>
                  <div className="flex-grow border-t border-border/60"></div>
                </div>

                <form onSubmit={handleCredentialsSignIn} className="space-y-3">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="admin@nexora.dev"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loadingGoogle || loadingCredentials}
                        className="bg-background border-border pl-10 h-11 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={!email.trim() || loadingGoogle || loadingCredentials}
                    className="w-full rounded-xl h-11 font-semibold shadow-md shadow-primary/10 transition-all duration-200"
                  >
                    {loadingCredentials ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In (Passwordless)'
                    )}
                  </Button>
                </form>

                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3 flex gap-2.5 text-xs text-muted-foreground leading-normal">
                  <Bot size={16} className="text-primary shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="font-semibold text-foreground">Sandbox Presets:</span> Use{' '}
                    <code className="bg-primary/10 px-1 rounded font-mono text-primary">admin@nexora.dev</code> or{' '}
                    <code className="bg-primary/10 px-1 rounded font-mono text-primary">demo@nexora.dev</code> to sign in with pre-loaded mock profiles.
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
