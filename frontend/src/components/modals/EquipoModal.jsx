import { useState, useEffect } from 'react'
import {
  X,
  Monitor,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react'
import api from '../../services/api'
import Input from '../ui/Input'

export default function EquipoModal({ open, equiposExistentes = [], onClose, onSuccess }) {
  const [numero, setNumero] = useState('')
  const [error, setError] = useState('')
  const [errorCampo, setErrorCampo] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!open) return
    const numerosUsados = equiposExistentes.map(e => Number(e.numero)).sort((a, b) => a - b)
    let siguiente = 1
    for (const n of numerosUsados) {
      if (n === siguiente) siguiente++
      else break
    }
    setNumero(String(siguiente))
    setError('')
    setErrorCampo('')
  }, [open, equiposExistentes])

  const validar = () => {
    if (!numero || parseInt(numero) <= 0) {
      setErrorCampo('Debe ser un número mayor a 0')
      return false
    }
    const numeroInt = parseInt(numero)
    const duplicado = equiposExistentes.some(e => Number(e.numero) === numeroInt)
    if (duplicado) {
      setErrorCampo(`Ya existe un equipo con el número ${numeroInt}`)
      return false
    }
    setErrorCampo('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) {
      setError('Revisa el campo marcado')
      return
    }

    setGuardando(true)
    try {
      await api.post('/equipos', { numero: parseInt(numero) })
      onSuccess?.(`Equipo PC${numero} agregado correctamente`)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al agregar el equipo')
    } finally {
      setGuardando(false)
    }
  }

  if (!open) return null

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
              <Monitor size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--color-heading)]">
                Agregar ordenador
              </h3>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                Registra un nuevo equipo para el cyber
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
                El equipo se creará en estado <strong>Disponible</strong> y listo para usarse.
              </span>
            </div>

            <Input
              label="Número de equipo"
              type="number"
              value={numero}
              onChange={(v) => { setNumero(v); setErrorCampo('') }}
              placeholder="Ej: 1"
              required
              min="1"
              hint={`Se mostrará como PC${numero || '?'} en el listado`}
              error={errorCampo}
            />

            {numero && !errorCampo && (
              <div className="bg-[var(--color-soft)] rounded-lg p-4 text-center">
                <p className="text-xs text-[var(--color-muted)] mb-2">Vista previa</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[var(--color-border)]">
                  <Monitor size={16} className="text-[var(--color-muted)]" />
                  <span className="font-semibold text-[var(--color-heading)]">
                    PC{numero}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                    Disponible
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
              className="btn-success"
              disabled={guardando}
            >
              <Check size={16} />
              {guardando ? 'Agregando...' : 'Agregar Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}