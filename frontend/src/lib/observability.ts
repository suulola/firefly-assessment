// Client error-reporting boundary. Nothing else in the app should call
// console.error directly for an unexpected failure — go through here instead,
// so swapping in Sentry/Datadog/etc. later is a one-file change (replace the
// sink, keep every call site as-is).

export interface ErrorReportContext {
  /** Component or module the error originated in, e.g. "ErrorBoundary", "useFavorites". */
  source: string;
  /** The query/mutation/action name, e.g. "toggleFavorite", "pokemon.list". */
  action?: string;
  /** Not populated yet — reserved for a backend-issued request id once the API sends one. */
  requestId?: string;
  extra?: Record<string, unknown>;
}

export type ErrorSink = (error: unknown, context: ErrorReportContext) => void;

const consoleSink: ErrorSink = (error, context) => {
  const label = context.action ? `${context.source}:${context.action}` : context.source;
  // eslint-disable-next-line no-console -- this *is* the reporting sink.
  console.error(`[${label}]`, error, context.extra ?? {});
};

// A no-op default keeps test output quiet without every test having to
// remember to mock console.error; tests that specifically want to assert
// reporting happened can call setErrorSink(vi.fn()) and check it directly.
const noopSink: ErrorSink = () => {};

let sink: ErrorSink = import.meta.env.MODE === "test" ? noopSink : consoleSink;

/** Swap the reporting sink — plug in Sentry/Datadog here, or a spy in tests. */
export function setErrorSink(nextSink: ErrorSink): void {
  sink = nextSink;
}

/** Restore the environment-appropriate default sink (console in dev/prod, no-op in test). */
export function resetErrorSink(): void {
  sink = import.meta.env.MODE === "test" ? noopSink : consoleSink;
}

export function reportError(error: unknown, context: ErrorReportContext): void {
  sink(error, context);
}

export function reportQueryError(
  error: unknown,
  context: Omit<ErrorReportContext, "action"> & { queryKey?: unknown },
): void {
  const { queryKey, ...rest } = context;
  reportError(error, {
    ...rest,
    action: "query",
    extra: { ...rest.extra, queryKey },
  });
}

export function reportMutationError(
  error: unknown,
  context: Omit<ErrorReportContext, "action"> & { mutationKey?: unknown },
): void {
  const { mutationKey, ...rest } = context;
  reportError(error, {
    ...rest,
    action: "mutation",
    extra: { ...rest.extra, mutationKey },
  });
}
