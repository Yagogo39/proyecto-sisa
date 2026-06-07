import { useState, useEffect } from 'react'
import {
  X,
  Printer,
  Check,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import Input from '../ui/Input'

const FORM_VACIO = {
  descripcion: '',
  cantidad: '1',
  precioPorHoja: '',
  efectivo: ''
}

export default function ImpresionModal({ open, onClose, onSuccess }) {
  const { usuario } = useAuth()
  const [form, setForm] = useState(FORM_VACIO)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(FORM_VACIO)
      setError('')
      setErrores({})
    }
  }, [open])

  const setField = (campo) => (valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: undefined }))
  }

  const formatMoney = (n) =>
    `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

  const cantidad = parseInt(form.cantidad) || 0
  const precio = parseFloat(form.precioPorHoja) || 0
  const total = parseFloat((cantidad * precio).toFixed(2))
  const efectivoNum = parseFloat(form.efectivo) || 0
  const cambio = efectivoNum > 0 ? parseFloat((efectivoNum - total).toFixed(2)) : 0
  const efectivoSuficiente = efectivoNum >= total && total > 0

  const validar = () => {
    const err = {}
    if (!cantidad || cantidad <= 0)            err.cantidad = 'Debe ser mayor a 0'
    if (!precio || precio <= 0)                err.precioPorHoja = 'Debe ser mayor a 0'
    if (!form.efectivo || efectivoNum < total) err.efectivo = 'Insuficiente'
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
      const r = await api.post('/ventas/impresion', {
        idUsuario: usuario.idUsuario,
        descripcion: form.descripcion.trim() || undefined,
        cantidad: cantidad,
        precioPorHoja: precio,
        efectivo: efectivoNum
      })
      onSuccess?.(`Impresión cobrada: ${formatMoney(r.data.total)} · Cambio: ${formatMoney(r.data.cambio || 0)}`)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cobrar la impresión')
    } finally {
      setGuardando(false)
    }
  }

  if (!open) return null

  const incCantidad = () => setField('cantidad')(String(cantidad + 1))
  const decCantidad = () => { if (cantidad > 1) setField('cantidad')(String(cantidad - 1)) }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 grid place-items-center">
              <Printer size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--color-heading)]">
                Cobrar impresión
              </h3>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                Define el precio según lo que se imprime
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
              label="Concepto (opcional)"
              value={form.descripcion}
              onChange={setField('descripcion')}
              placeholder="Ej: Foto color tamaño carta"
              hint="Para referencia en el historial"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
                  Hojas <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={decCantidad}
                    className="w-9 h-9 rounded-md bg-[var(--color-soft)] hover:bg-[var(--color-border)] grid place-items-center transition-colors shrink-0"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={form.cantidad}
                    onChange={(e) => setField('cantidad')(e.target.value)}
                    className={`input text-center ${errores.cantidad ? 'border-red-300' : ''}`}
                    min="1"
                    step="1"
                    required
                  />
                  <button
                    type="button"
                    onClick={incCantidad}
                    className="w-9 h-9 rounded-md bg-[var(--color-soft)] hover:bg-[var(--color-border)] grid place-items-center transition-colors shrink-0"
                  >
                    +
                  </button>
                </div>
                {errores.cantidad && (
                  <p className="text-xs text-red-600 mt-1">{errores.cantidad}</p>
                )}
              </div>

              <Input
                label="Precio por hoja"
                type="number"
                value={form.precioPorHoja}
                onChange={setField('precioPorHoja')}
                placeholder="0.00"
                required
                step="0.01"
                min="0.01"
                error={errores.precioPorHoja}
              />
            </div>

            <div className="bg-[var(--color-soft)] rounded-lg p-4 text-center">
              <p className="text-xs text-[var(--color-muted)] mb-1">Total a cobrar</p>
              <p className="text-3xl font-bold text-emerald-600">
                {formatMoney(total)}
              </p>
              {total > 0 && (
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  {cantidad} hoja{cantidad !== 1 ? 's' : ''} × {formatMoney(precio)}
                </p>
              )}
            </div>

            <Input
              label="Efectivo recibido"
              type="number"
              value={form.efectivo}
              onChange={setField('efectivo')}
              placeholder="0.00"
              required
              step="0.01"
              min="0"
              error={errores.efectivo}
            />

            <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)]">
              <span className="text-sm text-[var(--color-muted)]">Cambio</span>
              <span className={`font-bold text-lg ${
                efectivoSuficiente ? 'text-emerald-600' : 'text-red-500'
              }`}>
                {form.efectivo ? formatMoney(cambio) : '$0.00'}
              </span>
            </div>
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
              disabled={guardando || !efectivoSuficiente}
            >
              <Check size={16} />
              {guardando ? 'Cobrando...' : 'Cobrar impresión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}