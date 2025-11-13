'use client';

import { useState, useEffect } from 'react';
import ClaimBuildModal from './ClaimBuildModal';

interface BuildPageClientProps {
  projectSlug: string;
  projectNumber: number;
  isClaimed: boolean;
  children: React.ReactNode;
}

export default function BuildPageClient({ projectSlug, projectNumber, isClaimed, children }: BuildPageClientProps) {
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if build is already claimed in localStorage
    const claimedBuilds = JSON.parse(localStorage.getItem('claimed_builds') || '[]');
    const isClaimedLocally = claimedBuilds.includes(projectSlug);

    // Show modal if not claimed server-side AND not claimed locally
    if (!isClaimed && !isClaimedLocally) {
      setShowClaimModal(true);
    }
  }, [isClaimed, projectSlug]);

  const handleClaimed = () => {
    setShowClaimModal(false);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      {showClaimModal && (
        <ClaimBuildModal
          projectSlug={projectSlug}
          projectNumber={projectNumber}
          onClaimed={handleClaimed}
        />
      )}
    </>
  );
}
