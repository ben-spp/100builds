'use client';

import { useState } from 'react';

interface ClaimBuildModalProps {
  projectSlug: string;
  projectNumber: number;
  onClaimed: () => void;
}

export default function ClaimBuildModal({ projectSlug, projectNumber, onClaimed }: ClaimBuildModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/claim-build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: projectSlug, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim build');
      }

      // Store claimed build in cookie/localStorage
      const claimedBuilds = JSON.parse(localStorage.getItem('claimed_builds') || '[]');
      claimedBuilds.push(projectSlug);
      localStorage.setItem('claimed_builds', JSON.stringify(claimedBuilds));

      onClaimed();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-surface-0/60">
      <div className="bg-surface-1 border border-border shadow-2xl rounded-2xl p-8 text-center max-w-sm w-full mx-4">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-text-primary mb-2">
          🎉 Your build is live — almost
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          Enter your email to claim it and make future edits.<br />
          <span className="text-text-muted text-xs">If unclaimed, this listing may be removed automatically.</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            required
            className="w-full rounded-xl border border-border bg-surface-0 p-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white rounded-xl py-3 font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Claim Build'}
          </button>
        </form>

        <p className="text-xs text-text-muted mt-4">
          We'll send you a magic link to verify and unlock your build.
        </p>
      </div>
    </div>
  );
}
