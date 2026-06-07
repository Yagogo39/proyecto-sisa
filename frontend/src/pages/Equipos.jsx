
import { useState, useEffect, useMemo } from 'react'
import {
  Monitor,
  Plus,
  Play,
  Square,
  Lock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  DollarSign,
  Pencil,
  Wrench
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { cargarTarifa, setTarifaLocal, calcularCostoEnVivo } from '../lib/cyber'
import PageHeader from '../components/ui/PageHeader'
import Panel from '../components/ui/Panel'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import TimerCell from '../components/ui/TimerCell'
import CostCell from '../components/ui/CostCell'
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table'
import EquipoModal from '../components/modals/EquipoModal'
import EditarTarifaModal from '../components/modals/EditarTarifaModal'

export default function Equipos() {
  const { usuario } = useAuth()
  const [equipos, setEquipos] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [finalizarModal, setFinalizarModal] = useState(null)
  const [efectivoCobro, setEfectivoCobro] = useState('')
  const [cambioEstadoModal, setCambioEstadoModal] = useState(null)
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false)
  const [tarifaActual, setTarifaActual] = useState(15)
  const [editarTarifaModal, setEditarTarifaModal] = useState(false)

  const cargar = () => {
    api.get('/equipos').then(r => setEquipos(r.data)).catch(() => {})
  }

  useEffect(() => {
    cargar()
    cargarTarifa().then(t => setTarifaActual(t))
  }, [])

  useEffect(() => {
    if (mensaje || error) {
      const t = setTimeout(() => { setMensaje(''); setError('') }, 3500)
      return () => clearTimeout(t)
    }
  }, [mensaje, error])

  const stats = useMemo(() => {
    return {
      disponibles: equipos.filter(e => e.estado === 'disponible').length,
      enUso:       equipos.filter(e => e.estado === 'en_uso').length,
      sinServicio: equipos.filter(e => e.estado === 'fuera_de_servicio').length
    }
  }, [equipos])

  const formatMoney = (n) =>
    `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

  const iniciarSesion = async (equipo) => {
    try {
      await api.post(`/equipos/${equipo.idEquipo}/iniciar`, {
        idUsuario: usuario.idUsuario
      })
      setMensaje(`Sesión iniciada en ${etiquetaEquipo(equipo)}`)
      cargar()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    }
  }

  const abrirModalFinalizar = (equipo) => {
    setFinalizarModal(equipo)
    setEfectivoCobro('')
  }

  const confirmarFinalizar = async () => {
    if (!finalizarModal) return
    const costo = calcularCostoEnVivo(finalizarModal.tiempo_transcurrido)
    if (!efectivoCobro || parseFloat(efectivoCobro) < costo) {
      setError('El efectivo recibido es insuficiente')
      return
    }
    try {
      const r = await api.post(`/equipos/${finalizarModal.idEquipo}/finalizar`, {
        idUsuario: usuario.idUsuario,
        efectivo: parseFloat(efectivoCobro)
      })
      const cambio = r.data.cambio !== null ? formatMoney(r.data.cambio) : '$0.00'
      setMensaje(`Sesión finalizada · Costo: ${formatMoney(r.data.costo)} · Cambio: ${cambio}`)
      setFinalizarModal(null)
      setEfectivoCobro('')
      cargar()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al finalizar sesión')
    }
  }

  const confirmarCambioEstado = async () => {
    if (!cambioEstadoModal) return
    try {
      await api.patch(`/equipos/${cambioEstadoModal.equipo.idEquipo}/estado`, {
        estado: cambioEstadoModal.nuevoEstado
      })
      setMensaje(`Estado actualizado correctamente`)
      cargar()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar estado')
    } finally {
      setCambioEstadoModal(null)
    }
  }

  const etiquetaEquipo = (e) => `PC${e.numero}`

  const costoFinalizar = finalizarModal
    ? calcularCostoEnVivo(finalizarModal.tiempo_transcurrido)
    : 0
  const cambioFinalizar = efectivoCobro
    ? parseFloat(efectivoCobro) - costoFinalizar
    : 0

  return (
    <>
      <PageHeader
        title="Control de Equipos"
        action={
          usuario?.rol === 'admin' && (
            <button className="btn-success" onClick={() => setModalAgregarAbierto(true)}>
              <Plus size={16} /> Agregar ordenador
            </button>
          )
        }
      />

      {mensaje && (
        <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          <span>{mensaje}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-xs text-emerald-700 mb-1 font-medium">Disponibles</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-emerald-700">{stats.disponibles}</p>
            <CheckCircle2 size={24} className="text-emerald-500" />
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-red-700 mb-1 font-medium">En uso</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-red-700">{stats.enUso}</p>
            <Monitor size={24} className="text-red-500" />
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-700 mb-1 font-medium">Sin Servicio</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-amber-700">{stats.sinServicio}</p>
            <Wrench size={24} className="text-amber-500" />
          </div>
        </div>
      </div>

      <Panel
        title="Gestión de Equipos de Cómputo"
        icon={Monitor}
        action={
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--color-muted)]">Costo:</span>
            <Badge color="accent">
              <DollarSign size={11} className="mr-0.5" />
              {tarifaActual.toFixed(2)}/hora
            </Badge>
            {usuario?.rol === 'admin' && (
              <button
                onClick={() => setEditarTarifaModal(true)}
                className="text-[var(--color-accent)] hover:text-blue-700 transition-colors"
                aria-label="Editar tarifa"
              >
                <Pencil size={14} />
              </button>
            )}
          </div>
        }
      >
        {equipos.length === 0 ? (
          <EmptyState
            icon={Monitor}
            title="Sin equipos registrados"
            description="Agrega un ordenador para comenzar a controlar el cyber"
          />
        ) : (
          <Table>
            <THead>
              <TH>Ordenador</TH>
              <TH align="center">Contador</TH>
              <TH align="center">Estado</TH>
              <TH align="center">Acción</TH>
              <TH align="right">Total a Pagar</TH>
              {usuario?.rol === 'admin' && <TH align="center">Servicio</TH>}
            </THead>
            <TBody>
              {equipos.map(eq => {
                const enUso = eq.estado === 'en_uso'
                const fuera = eq.estado === 'fuera_de_servicio'
                return (
                  <TR key={eq.idEquipo}>
                    <TD>
                      <div className="flex items-center gap-2">
                        <Monitor size={16} className="text-[var(--color-muted)]" />
                        <span className="font-semibold">{etiquetaEquipo(eq)}</span>
                      </div>
                    </TD>
                    <TD align="center">
                      {enUso
                        ? <TimerCell startTimestamp={eq.tiempo_transcurrido} />
                        : <span className="text-[var(--color-muted)]">—</span>
                      }
                    </TD>
                    <TD align="center">
                      {enUso && (
                        <Badge color="danger">
                          <XCircle size={11} className="mr-1" /> Ocupada
                        </Badge>
                      )}
                      {eq.estado === 'disponible' && (
                        <Badge color="success">
                          <CheckCircle2 size={11} className="mr-1" /> Sin uso
                        </Badge>
                      )}
                      {fuera && (
                        <Badge color="warning">
                          <AlertCircle size={11} className="mr-1" /> Sin Servicio
                        </Badge>
                      )}
                    </TD>
                    <TD align="center">
                      {enUso && (
                        <button
                          onClick={() => abrirModalFinalizar(eq)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors"
                        >
                          <Square size={12} fill="currentColor" /> Detener
                        </button>
                      )}
                      {eq.estado === 'disponible' && (
                        <button
                          onClick={() => iniciarSesion(eq)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-medium transition-colors"
                        >
                          <Play size={12} fill="currentColor" /> Iniciar
                        </button>
                      )}
                      {fuera && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium">
                          <Lock size={12} /> Bloqueado
                        </span>
                      )}
                    </TD>
                    <TD align="right">
                      {enUso
                        ? <CostCell startTimestamp={eq.tiempo_transcurrido} />
                        : <span className="text-[var(--color-muted)]">$0.00</span>
                      }
                    </TD>
                    {usuario?.rol === 'admin' && (
                      <TD align="center">
                        {!enUso && (
                          <button
                            onClick={() => setCambioEstadoModal({
                              equipo: eq,
                              nuevoEstado: fuera ? 'disponible' : 'fuera_de_servicio'
                            })}
                            className={`text-xs font-medium hover:underline transition-colors ${
                              fuera ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {fuera ? 'Habilitar' : 'Marcar fuera de servicio'}
                          </button>
                        )}
                      </TD>
                    )}
                  </TR>
                )
              })}
            </TBody>
          </Table>
        )}
      </Panel>

      {finalizarModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => setFinalizarModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-5 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 grid place-items-center">
                  <Square size={18} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[var(--color-heading)]">
                    Finalizar sesión
                  </h3>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">
                    {etiquetaEquipo(finalizarModal)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFinalizarModal(null)}
                className="text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-[var(--color-soft)] rounded-lg p-4 text-center">
                <p className="text-xs text-[var(--color-muted)] mb-1">Tiempo transcurrido</p>
                <p className="text-2xl">
                  <TimerCell startTimestamp={finalizarModal.tiempo_transcurrido} />
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-3 mb-1">Importe a cobrar</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {formatMoney(costoFinalizar)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
                  Efectivo recibido
                </label>
                <input
                  type="number"
                  className="input"
                  value={efectivoCobro}
                  onChange={(e) => setEfectivoCobro(e.target.value)}
                  placeholder="$0.00"
                  step="0.01"
                  autoFocus
                />
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-[var(--color-border)]">
                <span className="text-[var(--color-muted)]">Cambio</span>
                <span className={`font-bold text-lg ${
                  cambioFinalizar >= 0 && efectivoCobro ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {efectivoCobro ? formatMoney(cambioFinalizar) : '$0.00'}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-[var(--color-border)] bg-[var(--color-soft)]/50 rounded-b-xl">
              <button
                onClick={() => setFinalizarModal(null)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarFinalizar}
                disabled={!efectivoCobro || parseFloat(efectivoCobro) < costoFinalizar}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={16} /> Confirmar cobro
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!cambioEstadoModal}
        title={
          cambioEstadoModal?.nuevoEstado === 'fuera_de_servicio'
            ? 'Marcar fuera de servicio'
            : 'Habilitar equipo'
        }
        message={
          cambioEstadoModal
            ? `¿Cambiar el estado de ${etiquetaEquipo(cambioEstadoModal.equipo)} a "${
                cambioEstadoModal.nuevoEstado === 'fuera_de_servicio'
                  ? 'fuera de servicio'
                  : 'disponible'
              }"?`
            : ''
        }
        confirmLabel="Sí, cambiar"
        variant={cambioEstadoModal?.nuevoEstado === 'fuera_de_servicio' ? 'danger' : 'primary'}
        onConfirm={confirmarCambioEstado}
        onCancel={() => setCambioEstadoModal(null)}
      />

      <EquipoModal
        open={modalAgregarAbierto}
        equiposExistentes={equipos}
        onClose={() => setModalAgregarAbierto(false)}
        onSuccess={(msg) => {
          setMensaje(msg)
          cargar()
        }}
      />

      <EditarTarifaModal
        open={editarTarifaModal}
        tarifaActual={tarifaActual}
        onClose={() => setEditarTarifaModal(false)}
        onSuccess={(nuevaTarifa) => {
          setTarifaLocal(nuevaTarifa)
          setTarifaActual(nuevaTarifa)
          setMensaje(`Tarifa actualizada a $${nuevaTarifa.toFixed(2)}/hora`)
        }}
      />
    </>
  )
}