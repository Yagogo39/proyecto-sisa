import { useState, useEffect } from 'react'
import {
  X,
  Truck,
  Check,
  AlertTriangle
} from 'lucide-react'
import api from '../../services/api'
import Input from '../ui/Input'

export default function ProveedorModal({ open, proveedoresExistentes = [], onClose, onSuccess }) {
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '' })
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({ nombre: '', telefono: '', email: '' })
      setError('')
      setErrores({})
    }
  }, [open])

  const setField = (campo) => (valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: undefined }))
  }

  const validar = () => {
    const err = {}
    if (!form.nombre.trim()) err.nombre = 'Requerido'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      err.email = 'Email no válido'
    }
    if (form.nombre.trim()) {
      const duplicado = proveedoresExistentes.some(
        p => p.nombre.toLowerCase() === form.nombre.trim().toLowerCase()
      )
      if (duplicado) err.nombre = 'Ya existe un proveedor con ese nombre'
    }
    setErrores(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) {
      setError('Revisa los campos marcados')
      return
    }

    setGuardando(true)
    try {
      const payload = { nombre: form.nombre.trim() }
      if (form.telefono.trim()) payload.telefono = form.telefono.trim()
      if (form.email.trim())    payload.email    = form.email.trim()

      const r = await api.post('/proveedores', payload)
      onSuccess?.(r.data, `Proveedor "${form.nombre.trim()}" creado correctamente`)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el proveedor')
    } finally {
      setGuardando(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center">
              <Truck size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--color-heading)]">
                Nuevo proveedor
              </h3>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                Registra un nuevo proveedor de productos
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
              label="Nombre del proveedor"
              value={form.nombre}
              onChange={setField('nombre')}
              placeholder="Ej: Papelera del Norte S.A."
              required
              error={errores.nombre}
            />

            <Input
              label="Teléfono"
              value={form.telefono}
              onChange={setField('telefono')}
              placeholder="Ej: 5512345678"
              hint="Opcional"
            />

            <Input
              label="Correo electrónico"
              type="email"
              value={form.email}
              onChange={setField('email')}
              placeholder="Ej: contacto@proveedor.com"
              hint="Opcional"
              error={errores.email}
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
              disabled={guardando || !form.nombre.trim()}
            >
              <Check size={16} />
              {guardando ? 'Creando...' : 'Crear Proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}