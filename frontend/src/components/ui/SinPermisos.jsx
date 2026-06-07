import { Lock, ShieldAlert } from 'lucide-react'

export default function SinPermisos({ titulo = 'Sin permisos', mensaje = 'Esta sección está disponible solo para administradores.' }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md p-8 rounded-xl bg-white border border-[var(--color-border)] shadow-sm">
        <div className="w-16 h-16 rounded-full bg-amber-100 grid place-items-center mx-auto mb-4">
          <ShieldAlert size={32} className="text-amber-600" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--color-heading)] mb-2">
          {titulo}
        </h2>
        <p className="text-sm text-[var(--color-muted)] mb-4">
          {mensaje}
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-soft)] text-xs text-[var(--color-muted)]">
          <Lock size={12} />
          Necesitas permisos de administrador
        </div>
      </div>
    </div>
  )
}