import type { ReactNode } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorFallback } from "@/components/ErrorFallback";

interface QueryErrorBoundaryProps {
  children: ReactNode;
  title: string;
  className?: string;
}

// Pairs a render-crash ErrorBoundary with React Query's reset coordination:
// retrying from the fallback also clears any query error state the crash
// may have been caused by, so the retried render doesn't immediately
// re-throw from stale cached error state.
export function QueryErrorBoundary({ children, title, className }: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          source={title}
          fallback={(error, resetBoundary) => (
            <div className={className}>
              <ErrorFallback title={title} message={error.message} onRetry={resetBoundary} />
            </div>
          )}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
