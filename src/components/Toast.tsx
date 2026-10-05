export interface ToastMessage {
  id: string;
  title: string;
  desc: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-viewport" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-item glass-panel">
          <div className="toast-icon">✨</div>
          <div className="toast-content">
            <span className="toast-title">{toast.title}</span>
            <span className="toast-desc">{toast.desc}</span>
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
