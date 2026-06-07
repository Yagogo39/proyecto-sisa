import { Check, X } from 'lucide-react'

const REGLAS = [
  { id: 'len',     label: 'Mínimo 8 caracteres',   test: (v) => v.length >= 8 },
  { id: 'mayus',   label: 'Una letra mayúscula',   test: (v) => /[A-Z]/.test(v) },
  { id: 'minus',   label: 'Una letra minúscula',   test: (v) => /[a-z]/.test(v) },
  { id: 'num',     label: 'Un número',             test: (v) => /\d/.test(v) },
  { id: 'special', label: 'Un caracter especial',  test: (v) => /[\W_]/.test(v) },
]

export default function PasswordRules({ password = '' }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-soft)]/50 p-3.5">
      <p className="text-xs font-medium text-[var(--color-heading)] mb-2.5">
        La contraseña debe contener:
      </p>
      <ul className="space-y-1.5">
        {REGLAS.map(regla => {
          const ok = regla.test(password)
          return (
            <li key={regla.id} className="flex items-center gap-2 text-xs">
              <span className={`w-4 h-4 rounded-full grid place-items-center shrink-0 ${
                ok ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'
              }`}>
                {ok ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
              </span>
              <span className={ok ? 'text-emerald-700 font-medium' : 'text-[var(--color-muted)]'}>
                {regla.label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function passwordEsValida(password) {
  return REGLAS.every(r => r.test(password))
}