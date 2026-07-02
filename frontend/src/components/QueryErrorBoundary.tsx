import type { ReactNode } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorFallback } from "@/components/ErrorFallback";

interface QueryErrorBoundaryProps {
  children: ReactNode;
  title: string;
  className?: string;
}

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
