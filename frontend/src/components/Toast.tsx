import styles from "./Toast.module.css";

interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return (
    <div className={styles.toast} role="alert">
      {message}
    </div>
  );
}
