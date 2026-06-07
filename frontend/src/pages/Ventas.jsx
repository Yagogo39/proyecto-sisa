import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  ListChecks,
  Trash2,
  Minus,
  ShoppingCart,
  Package,
  CheckCircle2,
  AlertCircle,
  Printer
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Panel from '../components/ui/Panel'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table'
import ImpresionModal from '../components/modals/ImpresionModal'

export default function Ventas() {
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [mostrarBuscador, setMostrarBuscador] = useState(false)
  const [carrito, setCarrito] = useState([])
  const [efectivo, setEfectivo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [impresionModal, setImpresionModal] = useState(false)

  const cargarProductos = () => {
    api.get('/productos').then(r => setProductos(r.data)).catch(() => {})
  }

  useEffect(() => { cargarProductos() }, [])
  useEffect(() => {
    if (mensaje || error) {
      const t = setTimeout(() => { setMensaje(''); setError('') }, 3500)
      return () => clearTimeout(t)
    }
  }, [mensaje, error])

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const aceptaDecimales = (unidad) => unidad === 'metro'

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(i => i.idProducto === producto.idProducto)
    const incremento = aceptaDecimales(producto.unidadMedida) ? 0.5 : 1

    if (existe) {
      const nuevaCantidad = existe.cantidad + incremento
      if (nuevaCantidad > Number(producto.stockActual)) {
        setError(`Stock máximo de "${producto.nombre}": ${producto.stockActual} ${producto.unidadMedida}`)
        return
      }
      setCarrito(carrito.map(i =>
        i.idProducto === producto.idProducto
          ? { ...i, cantidad: nuevaCantidad, subTotal: parseFloat((nuevaCantidad * i.precioUnitario).toFixed(2)) }
          : i
      ))
    } else {
      const cantidadInicial = incremento
      setCarrito([...carrito, {
        idProducto: producto.idProducto,
        nombre: producto.nombre,
        unidadMedida: producto.unidadMedida || 'pieza',
        cantidad: cantidadInicial,
        precioUnitario: Number(producto.precioVenta),
        subTotal: parseFloat((cantidadInicial * Number(producto.precioVenta)).toFixed(2)),
        stockMax: Number(producto.stockActual)
      }])
    }
    setBusqueda('')
    setMostrarBuscador(false)
  }

  const quitarDelCarrito = (id) => setCarrito(carrito.filter(i => i.idProducto !== id))

  const cambiarCantidad = (id, nuevaCantidad) => {
    const item = carrito.find(i => i.idProducto === id)
    if (!item) return
    const num = parseFloat(nuevaCantidad)
    if (isNaN(num) || num <= 0) return
    const cantidadFinal = aceptaDecimales(item.unidadMedida) ? num : Math.floor(num)
    if (cantidadFinal <= 0) return
    if (cantidadFinal > item.stockMax) {
      setError(`Stock máximo: ${item.stockMax} ${item.unidadMedida}`)
      return
    }
    setCarrito(carrito.map(i =>
      i.idProducto === id
        ? { ...i, cantidad: cantidadFinal, subTotal: parseFloat((cantidadFinal * i.precioUnitario).toFixed(2)) }
        : i
    ))
  }

  const incrementarCantidad = (id) => {
    const item = carrito.find(i => i.idProducto === id)
    if (!item) return
    const incremento = aceptaDecimales(item.unidadMedida) ? 0.5 : 1
    cambiarCantidad(id, item.cantidad + incremento)
  }

  const decrementarCantidad = (id) => {
    const item = carrito.find(i => i.idProducto === id)
    if (!item) return
    const decremento = aceptaDecimales(item.unidadMedida) ? 0.5 : 1
    if (item.cantidad - decremento < (aceptaDecimales(item.unidadMedida) ? 0.5 : 1)) return
    cambiarCantidad(id, item.cantidad - decremento)
  }

  const total = parseFloat(carrito.reduce((acc, i) => acc + i.subTotal, 0).toFixed(2))
  const cambio = efectivo ? parseFloat(efectivo) - total : 0

  const formatMoney = (n) => `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

  const formatCantidad = (cantidad) => {
    const num = Number(cantidad)
    return Number.isInteger(num) ? num.toString() : num.toFixed(2)
  }

  const confirmarVenta = async () => {
    if (carrito.length === 0) { setError('Agrega al menos un producto al carrito'); return }
    if (!efectivo || parseFloat(efectivo) < total) { setError('El efectivo recibido es insuficiente'); return }
    try {
      await api.post('/ventas', {
        idUsuario: usuario.idUsuario,
        efectivo: parseFloat(efectivo),
        productos: carrito.map(i => ({ idProducto: i.idProducto, cantidad: i.cantidad }))
      })
      setMensaje(`Venta registrada correctamente. Cambio: ${formatMoney(cambio)}`)
      setCarrito([])
      setEfectivo('')
      cargarProductos()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar la venta')
    }
  }

  const colorUnidad = (unidad) => {
    switch (unidad) {
      case 'metro':   return 'info'
      case 'hoja':    return 'purple'
      case 'paquete': return 'warning'
      default:        return 'default'
    }
  }

  return (
    <>
      <PageHeader title="Ventas" />

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

      <div className="bg-white border border-[var(--color-border)] rounded-xl p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              className="input"
              placeholder="Buscar producto por nombre..."
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setMostrarBuscador(true) }}
              onFocus={() => setMostrarBuscador(true)}
            />

            {mostrarBuscador && busqueda && (
              <div className="absolute z-20 mt-2 w-full bg-white border border-[var(--color-border)] rounded-lg shadow-lg max-h-72 overflow-y-auto">
                {productosFiltrados.length === 0 ? (
                  <div className="p-4 text-sm text-center text-[var(--color-muted)]">
                    Sin resultados para "{busqueda}"
                  </div>
                ) : (
                  productosFiltrados.slice(0, 8).map(p => (
                    <button
                      key={p.idProducto}
                      onClick={() => agregarAlCarrito(p)}
                      disabled={Number(p.stockActual) === 0}
                      className="w-full flex items-center justify-between p-3 hover:bg-[var(--color-soft)] transition-colors text-left border-b border-[var(--color-border)] last:border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[var(--color-heading)]">{p.nombre}</p>
                          <Badge color={colorUnidad(p.unidadMedida)} size="sm">
                            {p.unidadMedida || 'pieza'}
                          </Badge>
                        </div>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">
                          {formatMoney(p.precioVenta)} / {p.unidadMedida || 'pieza'} ·
                          Stock: {formatCantidad(p.stockActual)} {p.unidadMedida}
                        </p>
                      </div>
                      {Number(p.stockActual) === 0
                        ? <Badge color="danger">Agotado</Badge>
                        : <Plus size={16} className="text-[var(--color-accent)]" />
                      }
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
            onClick={() => setImpresionModal(true)}
          >
            <Printer size={16} /> Cobrar Impresión
          </button>

          <button
            className="btn-success"
            onClick={() => navigate('/ventas/historial')}
          >
            <ListChecks size={16} /> Historial de Ventas
          </button>
        </div>
      </div>

      <Panel
        title={`Venta actual (${carrito.length} ${carrito.length === 1 ? 'producto' : 'productos'})`}
        icon={ShoppingCart}
      >
        {carrito.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Sin productos en la venta"
            description="Busca y agrega productos para comenzar"
          />
        ) : (
          <Table>
            <THead>
              <TH>ID</TH>
              <TH>Nombre</TH>
              <TH align="center">Unidad</TH>
              <TH align="center">Cantidad</TH>
              <TH align="right">Precio</TH>
              <TH align="right">Subtotal</TH>
              <TH align="center"></TH>
            </THead>
            <TBody>
              {carrito.map(item => {
                const esDecimal = aceptaDecimales(item.unidadMedida)
                return (
                  <TR key={item.idProducto}>
                    <TD className="text-[var(--color-muted)]">{item.idProducto}</TD>
                    <TD className="font-medium">{item.nombre}</TD>
                    <TD align="center">
                      <Badge color={colorUnidad(item.unidadMedida)} size="sm">
                        {item.unidadMedida}
                      </Badge>
                    </TD>
                    <TD align="center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => decrementarCantidad(item.idProducto)}
                          className="w-7 h-7 rounded-md bg-[var(--color-soft)] hover:bg-[var(--color-border)] grid place-items-center transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        {esDecimal ? (
                          <input
                            type="number"
                            value={item.cantidad}
                            onChange={(e) => cambiarCantidad(item.idProducto, e.target.value)}
                            step="0.5"
                            min="0.5"
                            max={item.stockMax}
                            className="w-16 text-center font-semibold border border-[var(--color-border)] rounded-md py-0.5 text-sm"
                          />
                        ) : (
                          <span className="w-12 text-center font-semibold">{item.cantidad}</span>
                        )}
                        <button
                          onClick={() => incrementarCantidad(item.idProducto)}
                          className="w-7 h-7 rounded-md bg-[var(--color-soft)] hover:bg-[var(--color-border)] grid place-items-center transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </TD>
                    <TD align="right">
                      {formatMoney(item.precioUnitario)}
                      <span className="text-xs text-[var(--color-muted)]"> / {item.unidadMedida}</span>
                    </TD>
                    <TD align="right" className="font-semibold">{formatMoney(item.subTotal)}</TD>
                    <TD align="center">
                      <button
                        onClick={() => quitarDelCarrito(item.idProducto)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        )}

        {carrito.length > 0 && (
          <div className="mt-6 flex justify-end">
            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-muted)]">Importe</span>
                <span className="font-bold text-lg text-[var(--color-heading)]">
                  {formatMoney(total)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--color-muted)]">Efectivo</span>
                <input
                  type="number"
                  className="input w-32 text-right"
                  value={efectivo}
                  onChange={(e) => setEfectivo(e.target.value)}
                  placeholder="$0.00"
                  step="0.01"
                />
              </div>

              <div className="flex justify-between text-sm pb-3 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-muted)]">Cambio</span>
                <span className={`font-bold text-lg ${cambio >= 0 && efectivo ? 'text-emerald-600' : 'text-red-500'}`}>
                  {efectivo ? formatMoney(cambio) : '$0.00'}
                </span>
              </div>

              <button
                onClick={confirmarVenta}
                className="btn-primary w-full justify-center"
                disabled={!efectivo || parseFloat(efectivo) < total}
              >
                <CheckCircle2 size={16} />
                Confirmar Venta
              </button>
            </div>
          </div>
        )}
      </Panel>

      <ImpresionModal
        open={impresionModal}
        onClose={() => setImpresionModal(false)}
        onSuccess={(msg) => setMensaje(msg)}
      />
    </>
  )
}