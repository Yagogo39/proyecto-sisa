import { useState, useEffect } from 'react'
import { X, Tag, Check, AlertTriangle } from 'lucide-react'
import api from '../../services/api'
import Input from '../ui/Input'

export default function CategoriaModal({ open, categoriasExistentes = [], onClose, onSuccess }) {
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [errorCampo, setErrorCampo] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (open) {
      setNombre('')
      setError('')
      setErrorCampo('')
    }
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) {
      setErrorCampo('El nombre es requerido')
      return
    }
    const nombreLimpio = nombre.trim()
    const duplicado = categoriasExistentes.some(
      c => c.nombre.toLowerCase() === nombreLimpio.toLowerCase()
    )
    if (duplicado) {
      setErrorCampo(`Ya existe una categoría llamada "${nombreLimpio}"`)
      return
    }
    setGuardando(true)
    try {
      const r = await api.post('/categorias', { nombre: nombreLimpio })
      onSuccess?.(r.data, `Categoría "${nombreLimpio}" creada correctamente`)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la categoría')
    } finally {
      setGuardando(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center">
              <Tag size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--color-heading)]">
                Nueva categoría
              </h3>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                Agrupa productos por tipo
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
            <Input
              label="Nombre de la categoría"
              value={nombre}
              onChange={(v) => { setNombre(v); setErrorCampo('') }}
              placeholder="Ej: Papelería, Útiles escolares, Electrónica"
              required
              error={errorCampo}
            />
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
              disabled={guardando || !nombre.trim()}
            >
              <Check size={16} />
              {guardando ? 'Creando...' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}