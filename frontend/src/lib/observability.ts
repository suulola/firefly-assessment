export interface ErrorReportContext {
  source: string;
  action?: string;
  requestId?: string;
  extra?: Record<string, unknown>;
}

export type ErrorSink = (error: unknown, context: ErrorReportContext) => void;

const consoleSink: ErrorSink = (error, context) => {
  const label = context.action ? `${context.source}:${context.action}` : context.source;
  console.error(`[${label}]`, error, context.extra ?? {});
};

const noopSink: ErrorSink = () => {};

let sink: ErrorSink = import.meta.env.MODE === "test" ? noopSink : consoleSink;

export function setErrorSink(nextSink: ErrorSink): void {
  sink = nextSink;
}

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
