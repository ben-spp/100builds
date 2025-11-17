'use client';

import { useState, useEffect, cloneElement, Children, isValidElement } from 'react';
import ClaimBuildModal from './ClaimBuildModal';
import ContactModal from './ContactModal';

interface BuildPageClientProps {
  projectSlug: string;
  projectNumber: number;
  isClaimed: boolean;
  projectName?: string;
  allowContact?: boolean;
  children: React.ReactNode;
}

export default function BuildPageClient({ projectSlug, projectNumber, isClaimed, projectName, allowContact = true, children }: BuildPageClientProps) {
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if build is already claimed in localStorage
    const claimedBuilds = JSON.parse(localStorage.getItem('claimed_builds') || '[]');
    const isClaimedLocally = claimedBuilds.includes(projectSlug);

    // Show modal if not claimed server-side AND not claimed locally
    if (!isClaimed && !isClaimedLocally) {
      setShowClaimModal(true);
    }

    // Fetch like status
    fetchLikeStatus();
  }, [isClaimed, projectSlug]);

  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(`/api/like?slug=${encodeURIComponent(projectSlug)}`);
      const data = await response.json();
      if (response.ok) {
        setLiked(data.liked);
        setLikes(data.likes);
      }
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  const handleLike = async () => {
    if (liking) return;

    setLiking(true);
    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: projectSlug }),
      });

      const data = await response.json();
      if (response.ok) {
        setLiked(data.liked);
        setLikes(data.likes);
      }
    } catch (error) {
      console.error('Error liking project:', error);
    } finally {
      setLiking(false);
    }
  };

  const handleClaimed = () => {
    setShowClaimModal(false);
  };

  const handleContactClick = () => {
    setShowContactModal(true);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  // Inject handlers into children
  const childrenWithProps = Children.map(children, (child) => {
    if (isValidElement(child)) {
      return cloneElement(child as React.ReactElement<any>, {
        onLike: handleLike,
        liked,
        likes,
        onContactClick: handleContactClick,
      });
    }
    return child;
  });

  return (
    <>
      {childrenWithProps}
      {showClaimModal && (
        <ClaimBuildModal
          projectSlug={projectSlug}
          projectNumber={projectNumber}
          onClaimed={handleClaimed}
        />
      )}
      {showContactModal && allowContact && (
        <ContactModal
          projectSlug={projectSlug}
          projectName={projectName || ''}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </>
  );
}
