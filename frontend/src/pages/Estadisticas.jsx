import { useState, useEffect, useMemo } from 'react'
import {
  DollarSign,
  Monitor,
  TrendingUp,
  Receipt,
  ChartPie,
  BarChart3,
  Star,
  Download,
  Calendar,
  ChartNoAxesColumn,
  Package
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Panel from '../components/ui/Panel'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import SinPermisos from '../components/ui/SinPermisos'
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table'
import { ventasDiariasDelMes, ventasPorTipo, resumenVentas, COLORES_GRAFICA } from '../lib/stats'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function Estadisticas() {
  const { usuario } = useAuth()
  const ahora = new Date()
  const [mes, setMes] = useState(ahora.getMonth())
  const [anio, setAnio] = useState(ahora.getFullYear())

  const [ventas, setVentas] = useState([])
  const [totalDia, setTotalDia] = useState(0)
  const [productosRentables, setProductosRentables] = useState([])
  const [productos, setProductos] = useState([])

  useEffect(() => {
    if (usuario?.rol !== 'admin') return

    const desde = `${anio}-${String(mes + 1).padStart(2, '0')}-01`
    const ultimoDia = new Date(anio, mes + 1, 0).getDate()
    const hasta = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`

    api.get(`/ventas?fechaInicio=${desde}&fechaFin=${hasta}`)
      .then(r => setVentas(r.data))
      .catch(() => setVentas([]))

    api.get('/ventas/total-dia').then(r => setTotalDia(r.data.total)).catch(() => {})

    api.get(`/ventas/mas-rentables?fechaInicio=${desde}&fechaFin=${hasta}&limite=5`)
      .then(r => setProductosRentables(r.data))
      .catch(() => setProductosRentables([]))

    api.get('/productos').then(r => setProductos(r.data)).catch(() => {})
  }, [mes, anio, usuario])

  if (usuario?.rol !== 'admin') {
    return <SinPermisos mensaje="Las estadísticas están disponibles solo para el administrador." />
  }

  const diarias = useMemo(() => ventasDiariasDelMes(ventas, anio, mes), [ventas, anio, mes])
  const porTipo = useMemo(() => ventasPorTipo(ventas), [ventas])
  const resumen = useMemo(() => resumenVentas(ventas), [ventas])

  const formatMoney = (n) =>
    `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

  const formatCantidad = (cantidad) => {
    const num = Number(cantidad)
    return Number.isInteger(num) ? num.toString() : num.toFixed(2)
  }

  const getUnidad = (idProducto) => {
    const prod = productos.find(p => p.idProducto === idProducto)
    return prod?.unidadMedida || 'pieza'
  }

  const colorUnidad = (unidad) => {
    switch (unidad) {
      case 'metro':   return 'info'
      case 'hoja':    return 'purple'
      case 'paquete': return 'warning'
      default:        return 'default'
    }
  }

  const aniosDisponibles = []
  for (let y = 2024; y <= ahora.getFullYear() + 1; y++) aniosDisponibles.push(y)

  const descargar = () => {
    const headers = ['Día', 'Ventas del día']
    const rows = diarias.map(d => [d.dia, d.total.toFixed(2)])
    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `estadisticas-${MESES[mes].toLowerCase()}-${anio}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const TooltipPersonalizado = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-md px-3 py-2 text-xs">
        <p className="font-semibold text-[var(--color-heading)] mb-1">Día {label}</p>
        <p className="text-emerald-600 font-medium">{formatMoney(payload[0].value)}</p>
      </div>
    )
  }

  const TooltipPie = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-md px-3 py-2 text-xs">
        <p className="font-semibold text-[var(--color-heading)] mb-1">{d.label}</p>
        <p className="font-medium" style={{ color: payload[0].payload.fill }}>
          {formatMoney(d.total)}
        </p>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Estadísticas"
        action={
          <div className="flex flex-wrap gap-2">
            <select
              className="input pl-3 pr-8 py-2 text-sm font-medium cursor-pointer"
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
            >
              {MESES.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>

            <select
              className="input pl-3 pr-8 py-2 text-sm font-medium cursor-pointer"
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
            >
              {aniosDisponibles.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <button onClick={descargar} className="btn-primary">
              <Download size={16} /> Descargar
            </button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard
          icon={DollarSign}
          borderColor="success"
          badge="+ Hoy"
          badgeColor="success"
          label="Ventas del día"
          value={formatMoney(totalDia)}
          sublabel="Acumulado del día"
        />
        <StatCard
          icon={Monitor}
          borderColor="info"
          badge="Mensual"
          badgeColor="info"
          label="Horas Cyber"
          value={`${resumen.horasCyber} h`}
          sublabel={`${MESES[mes]} ${anio}`}
        />
        <StatCard
          icon={TrendingUp}
          borderColor="purple"
          badge="Mensual"
          badgeColor="purple"
          label="Ventas del mes"
          value={formatMoney(resumen.total)}
          sublabel={`${MESES[mes]} ${anio}`}
        />
        <StatCard
          icon={Receipt}
          borderColor="warning"
          badge="Mensual"
          badgeColor="warning"
          label="Tickets generados"
          value={resumen.ticketsGenerados}
          sublabel="Total de transacciones"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2 mb-4">
        <Panel title={`Productos Más Rentables (${MESES[mes]} ${anio})`} icon={Star}>
          {productosRentables.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Sin ventas de productos"
              description="No hay datos de ventas de productos en este período"
            />
          ) : (
            <Table>
              <THead>
                <TH>Producto</TH>
                <TH align="center">Vendido</TH>
                <TH align="right">Ingresos</TH>
                <TH align="right">Margen</TH>
              </THead>
              <TBody>
                {productosRentables.map((p, i) => {
                  const unidad = getUnidad(p.idProducto)
                  return (
                    <TR key={p.idProducto}>
                      <TD>
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full grid place-items-center text-xs font-bold ${
                            i === 0 ? 'bg-amber-100 text-amber-700' :
                            i === 1 ? 'bg-slate-200 text-slate-700' :
                            i === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-[var(--color-soft)] text-[var(--color-muted)]'
                          }`}>
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{p.nombre}</p>
                            <Badge color={colorUnidad(unidad)} size="sm">{unidad}</Badge>
                          </div>
                        </div>
                      </TD>
                      <TD align="center" className="font-semibold">
                        {formatCantidad(p.unidadesVendidas)}
                        <span className="text-xs text-[var(--color-muted)] font-normal"> {unidad}{p.unidadesVendidas !== 1 ? 's' : ''}</span>
                      </TD>
                      <TD align="right" className="font-bold text-emerald-600">
                        {formatMoney(p.ingresos)}
                      </TD>
                      <TD align="right">
                        {p.margenPorcentaje > 0 ? (
                          <Badge color={
                            p.margenPorcentaje >= 40 ? 'success' :
                            p.margenPorcentaje >= 20 ? 'warning' : 'danger'
                          }>
                            {p.margenPorcentaje}%
                          </Badge>
                        ) : (
                          <span className="text-[var(--color-muted)] text-xs">—</span>
                        )}
                      </TD>
                    </TR>
                  )
                })}
              </TBody>
            </Table>
          )}
        </Panel>

        <Panel title="Ventas por Tipo" icon={ChartPie}>
          {porTipo.length === 0 ? (
            <EmptyState
              icon={ChartPie}
              title="Sin ventas en este período"
              description="Las gráficas aparecerán cuando haya datos"
            />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={porTipo}
                    dataKey="total"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {porTipo.map((entry, i) => (
                      <Cell key={entry.tipo} fill={COLORES_GRAFICA[i % COLORES_GRAFICA.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipPie />} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 13, paddingTop: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>

      <Panel
        title="Ventas Diarias del Mes"
        icon={BarChart3}
        action={
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
            <Calendar size={12} />
            {MESES[mes]} {anio}
          </div>
        }
      >
        {resumen.total === 0 ? (
          <EmptyState
            icon={ChartNoAxesColumn}
            title="Sin ventas en este mes"
            description={`No se registraron ventas en ${MESES[mes]} de ${anio}`}
          />
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diarias} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip content={<TooltipPersonalizado />} cursor={{ fill: 'rgba(37, 99, 235, 0.08)' }} />
                <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>
    </>
  )
}