'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

interface OnboardingContinueProps {
  docsComplete: boolean;
  callbackUrl: string;
}

export function OnboardingContinue({ docsComplete, callbackUrl }: OnboardingContinueProps) {
  const router = useRouter();
  const { update } = useSession();
  const [busy, setBusy] = useState(false);

  const handleContinue = async () => {
    setBusy(true);
    // Refresh the session JWT so middleware sees the completed profile
    await update();
    router.push(callbackUrl);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button className="w-full" disabled={!docsComplete} loading={busy} onClick={handleContinue}>
        Continue
      </Button>
      {!docsComplete && <p className="text-xs text-gray-400">Upload both documents to continue.</p>}
    </div>
  );
}
