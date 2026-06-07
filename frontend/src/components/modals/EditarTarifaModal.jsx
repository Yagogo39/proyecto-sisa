import { useState, useEffect } from 'react'
import { X, DollarSign, Check, AlertTriangle, Info } from 'lucide-react'
import api from '../../services/api'
import Input from '../ui/Input'

export default function EditarTarifaModal({ open, tarifaActual, onClose, onSuccess }) {
  const [nuevaTarifa, setNuevaTarifa] = useState('')
  const [error, setError] = useState('')
  const [errorCampo, setErrorCampo] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (open) {
      setNuevaTarifa(String(tarifaActual || ''))
      setError('')
      setErrorCampo('')
    }
  }, [open, tarifaActual])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const valor = parseFloat(nuevaTarifa)
    if (isNaN(valor) || valor <= 0) {
      setErrorCampo('La tarifa debe ser mayor a $0.00')
      return
    }
    if (valor > 1000) {
      setErrorCampo('La tarifa no puede superar $1,000/hora')
      return
    }

    setGuardando(true)
    try {
      const r = await api.patch('/configuracion/tarifa-cyber', { tarifa: valor })
      onSuccess?.(r.data.tarifa)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la tarifa')
    } finally {
      setGuardando(false)
    }
  }

  if (!open) return null

  const formatMoney = (n) =>
    `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

  const cambio = nuevaTarifa && !isNaN(parseFloat(nuevaTarifa))
    ? parseFloat(nuevaTarifa) - Number(tarifaActual)
    : 0

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
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 grid place-items-center">
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--color-heading)]">
                Editar tarifa de cyber
              </h3>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                Costo por hora del servicio
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
                La nueva tarifa se aplicará solo a las sesiones que se inicien después del cambio. Las sesiones en curso mantienen su tarifa original.
              </span>
            </div>

            <div className="bg-[var(--color-soft)] rounded-lg p-3 text-center">
              <p className="text-xs text-[var(--color-muted)] mb-1">Tarifa actual</p>
              <p className="text-xl font-bold text-[var(--color-heading)]">
                {formatMoney(tarifaActual)}<span className="text-sm text-[var(--color-muted)]"> / hora</span>
              </p>
            </div>

            <Input
              label="Nueva tarifa (MXN por hora)"
              type="number"
              value={nuevaTarifa}
              onChange={(v) => { setNuevaTarifa(v); setErrorCampo('') }}
              placeholder="15.00"
              required
              step="0.01"
              min="0.01"
              error={errorCampo}
              autoFocus
            />

            {nuevaTarifa && !isNaN(parseFloat(nuevaTarifa)) && cambio !== 0 && (
              <div className={`rounded-lg p-3 border ${
                cambio > 0
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-muted)]">
                    {cambio > 0 ? 'Aumento' : 'Reducción'}
                  </span>
                  <span className={`font-bold ${
                    cambio > 0 ? 'text-amber-700' : 'text-emerald-700'
                  }`}>
                    {cambio > 0 ? '+' : ''}{formatMoney(cambio)}
                  </span>
                </div>
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
              className="btn-primary"
              disabled={guardando || !nuevaTarifa}
            >
              <Check size={16} />
              {guardando ? 'Guardando...' : 'Actualizar tarifa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}