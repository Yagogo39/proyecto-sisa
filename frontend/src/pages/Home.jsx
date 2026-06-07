import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign,
  Monitor,
  TrendingUp,
  AlertTriangle,
  CircleDollarSign,
  CalendarDays,
  UserPlus,
  Plus,
  Check,
  Package,
  Wallet
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Panel from '../components/ui/Panel'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import AbrirCajaModal from '../components/modals/AbrirCajaModal'
import CerrarCajaModal from '../components/modals/CerrarCajaModal'
import TemporadaModal from '../components/modals/TemporadaModal'

export default function Home() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [totalDia, setTotalDia] = useState(0)
  const [stockBajo, setStockBajo] = useState([])
  const [caja, setCaja] = useState(null)
  const [temporadas, setTemporadas] = useState([])
  const [temporadasActivas, setTemporadasActivas] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [abrirCajaModal, setAbrirCajaModal] = useState(false)
  const [cerrarCajaModal, setCerrarCajaModal] = useState(false)
  const [temporadaModal, setTemporadaModal] = useState(false)

  const cargar = () => {
    api.get('/ventas/total-dia').then(r => setTotalDia(r.data.total)).catch(() => {})
    api.get('/productos/alertas-stock').then(r => setStockBajo(r.data)).catch(() => {})
    api.get('/caja/abierta').then(r => setCaja(r.data)).catch(() => setCaja(null))
    api.get('/temporadas').then(r => setTemporadas(r.data)).catch(() => {})
    api.get('/temporadas/activa')
      .then(r => setTemporadasActivas(Array.isArray(r.data) ? r.data : []))
      .catch(() => setTemporadasActivas([]))
  }

  useEffect(() => { cargar() }, [])

  useEffect(() => {
    if (mensaje || error) {
      const t = setTimeout(() => { setMensaje(''); setError('') }, 3500)
      return () => clearTimeout(t)
    }
  }, [mensaje, error])

  const formatMoney = (n) => `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const trendVentas = totalDia > 0 ? '+12.5%' : '—'

  const toggleTemporada = async (temporada) => {
    if (usuario?.rol !== 'admin') return
    const isActive = temporadasActivas.some(t => t.idTemporada === temporada.idTemporada)
    try {
      if (isActive) {
        await api.patch(`/temporadas/${temporada.idTemporada}/desactivar`)
        setMensaje(`Temporada "${temporada.nombre}" desactivada`)
      } else {
        await api.patch(`/temporadas/${temporada.idTemporada}/activar`)
        setMensaje(`Temporada "${temporada.nombre}" activada`)
      }
      cargar()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar la temporada')
    }
  }

  return (
    <>
      <PageHeader
        title="Panel de Control"
        action={
          usuario?.rol === 'admin' && (
            <button className="btn-success" onClick={() => navigate('/registrar-empleado')}>
              <UserPlus size={16} />
              Registrar Empleado
            </button>
          )
        }
      />

      {caja && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white grid place-items-center">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  Caja abierta desde las {caja.horaApertura?.substring(0,5)}
                </p>
                <p className="text-xs text-emerald-700">
                  Abierta por {caja.nombreUsuario} {caja.apellidoUsuario || ''} - Monto inicial: {formatMoney(caja.montoInicial)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-700">Ventas hasta ahora</p>
              <p className="text-xl font-bold text-emerald-900">
                {formatMoney(caja.totalVentasHastaAhora)}
              </p>
            </div>
          </div>
        </div>
      )}

      {mensaje && (
        <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <Check size={18} className="shrink-0 mt-0.5" />
          <span>{mensaje}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-6">
        <StatCard
          icon={DollarSign}
          borderColor="success"
          badge={trendVentas}
          badgeColor="success"
          label="Ventas del día"
          value={formatMoney(totalDia)}
          sublabel={`${stockBajo.length === 0 ? '—' : ''} productos vendidos`}
        />
        <StatCard
          icon={Monitor}
          borderColor="info"
          badge="Activo"
          badgeColor="info"
          label="Horas Cyber"
          value="—"
          sublabel="Sin datos aún"
        />
        <StatCard
          icon={TrendingUp}
          borderColor="purple"
          badge="Mensual"
          badgeColor="purple"
          label="Ventas del mes"
          value="—"
          sublabel="Próximamente"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2 mb-6">
        <Panel
          title="Alertas de Inventario Bajo"
          icon={AlertTriangle}
          action={
            stockBajo.length > 0 && (
              <button
                onClick={() => navigate('/inventario')}
                className="text-sm text-[var(--color-accent)] hover:underline font-medium"
              >
                Ver todo
              </button>
            )
          }
        >
          {stockBajo.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Sin alertas"
              description="Todos los productos tienen stock suficiente"
            />
          ) : (
            <div className="space-y-2">
              {stockBajo.slice(0, 3).map(p => (
                <div
                  key={p.idProducto}
                  className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-heading)]">{p.nombre}</p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">
                      Stock: <span className="text-red-600 font-semibold">{p.stockActual}</span>
                      {' · '}
                      Mínimo: {p.stockMinimo}
                    </p>
                  </div>
                  <Badge color="warning">Bajo</Badge>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Control de Efectivo" icon={CircleDollarSign}>
          {caja ? (
            <>
              <div className="bg-[var(--color-soft)] rounded-xl p-5 text-center mb-4">
                <p className="text-xs text-[var(--color-muted)] mb-1">Efectivo en caja</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {formatMoney(Number(caja.montoInicial) + Number(caja.totalVentasHastaAhora || 0))}
                </p>
              </div>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Apertura:</span>
                  <span className="font-semibold text-[var(--color-heading)]">
                    {formatMoney(caja.montoInicial)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Ventas del día:</span>
                  <span className="font-semibold text-emerald-600">
                    +{formatMoney(caja.totalVentasHastaAhora)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCerrarCajaModal(true)}
                className="w-full bg-[var(--color-sidebar)] text-white py-3 rounded-lg text-sm font-medium hover:bg-[var(--color-sidebar-hover)] transition-colors"
              >
                Cerrar Turno
              </button>
            </>
          ) : (
            <>
              <EmptyState
                icon={CircleDollarSign}
                title="Caja cerrada"
                description="Abre caja para comenzar a registrar ventas"
              />
              <button
                onClick={() => setAbrirCajaModal(true)}
                className="btn-primary w-full justify-center mt-2"
              >
                <Plus size={16} />
                Abrir Caja
              </button>
            </>
          )}
        </Panel>
      </div>

      <Panel
        title="Gestión de Temporadas"
        icon={CalendarDays}
        action={
          temporadasActivas.length > 0 && (
            <Badge color="purple">
              {temporadasActivas.length} activa{temporadasActivas.length !== 1 ? 's' : ''}
            </Badge>
          )
        }
      >
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
          {temporadas.map(t => {
            const isActive = temporadasActivas.some(a => a.idTemporada === t.idTemporada)
            const esAdmin = usuario?.rol === 'admin'
            return (
              <button
                key={t.idTemporada}
                onClick={() => toggleTemporada(t)}
                disabled={!esAdmin}
                title={esAdmin
                  ? (isActive ? 'Click para desactivar' : 'Click para activar')
                  : t.nombre
                }
                className={`relative aspect-square rounded-xl border-2 transition-all p-3 flex items-center justify-center text-center ${
                  isActive
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                    : 'border-[var(--color-border)] bg-white'
                } ${esAdmin ? 'hover:border-[var(--color-accent)] cursor-pointer' : 'cursor-default'}`}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--color-accent)] grid place-items-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
                <span className={`text-sm font-medium ${
                  isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-heading)]'
                }`}>
                  {t.nombre}
                </span>
              </button>
            )
          })}
          {usuario?.rol === 'admin' && (
            <button
              onClick={() => setTemporadaModal(true)}
              className="aspect-square rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-all flex flex-col items-center justify-center gap-1 group"
            >
              <Plus size={20} className="text-[var(--color-muted)] group-hover:text-[var(--color-accent)]" />
              <span className="text-xs text-[var(--color-muted)] group-hover:text-[var(--color-accent)] text-center px-1">
                Agregar<br />Temporada
              </span>
            </button>
          )}
        </div>
        {temporadas.length === 0 && (
          <EmptyState
            icon={CalendarDays}
            title="Sin temporadas registradas"
            description="Agrega temporadas para clasificar productos por épocas del año"
          />
        )}
      </Panel>

      <AbrirCajaModal
        open={abrirCajaModal}
        onClose={() => setAbrirCajaModal(false)}
        onSuccess={(msg) => { setMensaje(msg); cargar() }}
      />
      <CerrarCajaModal
        open={cerrarCajaModal}
        caja={caja}
        onClose={() => setCerrarCajaModal(false)}
        onSuccess={(msg) => { setMensaje(msg); cargar() }}
      />
      <TemporadaModal
        open={temporadaModal}
        temporadasExistentes={temporadas}
        onClose={() => setTemporadaModal(false)}
        onSuccess={(msg) => { setMensaje(msg); cargar() }}
      />
    </>
  )
}