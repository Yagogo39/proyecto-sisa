import { useState, useEffect } from 'react'
import { DollarSign, ArrowLeft, ChevronRight, CheckCircle2, AlertCircle, Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Panel from '../components/ui/Panel'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import SinPermisos from '../components/ui/SinPermisos'
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table'

export default function HistorialCajas() {
  const { usuario } = useAuth()
  const [cajas, setCajas] = useState([])
  const [cajaSeleccionada, setCajaSeleccionada] = useState(null)

  useEffect(() => {
    if (usuario?.rol !== 'admin') return
    api.get('/caja').then(r => setCajas(r.data)).catch(() => setCajas([]))
  }, [usuario])

  if (usuario?.rol !== 'admin') {
    return <SinPermisos mensaje="El historial de cajas está disponible solo para el administrador." />
  }

  const verDetalle = async (idCaja) => {
    try {
      const r = await api.get(`/caja/${idCaja}`)
      setCajaSeleccionada(r.data)
    } catch {}
  }

  const formatMoney = (n) =>
    `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '-'
    const d = new Date(fechaStr + 'T00:00:00')
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatHora = (h) => h ? h.substring(0, 5) : '-'

  if (cajaSeleccionada) {
    const caja = cajaSeleccionada
    const desglose = {}
    caja.desglose?.forEach(d => { desglose[d.tipo] = d })

    return (
      <>
        <PageHeader
          title={`Caja #${caja.idCaja}`}
          action={
            <button onClick={() => setCajaSeleccionada(null)} className="btn-secondary">
              <ArrowLeft size={16} /> Volver al historial
            </button>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <Panel title="Resumen" icon={Wallet}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Estado</span>
                <Badge color={caja.estado === 'abierta' ? 'success' : 'default'}>
                  {caja.estado}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Fecha</span>
                <span className="font-medium">{formatFecha(caja.fecha)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Hora apertura</span>
                <span className="font-medium">{formatHora(caja.horaApertura)}</span>
              </div>
              {caja.horaCierre && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Hora cierre</span>
                  <span className="font-medium">{formatHora(caja.horaCierre)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-[var(--color-muted)]">Abrio</span>
                <span className="font-medium">{caja.nombreUsuario} {caja.apellidoUsuario || ''}</span>
              </div>
              {caja.nombreUsuarioCierre && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Cerro</span>
                  <span className="font-medium">{caja.nombreUsuarioCierre} {caja.apellidoUsuarioCierre || ''}</span>
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Montos" icon={DollarSign}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Monto inicial</span>
                <span className="font-semibold">{formatMoney(caja.montoInicial)}</span>
              </div>
              {desglose.producto && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Productos ({desglose.producto.cantidad})</span>
                  <span className="text-emerald-600">+{formatMoney(desglose.producto.total)}</span>
                </div>
              )}
              {desglose.cyber && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Cyber ({desglose.cyber.cantidad})</span>
                  <span className="text-emerald-600">+{formatMoney(desglose.cyber.total)}</span>
                </div>
              )}
              {desglose.impresion && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Impresiones ({desglose.impresion.cantidad})</span>
                  <span className="text-emerald-600">+{formatMoney(desglose.impresion.total)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total ventas</span>
                <span className="text-emerald-600">+{formatMoney(caja.total_ventas_calculado || 0)}</span>
              </div>
              {caja.estado === 'cerrada' && (
                <>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-[var(--color-muted)]">Esperado</span>
                    <span className="font-semibold">
                      {formatMoney(Number(caja.montoInicial) + Number(caja.total_ventas_calculado || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Contado</span>
                    <span className="font-semibold">{formatMoney(caja.montoFinal)}</span>
                  </div>
                  <div className={`flex justify-between font-bold p-2 rounded ${
                    Number(caja.diferencia) === 0 ? 'bg-emerald-50 text-emerald-700' :
                    Number(caja.diferencia) > 0 ? 'bg-amber-50 text-amber-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    <span>Diferencia</span>
                    <span>
                      {Number(caja.diferencia) === 0 ? 'Cuadre exacto' :
                       Number(caja.diferencia) > 0 ? '+' + formatMoney(caja.diferencia) :
                       '-' + formatMoney(Math.abs(caja.diferencia))}
                    </span>
                  </div>
                </>
              )}
            </div>
          </Panel>
        </div>

        {caja.observaciones && (
          <Panel title="Observaciones" icon={AlertCircle} className="mb-4">
            <p className="text-sm text-[var(--color-muted)] italic">{caja.observaciones}</p>
          </Panel>
        )}

        <Panel title={`Empleados que vendieron (${caja.empleados?.length || 0})`} icon={CheckCircle2} className="mb-4">
          {!caja.empleados || caja.empleados.length === 0 ? (
            <EmptyState title="Sin ventas en esta caja" />
          ) : (
            <Table>
              <THead>
                <TH>Empleado</TH>
                <TH align="center">Ventas</TH>
                <TH align="right">Total vendido</TH>
              </THead>
              <TBody>
                {caja.empleados.map(e => (
                  <TR key={e.idUsuario}>
                    <TD className="font-medium">{e.nombre} {e.apellido || ''}</TD>
                    <TD align="center">{e.cantidadVentas}</TD>
                    <TD align="right" className="font-semibold text-emerald-600">
                      {formatMoney(e.totalVendido)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Panel>

        <Panel title={`Ventas registradas (${caja.ventas?.length || 0})`} icon={DollarSign}>
          {!caja.ventas || caja.ventas.length === 0 ? (
            <EmptyState title="Sin ventas en esta caja" />
          ) : (
            <Table>
              <THead>
                <TH>Hora</TH>
                <TH>Tipo</TH>
                <TH>Empleado</TH>
                <TH>Concepto</TH>
                <TH align="right">Total</TH>
              </THead>
              <TBody>
                {caja.ventas.map(v => (
                  <TR key={v.idVenta}>
                    <TD className="text-sm font-mono">{formatHora(v.hora)}</TD>
                    <TD>
                      <Badge color={
                        v.tipoVenta === 'producto' ? 'success' :
                        v.tipoVenta === 'cyber' ? 'info' : 'warning'
                      } size="sm">
                        {v.tipoVenta}
                      </Badge>
                    </TD>
                    <TD className="text-sm">{v.empleado}</TD>
                    <TD className="text-sm text-[var(--color-muted)]">{v.descripcion || '-'}</TD>
                    <TD align="right" className="font-semibold">{formatMoney(v.total)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Panel>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Historial de Cajas" />

      <Panel title="Cierres registrados" icon={Wallet}>
        {cajas.length === 0 ? (
          <EmptyState title="Sin cajas registradas" description="Cuando abras y cierres cajas apareceran aqui" />
        ) : (
          <Table>
            <THead>
              <TH>Fecha</TH>
              <TH>Apertura</TH>
              <TH>Cierre</TH>
              <TH>Abrio</TH>
              <TH align="right">Inicial</TH>
              <TH align="right">Ventas</TH>
              <TH align="right">Diferencia</TH>
              <TH align="center">Estado</TH>
              <TH></TH>
            </THead>
            <TBody>
              {cajas.map(c => (
                <TR key={c.idCaja} className="cursor-pointer hover:bg-[var(--color-soft)]" onClick={() => verDetalle(c.idCaja)}>
                  <TD className="font-medium">{formatFecha(c.fecha)}</TD>
                  <TD className="text-sm">{formatHora(c.horaApertura)}</TD>
                  <TD className="text-sm">{formatHora(c.horaCierre)}</TD>
                  <TD className="text-sm">{c.nombreUsuario}</TD>
                  <TD align="right">{formatMoney(c.montoInicial)}</TD>
                  <TD align="right" className="text-emerald-600 font-semibold">
                    {formatMoney(c.total_ventas_calculado || 0)}
                  </TD>
                  <TD align="right">
                    {c.estado === 'cerrada' ? (
                      <Badge color={
                        Number(c.diferencia) === 0 ? 'success' :
                        Number(c.diferencia) > 0 ? 'warning' : 'danger'
                      } size="sm">
                        {Number(c.diferencia) === 0 ? 'OK' :
                         Number(c.diferencia) > 0 ? '+' + formatMoney(c.diferencia) :
                         '-' + formatMoney(Math.abs(c.diferencia))}
                      </Badge>
                    ) : (
                      <span className="text-[var(--color-muted)] text-xs">-</span>
                    )}
                  </TD>
                  <TD align="center">
                    <Badge color={c.estado === 'abierta' ? 'success' : 'default'} size="sm">
                      {c.estado}
                    </Badge>
                  </TD>
                  <TD>
                    <ChevronRight size={16} className="text-[var(--color-muted)]" />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Panel>
    </>
  )
}