'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wallet, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function SignInPage() {
  const t = useTranslations('auth');
  const { login, isLoggingIn, loginError } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleWalletConnect = async () => {
    setIsConnecting(true);
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const isLoading = isLoggingIn || isConnecting;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          {t('signIn.title', { default: 'Sign in to your account' })}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {t('signIn.subtitle', { 
            default: 'Connect your wallet to access your DeFi portfolios' 
          })}
        </p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>{t('signIn.connectWallet', { default: 'Connect Wallet' })}</span>
          </CardTitle>
          <CardDescription>
            {t('signIn.walletDescription', { 
              default: 'Use your Web3 wallet to sign in securely' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loginError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {loginError instanceof Error 
                  ? loginError.message 
                  : t('signIn.error', { default: 'Failed to connect wallet. Please try again.' })
                }
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleWalletConnect}
            disabled={isLoading}
            className="w-full wallet-button"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isConnecting 
                  ? t('signIn.connecting', { default: 'Connecting...' })
                  : t('signIn.signingIn', { default: 'Signing in...' })
                }
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                {t('signIn.connectMetaMask', { default: 'Connect with MetaMask' })}
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              {t('signIn.noWallet', { default: "Don't have a wallet?" })}{' '}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {t('signIn.downloadMetaMask', { default: 'Download MetaMask' })}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          {t('signIn.terms', { 
            default: 'By connecting your wallet, you agree to our' 
          })}{' '}
          <a href="/terms" className="text-primary hover:underline">
            {t('signIn.termsOfService', { default: 'Terms of Service' })}
          </a>{' '}
          {t('signIn.and', { default: 'and' })}{' '}
          <a href="/privacy" className="text-primary hover:underline">
            {t('signIn.privacyPolicy', { default: 'Privacy Policy' })}
          </a>
        </p>
      </div>
    </div>
  );
}