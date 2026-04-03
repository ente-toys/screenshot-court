"use client";

import { ERROR_MESSAGES, type ErrorCode } from "@/lib/state";

interface ErrorStateProps {
  code: ErrorCode;
  onRetry: () => void;
  onNewCase: () => void;
}

export default function ErrorState({ code, onRetry, onNewCase }: ErrorStateProps) {
  const message = ERROR_MESSAGES[code];
  const showRetry = code === "MODEL_FAILURE";
  const showCooldown = code === "RATE_LIMITED";

  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-surface-raised flex items-center justify-center">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-guilty"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <p className="text-xl font-semibold text-foreground">{message}</p>

      {showCooldown && (
        <p className="text-muted text-sm">Rate limit resets in a moment.</p>
      )}

      <div className="flex gap-3 mt-2">
        {showRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-accent text-background font-semibold rounded-xl
                       hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Try Again
          </button>
        )}
        <button
          onClick={onNewCase}
          className="px-6 py-3 bg-surface-raised text-foreground font-semibold rounded-xl
                     hover:bg-surface-overlay active:scale-[0.98] transition-all"
        >
          New Case
        </button>
      </div>
    </div>
  );
}
