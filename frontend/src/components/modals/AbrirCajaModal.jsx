import { useState, useEffect } from 'react'
import {
  X,
  CircleDollarSign,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import Input from '../ui/Input'

export default function AbrirCajaModal({ open, onClose, onSuccess }) {
  const { usuario } = useAuth()
  const [montoInicial, setMontoInicial] = useState('')
  const [error, setError] = useState('')
  const [errorCampo, setErrorCampo] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (open) {
      setMontoInicial('')
      setError('')
      setErrorCampo('')
    }
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (montoInicial === '' || parseFloat(montoInicial) < 0) {
      setErrorCampo('Ingresa un monto válido')
      return
    }

    setGuardando(true)
    try {
      await api.post('/caja/abrir', {
        idUsuario: usuario.idUsuario,
        montoInicial: parseFloat(montoInicial)
      })
      onSuccess?.(`Caja abierta con $${parseFloat(montoInicial).toFixed(2)} de fondo inicial`)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al abrir la caja')
    } finally {
      setGuardando(false)
    }
  }

  if (!open) return null

  const formatMoney = (n) =>
    `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center">
              <CircleDollarSign size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--color-heading)]">
                Abrir caja
              </h3>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                Registra el efectivo con el que inicias el turno
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm">
              <Info size={16} className="shrink-0 mt-0.5" />
              <span>
                Una vez abierta la caja, podrás registrar ventas durante todo el turno.
              </span>
            </div>

            <Input
              label="Monto inicial (MXN)"
              type="number"
              value={montoInicial}
              onChange={(v) => { setMontoInicial(v); setErrorCampo('') }}
              placeholder="0.00"
              required
              step="0.01"
              min="0"
              hint="Efectivo con el que comienzas el día"
              error={errorCampo}
            />

            {montoInicial && parseFloat(montoInicial) >= 0 && !errorCampo && (
              <div className="bg-[var(--color-soft)] rounded-lg p-4 text-center">
                <p className="text-xs text-[var(--color-muted)] mb-1">Fondo inicial</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {formatMoney(montoInicial)}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 p-5 border-t border-[var(--color-border)] bg-[var(--color-soft)]/50 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={guardando}
            >
              <X size={16} /> Cancelar
            </button>
            <button
              type="submit"
              className="btn-success"
              disabled={guardando}
            >
              <Check size={16} />
              {guardando ? 'Abriendo...' : 'Abrir Caja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}