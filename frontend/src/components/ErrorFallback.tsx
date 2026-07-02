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
      <button type="button" className={styles.retryButton} onClick={onRetry} autoFocus>
        Retry
      </button>
    </div>
  );
}
