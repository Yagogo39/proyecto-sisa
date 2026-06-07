import { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
  PackageX
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Panel from '../components/ui/Panel'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Pagination from '../components/ui/Pagination'
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table'
import ProductoModal from '../components/modals/ProductoModal'

const ITEMS_POR_PAGINA = 10

export default function Inventario() {
  const { usuario } = useAuth()

  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroProveedor, setFiltroProveedor] = useState('')
  const [filtroUnidad, setFiltroUnidad] = useState('')
  const [pagina, setPagina] = useState(1)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [productoAEliminar, setProductoAEliminar] = useState(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoEditar, setProductoEditar] = useState(null)

  const cargar = () => {
    api.get('/productos').then(r => setProductos(r.data)).catch(() => {})
    api.get('/categorias').then(r => setCategorias(r.data)).catch(() => {})
    api.get('/proveedores').then(r => setProveedores(r.data)).catch(() => {})
  }

  useEffect(() => { cargar() }, [])

  useEffect(() => {
    if (mensaje || error) {
      const t = setTimeout(() => { setMensaje(''); setError('') }, 3500)
      return () => clearTimeout(t)
    }
  }, [mensaje, error])

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      const matchCat = !filtroCategoria || String(p.idCategoria) === filtroCategoria
      const matchProv = !filtroProveedor
      const matchUnidad = !filtroUnidad || p.unidadMedida === filtroUnidad
      return matchBusqueda && matchCat && matchProv && matchUnidad
    })
  }, [productos, busqueda, filtroCategoria, filtroProveedor, filtroUnidad])

  const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA) || 1
  const productosPagina = productosFiltrados.slice(
    (pagina - 1) * ITEMS_POR_PAGINA,
    pagina * ITEMS_POR_PAGINA
  )

  useEffect(() => { setPagina(1) }, [busqueda, filtroCategoria, filtroProveedor, filtroUnidad])

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroCategoria('')
    setFiltroProveedor('')
    setFiltroUnidad('')
  }

  const hayFiltrosActivos = busqueda || filtroCategoria || filtroProveedor || filtroUnidad

  const abrirModalAgregar = () => {
    setProductoEditar(null)
    setModalAbierto(true)
  }

  const abrirModalEditar = (producto) => {
    setProductoEditar(producto)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setProductoEditar(null)
  }

  const onModalSuccess = (msg) => {
    setMensaje(msg)
    cargar()
  }

  const confirmarEliminar = async () => {
    if (!productoAEliminar) return
    try {
      await api.delete(`/productos/${productoAEliminar.idProducto}`)
      setMensaje(`Producto "${productoAEliminar.nombre}" eliminado correctamente`)
      cargar()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar el producto')
    } finally {
      setProductoAEliminar(null)
    }
  }

  const formatMoney = (n) => `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

  const formatStock = (cantidad, unidad) => {
    const num = Number(cantidad || 0)
    const formato = Number.isInteger(num) ? num.toString() : num.toFixed(2)
    return `${formato} ${unidad || 'pieza'}${num !== 1 ? 's' : ''}`
  }

  const stockBadge = (stock, minimo) => {
    if (stock === 0) return { color: 'danger', label: 'Agotado' }
    if (stock <= minimo) return { color: 'warning', label: 'Bajo' }
    return null
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
      <PageHeader
        title="Control de Inventario"
        action={
          usuario?.rol === 'admin' && (
            <button className="btn-success" onClick={abrirModalAgregar}>
              <Plus size={16} /> Agregar
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

      <Panel title="Listado de Productos" icon={Package}>
        <div className="space-y-3 mb-5">
          <div>
            <input
              type="text"
              className="input"
              placeholder="Buscar producto por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] mr-1">
              <Filter size={14} /> Filtros:
            </div>

            <select
              className="input w-auto min-w-[180px]"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="">Todas las Categorías</option>
              {categorias.map(c => (
                <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
              ))}
            </select>

            <select
              className="input w-auto min-w-[180px]"
              value={filtroProveedor}
              onChange={(e) => setFiltroProveedor(e.target.value)}
            >
              <option value="">Todos los Proveedores</option>
              {proveedores.map(p => (
                <option key={p.idProveedor} value={p.idProveedor}>{p.nombre}</option>
              ))}
            </select>

            <select
              className="input w-auto min-w-[150px]"
              value={filtroUnidad}
              onChange={(e) => setFiltroUnidad(e.target.value)}
            >
              <option value="">Todas las Unidades</option>
              <option value="pieza">Pieza</option>
              <option value="metro">Metro</option>
              <option value="hoja">Hoja</option>
              <option value="paquete">Paquete</option>
            </select>

            {hayFiltrosActivos && (
              <button onClick={limpiarFiltros} className="btn-secondary">
                <X size={14} /> Limpiar Filtros
              </button>
            )}
          </div>
        </div>

        {productosFiltrados.length === 0 ? (
          <EmptyState
            icon={PackageX}
            title={hayFiltrosActivos ? 'Sin resultados' : 'Sin productos registrados'}
            description={hayFiltrosActivos
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Agrega productos para comenzar a controlar el inventario'
            }
          />
        ) : (
          <>
            <Table>
              <THead>
                <TH>ID</TH>
                <TH>Nombre del Producto</TH>
                <TH>Categoría</TH>
                <TH align="center">Unidad</TH>
                <TH align="right">Precio</TH>
                <TH align="center">Stock Actual</TH>
                <TH align="center">Stock Mínimo</TH>
                {usuario?.rol === 'admin' && (
                  <>
                    <TH align="center">Editar</TH>
                    <TH align="center">Eliminar</TH>
                  </>
                )}
              </THead>
              <TBody>
                {productosPagina.map(p => {
                  const badge = stockBadge(Number(p.stockActual), Number(p.stockMinimo))
                  return (
                    <TR key={p.idProducto}>
                      <TD className="text-[var(--color-muted)] font-mono text-xs">
                        PROD{String(p.idProducto).padStart(3, '0')}
                      </TD>
                      <TD className="font-medium">{p.nombre}</TD>
                      <TD>{p.categoria || '—'}</TD>
                      <TD align="center">
                        <Badge color={colorUnidad(p.unidadMedida)} size="sm">
                          {p.unidadMedida || 'pieza'}
                        </Badge>
                      </TD>
                      <TD align="right" className="font-semibold">
                        {formatMoney(p.precioVenta)}
                        <span className="text-xs text-[var(--color-muted)] font-normal"> / {p.unidadMedida || 'pieza'}</span>
                      </TD>
                      <TD align="center">
                        <div className="inline-flex items-center gap-2">
                          <span className={`font-semibold ${
                            Number(p.stockActual) === 0
                              ? 'text-red-600'
                              : Number(p.stockActual) <= Number(p.stockMinimo)
                                ? 'text-amber-600'
                                : 'text-[var(--color-heading)]'
                          }`}>
                            {formatStock(p.stockActual, p.unidadMedida)}
                          </span>
                          {badge && <Badge color={badge.color} size="sm">{badge.label}</Badge>}
                        </div>
                      </TD>
                      <TD align="center" className="text-[var(--color-muted)]">
                        {formatStock(p.stockMinimo, p.unidadMedida)}
                      </TD>
                      {usuario?.rol === 'admin' && (
                        <>
                          <TD align="center">
                            <button
                              onClick={() => abrirModalEditar(p)}
                              className="text-[var(--color-accent)] hover:text-blue-700 transition-colors"
                              aria-label="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                          </TD>
                          <TD align="center">
                            <button
                              onClick={() => setProductoAEliminar(p)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              aria-label="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </TD>
                        </>
                      )}
                    </TR>
                  )
                })}
              </TBody>
            </Table>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
              <p className="text-sm text-[var(--color-muted)]">
                Mostrando{' '}
                <span className="font-semibold text-[var(--color-heading)]">
                  {(pagina - 1) * ITEMS_POR_PAGINA + 1}-{Math.min(pagina * ITEMS_POR_PAGINA, productosFiltrados.length)}
                </span>{' '}
                de{' '}
                <span className="font-semibold text-[var(--color-heading)]">
                  {productosFiltrados.length}
                </span>{' '}
                productos
              </p>
              <Pagination page={pagina} totalPages={totalPaginas} onChange={setPagina} />
            </div>
          </>
        )}
      </Panel>

      <ProductoModal
        open={modalAbierto}
        producto={productoEditar}
        onClose={cerrarModal}
        onSuccess={onModalSuccess}
      />

      <ConfirmDialog
        open={!!productoAEliminar}
        title="Eliminar producto"
        message={
          productoAEliminar
            ? `¿Estás seguro de eliminar "${productoAEliminar.nombre}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmarEliminar}
        onCancel={() => setProductoAEliminar(null)}
      />
    </>
  )
}