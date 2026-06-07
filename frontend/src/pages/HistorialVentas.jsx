import { useState, useEffect, useMemo } from 'react'
import {
  Search,
  Filter,
  FileSpreadsheet,
  X,
  History,
  AlertCircle,
  ShoppingBag,
  Monitor,
  Printer
} from 'lucide-react'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Panel from '../components/ui/Panel'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table'

export default function HistorialVentas() {
  
  const hoy = new Date().toISOString().split('T')[0]
  const [filtros, setFiltros] = useState({
    fechaInicio: hoy,
    fechaFin: hoy,
    tipoVenta: '',
    idUsuario: ''
  })
  
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtros)
  const [ventas, setVentas] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [error, setError] = useState('')

  const cargarVentas = async (params) => {
    try {
      const query = new URLSearchParams()
      if (params.fechaInicio) query.append('fechaInicio', params.fechaInicio)
      if (params.fechaFin)    query.append('fechaFin', params.fechaFin)
      if (params.tipoVenta)   query.append('tipoVenta', params.tipoVenta)
      if (params.idUsuario)   query.append('idUsuario', params.idUsuario)

      const r = await api.get(`/ventas?${query.toString()}`)
      setVentas(r.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el historial')
    }
  }

  useEffect(() => {
    cargarVentas(filtrosAplicados)
    api.get('/user').then(r => setEmpleados(r.data)).catch(() => {})
  }, [filtrosAplicados])

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 3500)
      return () => clearTimeout(t)
    }
  }, [error])

  const aplicarFiltros = () => setFiltrosAplicados({ ...filtros })

  const limpiarFiltros = () => {
    const reset = { fechaInicio: hoy, fechaFin: hoy, tipoVenta: '', idUsuario: '' }
    setFiltros(reset)
    setFiltrosAplicados(reset)
  }

  const formatMoney = (n) =>
    `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

  const stats = useMemo(() => {
    const totalVentas = ventas.length
    const montoTotal = ventas.reduce((acc, v) => acc + Number(v.total), 0)
    const porTipo = ventas.reduce((acc, v) => {
      acc[v.tipoVenta] = (acc[v.tipoVenta] || 0) + 1
      return acc
    }, {})
    return { totalVentas, montoTotal, porTipo }
  }, [ventas])

  const tipoConfig = {
    producto:  { label: 'Producto',  color: 'success', icon: ShoppingBag },
    cyber:     { label: 'Cyber',     color: 'info',    icon: Monitor },
    impresion: { label: 'Impresión', color: 'warning', icon: Printer }
  }

  const fechaTitulo = useMemo(() => {
    if (filtrosAplicados.fechaInicio === filtrosAplicados.fechaFin) {
      const d = new Date(filtrosAplicados.fechaInicio + 'T00:00:00')
      const esHoy = filtrosAplicados.fechaInicio === hoy
      const txt = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
      return esHoy ? `Hoy, ${txt}` : txt
    }
    const d1 = new Date(filtrosAplicados.fechaInicio + 'T00:00:00')
    const d2 = new Date(filtrosAplicados.fechaFin + 'T00:00:00')
    return `${d1.toLocaleDateString('es-MX')} - ${d2.toLocaleDateString('es-MX')}`
  }, [filtrosAplicados, hoy])

  const exportarExcel = () => {
    if (ventas.length === 0) return
    const headers = ['ID', 'Fecha', 'Hora', 'Tipo', 'Empleado', 'Monto']
    const rows = ventas.map(v => [
      `#V-${String(v.idVenta).padStart(3, '0')}`,
      v.fecha,
      v.hora,
      tipoConfig[v.tipoVenta]?.label || v.tipoVenta,
      v.empleado,
      Number(v.total).toFixed(2)
    ])
    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historial-ventas-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <PageHeader title="Historial de Ventas" />

      {error && (
        <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Panel
        title="Filtros de Búsqueda"
        icon={Filter}
        action={
          <div className="flex gap-2">
            <button onClick={aplicarFiltros} className="btn-primary">
              <Search size={14} /> Buscar
            </button>
            <button onClick={limpiarFiltros} className="btn-secondary">
              <X size={14} /> Limpiar Filtros
            </button>
          </div>
        }
        className="mb-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1.5">
              Fecha Inicio
            </label>
            <input
              type="date"
              className="input"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1.5">
              Fecha Fin
            </label>
            <input
              type="date"
              className="input"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1.5">
              Tipo de Venta
            </label>
            <select
              className="input"
              value={filtros.tipoVenta}
              onChange={(e) => setFiltros({ ...filtros, tipoVenta: e.target.value })}
            >
              <option value="">Todas</option>
              <option value="producto">Producto</option>
              <option value="cyber">Cyber</option>
              <option value="impresion">Impresión</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1.5">
              Empleado
            </label>
            <select
              className="input"
              value={filtros.idUsuario}
              onChange={(e) => setFiltros({ ...filtros, idUsuario: e.target.value })}
            >
              <option value="">Todos</option>
              {empleados.map(e => (
                <option key={e.idUsuario} value={e.idUsuario}>
                  {e.nombre} {e.apellido}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Panel>

      {ventas.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-3">
            <p className="text-xs text-[var(--color-muted)] mb-1">Ventas totales</p>
            <p className="text-lg font-bold text-[var(--color-heading)]">{stats.totalVentas}</p>
          </div>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-3">
            <p className="text-xs text-[var(--color-muted)] mb-1">Monto total</p>
            <p className="text-lg font-bold text-emerald-600">{formatMoney(stats.montoTotal)}</p>
          </div>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-3">
            <p className="text-xs text-[var(--color-muted)] mb-1">Productos</p>
            <p className="text-lg font-bold text-[var(--color-heading)]">{stats.porTipo.producto || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-3">
            <p className="text-xs text-[var(--color-muted)] mb-1">Cyber</p>
            <p className="text-lg font-bold text-[var(--color-heading)]">{stats.porTipo.cyber || 0}</p>
          </div>
        </div>
      )}

      <Panel
        title={`Listado de Ventas - ${fechaTitulo}`}
        icon={History}
        action={
          <button
            onClick={exportarExcel}
            disabled={ventas.length === 0}
            className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet size={16} /> Exportar a Excel
          </button>
        }
      >
        {ventas.length === 0 ? (
          <EmptyState
            icon={History}
            title="Sin ventas en este período"
            description="Intenta ajustar los filtros de búsqueda"
          />
        ) : (
          <Table>
            <THead>
              <TH>ID</TH>
              <TH>Hora</TH>
              <TH>Tipo</TH>
              <TH>Descripción</TH>
              <TH>Empleado</TH>
              <TH align="right">Monto</TH>
            </THead>
            <TBody>
              {ventas.map(v => {
                const conf = tipoConfig[v.tipoVenta] || { label: v.tipoVenta, color: 'default', icon: ShoppingBag }
                const Icon = conf.icon
                return (
                  <TR key={v.idVenta}>
                    <TD>
                      <span className="text-[var(--color-accent)] font-mono text-xs font-medium">
                        #V-{String(v.idVenta).padStart(3, '0')}
                      </span>
                    </TD>
                    <TD className="text-[var(--color-muted)] font-mono text-xs">
                      {v.hora}
                    </TD>
                    <TD>
                      <Badge color={conf.color}>
                        <Icon size={11} className="mr-1" />
                        {conf.label}
                      </Badge>
                    </TD>
                    <TD className="text-sm">
                      {v.tipoVenta === 'cyber'
                        ? <span className="text-[var(--color-text)]">Servicio de cyber</span>
                        : v.tipoVenta === 'impresion'
                          ? <span className="text-[var(--color-text)]">Servicio de impresión</span>
                          : <span className="text-[var(--color-text)]">Venta de productos</span>
                      }
                    </TD>
                    <TD className="font-medium">{v.empleado}</TD>
                    <TD align="right">
                      <span className="font-bold text-emerald-600">{formatMoney(v.total)}</span>
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        )}
      </Panel>
    </>
  )
}