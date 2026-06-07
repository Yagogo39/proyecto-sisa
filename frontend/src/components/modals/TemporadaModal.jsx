import { useState, useEffect } from 'react'
import {
  X,
  CalendarDays,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react'
import api from '../../services/api'
import Input from '../ui/Input'

const SUGERENCIAS = [
  { nombre: 'Regreso a Clases', inicio: '08-01', fin: '09-15' },
  { nombre: 'Navidad',          inicio: '12-01', fin: '12-25' },
  { nombre: 'Día del Niño',     inicio: '04-15', fin: '04-30' },
  { nombre: 'Día de las Madres', inicio: '05-01', fin: '05-10' },
  { nombre: 'San Valentín',     inicio: '02-01', fin: '02-14' },
  { nombre: 'Halloween',        inicio: '10-15', fin: '10-31' },
  { nombre: 'Día de Muertos',   inicio: '10-25', fin: '11-02' },
  { nombre: 'Verano',           inicio: '06-15', fin: '08-31' }
]

export default function TemporadaModal({ open, temporadasExistentes = [], onClose, onSuccess }) {
  const [nombre, setNombre] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (open) {
      setNombre('')
      setFechaInicio('')
      setFechaFin('')
      setError('')
      setErrores({})
    }
  }, [open])

  const setField = (campo, setter) => (valor) => {
    setter(valor)
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: undefined }))
  }

  const validar = () => {
    const err = {}
    if (!nombre.trim()) err.nombre = 'Requerido'
    if (!fechaInicio)   err.fechaInicio = 'Requerida'
    if (!fechaFin)      err.fechaFin = 'Requerida'
    if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
      err.fechaFin = 'No puede ser menor a la fecha de inicio'
    }
    if (nombre.trim()) {
      const duplicado = temporadasExistentes.some(
        t => t.nombre.toLowerCase() === nombre.trim().toLowerCase()
      )
      if (duplicado) err.nombre = `Ya existe una temporada con ese nombre`
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
      await api.post('/temporadas', {
        nombre: nombre.trim(),
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      })
      onSuccess?.(`Temporada "${nombre.trim()}" creada correctamente`)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la temporada')
    } finally {
      setGuardando(false)
    }
  }

  const aplicarSugerencia = (sug) => {
    const anio = new Date().getFullYear()
    setNombre(sug.nombre)
    setFechaInicio(`${anio}-${sug.inicio}`)
    setFechaFin(`${anio}-${sug.fin}`)
    setErrores({})
  }

  if (!open) return null

  const sugerenciasDisponibles = SUGERENCIAS.filter(
    s => !temporadasExistentes.some(t => t.nombre.toLowerCase() === s.nombre.toLowerCase())
  )

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
              <CalendarDays size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--color-heading)]">
                Agregar temporada
              </h3>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                Clasifica productos por épocas del año
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
                Después podrás activarla desde el Panel de Control con un click.
              </span>
            </div>

            <Input
              label="Nombre de la temporada"
              value={nombre}
              onChange={setField('nombre', setNombre)}
              placeholder="Ej: Regreso a Clases"
              required
              error={errores.nombre}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Fecha de inicio"
                type="date"
                value={fechaInicio}
                onChange={setField('fechaInicio', setFechaInicio)}
                required
                error={errores.fechaInicio}
              />
              <Input
                label="Fecha de fin"
                type="date"
                value={fechaFin}
                onChange={setField('fechaFin', setFechaFin)}
                required
                error={errores.fechaFin}
              />
            </div>

            {sugerenciasDisponibles.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--color-muted)] mb-2">
                  Sugerencias rápidas (llenan nombre y fechas):
                </p>
                <div className="flex flex-wrap gap-2">
                  {sugerenciasDisponibles.slice(0, 6).map(s => (
                    <button
                      key={s.nombre}
                      type="button"
                      onClick={() => aplicarSugerencia(s)}
                      className="text-xs px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
                    >
                      + {s.nombre}
                    </button>
                  ))}
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
              disabled={guardando}
            >
              <Check size={16} />
              {guardando ? 'Creando...' : 'Crear Temporada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}