import { useState, useEffect } from 'react'
import { X, DollarSign, Check, AlertTriangle, FileText } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import Input from '../ui/Input'

export default function CerrarCajaModal({ open, caja, onClose, onSuccess }) {
  const { usuario } = useAuth()
  const [montoFinal, setMontoFinal] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [resumen, setResumen] = useState(null)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (open) {
      setMontoFinal('')
      setObservaciones('')
      setError('')
      api.get('/caja/abierta').then(r => setResumen(r.data)).catch(() => setResumen(null))
    }
  }, [open])

  if (!open) return null

  const formatMoney = (n) =>
    `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

  const montoInicial = Number(resumen?.montoInicial) || 0
  const totalVentas = Number(resumen?.totalVentasHastaAhora) || 0
  const esperado = montoInicial + totalVentas
  const contado = parseFloat(montoFinal) || 0
  const diferencia = parseFloat((contado - esperado).toFixed(2))
  const tieneMonto = montoFinal !== '' && !isNaN(contado)

  const desgloseObj = {}
  if (resumen?.desglose) {
    resumen.desglose.forEach(d => { desgloseObj[d.tipo] = d })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!tieneMonto) {
      setError('Ingresa el monto final contado')
      return
    }
    if (contado < 0) {
      setError('El monto no puede ser negativo')
      return
    }

    setGuardando(true)
    try {
      const r = await api.patch(`/caja/${caja.idCaja}/cerrar`, {
        montoFinal: contado,
        observaciones: observaciones.trim() || null,
        idUsuarioCierre: usuario.idUsuario
      })
      const dif = r.data.resumen.diferencia
      let mensaje = 'Caja cerrada correctamente. Cuadre exacto'
      if (dif > 0) mensaje = `Caja cerrada. Sobrante: ${formatMoney(dif)}`
      else if (dif < 0) mensaje = `Caja cerrada. Faltante: ${formatMoney(Math.abs(dif))}`
      onSuccess?.(mensaje)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cerrar la caja')
    } finally {
      setGuardando(false)
    }
  }

  const colorDiferencia =
    diferencia === 0 ? 'emerald' :
    diferencia > 0 ? 'amber' : 'red'

  const labelDiferencia =
    diferencia === 0 ? 'Cuadre exacto' :
    diferencia > 0 ? 'Sobrante' : 'Faltante'

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 grid place-items-center">
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--color-heading)]">
                Cerrar caja
              </h3>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                Cuenta el efectivo y registra el cierre
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

            <div className="bg-[var(--color-soft)] rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-muted)]">Monto inicial</span>
                <span className="font-semibold">{formatMoney(montoInicial)}</span>
              </div>

              <div className="border-t border-[var(--color-border)] pt-2 space-y-1.5">
                {desgloseObj.producto && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-muted)]">
                      Productos ({desgloseObj.producto.cantidad} venta{desgloseObj.producto.cantidad !== 1 ? 's' : ''})
                    </span>
                    <span className="text-emerald-600 font-medium">+{formatMoney(desgloseObj.producto.total)}</span>
                  </div>
                )}
                {desgloseObj.cyber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-muted)]">
                      Cyber ({desgloseObj.cyber.cantidad} sesion{desgloseObj.cyber.cantidad !== 1 ? 'es' : ''})
                    </span>
                    <span className="text-emerald-600 font-medium">+{formatMoney(desgloseObj.cyber.total)}</span>
                  </div>
                )}
                {desgloseObj.impresion && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-muted)]">
                      Impresiones ({desgloseObj.impresion.cantidad})
                    </span>
                    <span className="text-emerald-600 font-medium">+{formatMoney(desgloseObj.impresion.total)}</span>
                  </div>
                )}
                {totalVentas === 0 && (
                  <div className="text-xs text-[var(--color-muted)] italic text-center py-1">
                    Sin ventas registradas en esta caja
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--color-border)] pt-2 flex justify-between text-sm">
                <span className="text-[var(--color-muted)]">Total ventas</span>
                <span className="font-semibold text-emerald-600">+{formatMoney(totalVentas)}</span>
              </div>

              <div className="border-t border-[var(--color-border)] pt-2 flex justify-between">
                <span className="font-semibold text-[var(--color-heading)]">Esperado en caja</span>
                <span className="font-bold text-lg text-[var(--color-heading)]">{formatMoney(esperado)}</span>
              </div>
            </div>

            <Input
              label="Monto final contado"
              type="number"
              value={montoFinal}
              onChange={(v) => { setMontoFinal(v); setError('') }}
              placeholder="0.00"
              required
              step="0.01"
              min="0"
              icon={DollarSign}
              autoFocus
            />

            {tieneMonto && (
              <div className={`rounded-lg p-3 border bg-${colorDiferencia}-50 border-${colorDiferencia}-200`} style={{
                backgroundColor: colorDiferencia === 'emerald' ? '#ecfdf5' : colorDiferencia === 'amber' ? '#fffbeb' : '#fef2f2',
                borderColor: colorDiferencia === 'emerald' ? '#a7f3d0' : colorDiferencia === 'amber' ? '#fde68a' : '#fecaca'
              }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{
                    color: colorDiferencia === 'emerald' ? '#065f46' : colorDiferencia === 'amber' ? '#92400e' : '#991b1b'
                  }}>
                    {labelDiferencia}
                  </span>
                  <span className="font-bold text-lg" style={{
                    color: colorDiferencia === 'emerald' ? '#059669' : colorDiferencia === 'amber' ? '#d97706' : '#dc2626'
                  }}>
                    {diferencia === 0 ? formatMoney(0) : (diferencia > 0 ? '+' : '-') + formatMoney(Math.abs(diferencia))}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
                Observaciones {diferencia !== 0 && tieneMonto && (
                  <span className="text-red-500 text-xs">(recomendado por la diferencia)</span>
                )}
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-3 text-[var(--color-muted)]" />
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: Cliente se llevo cambio de mas, etc."
                  className="input pl-10 min-h-[70px] resize-none"
                />
              </div>
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
              disabled={guardando || !tieneMonto}
            >
              <Check size={16} />
              {guardando ? 'Cerrando...' : 'Cerrar caja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}