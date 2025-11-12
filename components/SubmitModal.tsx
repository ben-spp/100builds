'use client';

import Link from 'next/link';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectSlug: string;
  projectNumber: number;
}

export default function SubmitModal({ isOpen, onClose, projectSlug, projectNumber }: SubmitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface-1 border border-border rounded-2xl p-8 shadow-2xl">
        <div className="text-center space-y-6">
          {/* Success Icon */}
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Build #{projectNumber} is live!
            </h2>
            <p className="text-text-secondary">
              Your project page is now available
            </p>
          </div>

          {/* Stage indicator */}
          {projectNumber < 100 && (
            <div className="p-4 bg-surface-2 rounded-xl">
              <p className="text-sm text-text-muted">
                Stage 2 unlocks in <span className="font-bold text-primary">{100 - projectNumber}</span> more builds
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href={`/project/${projectSlug}`}
              className="block w-full px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-colors"
            >
              View your project
            </Link>
            <button
              onClick={onClose}
              className="block w-full px-6 py-3 bg-surface-2 hover:bg-border text-text-primary font-semibold rounded-xl transition-colors"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
