'use client';

import { useState } from 'react';

interface LinkAccordionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function LinkAccordion({ title, description, defaultOpen = false, children }: LinkAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 bg-surface-1 hover:bg-surface-2 transition-colors flex items-center justify-between"
      >
        <div className="text-left">
          <h3 className="text-sm font-bold text-text-primary">{title}</h3>
          {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
        </div>
        <svg
          className={`w-5 h-5 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 bg-surface-0">
          {children}
        </div>
      )}
    </div>
  );
}
