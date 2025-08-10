'use client';

import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRabby } from '@/hooks/use-rabby';
import { Button } from '@basket-fi/ui';
import { useState } from 'react';

export function ConnectButton() {
  return <RainbowConnectButton />;
}

// Enhanced version with Rabby detection
export function SimpleConnectButton() {
  const { isConnected } = useAccount();
  const { isRabbyInstalled, connectRabby } = useRabby();
  const [showRabbyOption, setShowRabbyOption] = useState(false);

  if (isConnected) {
    return <RainbowConnectButton />;
  }

  return (
    <div className="flex items-center space-x-2">
      {isRabbyInstalled && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRabbyOption(!showRabbyOption)}
          className="text-xs"
        >
          {showRabbyOption ? '🦊 Rabby' : '🌈 Wallets'}
        </Button>
      )}
      
      {showRabbyOption && isRabbyInstalled ? (
        <Button
          onClick={connectRabby}
          size="sm"
        >
          Connect Rabby
        </Button>
      ) : (
        <RainbowConnectButton />
      )}
    </div>
  );
}