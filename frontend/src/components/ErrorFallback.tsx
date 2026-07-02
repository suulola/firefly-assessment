import styles from "./ErrorFallback.module.scss";

interface ErrorFallbackProps {
  title?: string;
  message: string;
  onRetry: () => void;
}

export function ErrorFallback({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorFallbackProps) {
  return (
    <div className={styles.box} role="alert">
      <div className={styles.icon}>⚠</div>
      <div className={styles.title}>{title}</div>
      <div className={styles.message}>{message}</div>
      {/* Autofocus: this fallback replaces content the user was likely
          interacting with, so keyboard/screen-reader users land straight on
          the one recovery action rather than needing to hunt for it. */}
      <button type="button" className={styles.retryButton} onClick={onRetry} autoFocus>
        Retry
      </button>
    </div>
  );
}
