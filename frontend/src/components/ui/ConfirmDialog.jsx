import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmDialog({
  open,
  title = '¿Confirmar acción?',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger', // 'danger' | 'primary'
  onConfirm,
  onCancel
}) {
  if (!open) return null

  const confirmBtnClass = variant === 'danger' ? 'btn-danger' : 'btn-primary'

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full grid place-items-center ${
              variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-heading)] mt-1.5">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-[var(--color-text)]">{message}</p>
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-[var(--color-border)] bg-[var(--color-soft)]/50 rounded-b-xl">
          <button onClick={onCancel} className="btn-secondary">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={confirmBtnClass}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}