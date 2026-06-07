import { useState, useEffect } from 'react'
import {
  ShoppingBag,
  Package,
  Tag,
  Eraser,
  Plus,
  History,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Panel from '../components/ui/Panel'
import Input from '../components/ui/Input'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import SinPermisos from '../components/ui/SinPermisos'
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table'
import CategoriaModal from '../components/modals/CategoriaModal'
import ProveedorModal from '../components/modals/ProveedorModal'

const UNIDADES = [
  { value: 'pieza',   label: 'Pieza · Por unidad' },
  { value: 'metro',   label: 'Metro · Permite decimales' },
  { value: 'hoja',    label: 'Hoja · Por hoja individual' },
  { value: 'paquete', label: 'Paquete · Por paquete completo' }
]

const FORM_VACIO = {
  nombre: '',
  idProveedor: '',
  idCategoria: '',
  precioVenta: '',
  precioCompra: '',
  fechaCompra: new Date().toISOString().split('T')[0],
  cantidad: '',
  unidadMedida: 'pieza'
}

export default function Compras() {
  const { usuario } = useAuth()
  const [form, setForm] = useState(FORM_VACIO)
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])

  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  const [categoriaModalOpen, setCategoriaModalOpen] = useState(false)
  const [proveedorModalOpen, setProveedorModalOpen] = useState(false)

  const cargar = () => {
    api.get('/productos').then(r => setProductos(r.data)).catch(() => {})
    api.get('/categorias').then(r => setCategorias(r.data)).catch(() => {})
    api.get('/proveedores').then(r => setProveedores(r.data)).catch(() => {})
  }

  useEffect(() => {
    if (usuario?.rol === 'admin') cargar()
  }, [usuario])

  useEffect(() => {
    if (mensaje || error) {
      const t = setTimeout(() => { setMensaje(''); setError('') }, 3500)
      return () => clearTimeout(t)
    }
  }, [mensaje, error])

  if (usuario?.rol !== 'admin') {
    return <SinPermisos mensaje="La gestión de compras está disponible solo para el administrador." />
  }

  const setField = (campo) => (valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: undefined }))
  }

  const aceptaDecimales = form.unidadMedida === 'metro'

  const validar = () => {
    const err = {}
    if (!form.nombre.trim()) err.nombre = 'Requerido'
    if (!form.idCategoria) err.idCategoria = 'Requerido'
    if (!form.precioVenta || parseFloat(form.precioVenta) <= 0) err.precioVenta = 'Debe ser mayor a 0'
    if (!form.precioCompra || parseFloat(form.precioCompra) <= 0) err.precioCompra = 'Debe ser mayor a 0'
    if (!form.cantidad || parseFloat(form.cantidad) <= 0) err.cantidad = 'Debe ser mayor a 0'

    if (form.cantidad && !aceptaDecimales && !Number.isInteger(parseFloat(form.cantidad))) {
      err.cantidad = `La unidad "${form.unidadMedida}" no permite decimales`
    }

    setErrores(err)
    return Object.keys(err).length === 0
  }

  const limpiar = () => {
    setForm(FORM_VACIO)
    setErrores({})
  }

  const agregarProducto = async (e) => {
    e.preventDefault()
    if (!validar()) {
      setError('Revisa los campos marcados')
      return
    }

    setGuardando(true)
    try {
      await api.post('/productos', {
        nombre: form.nombre.trim(),
        precioVenta: parseFloat(form.precioVenta),
        precioCompra: parseFloat(form.precioCompra),
        stockActual: parseFloat(form.cantidad),
        stockMinimo: 5,
        unidadMedida: form.unidadMedida,
        idCategoria: parseInt(form.idCategoria),
        idProveedor: form.idProveedor ? parseInt(form.idProveedor) : undefined
      })
      setMensaje(`Producto "${form.nombre}" agregado correctamente`)
      limpiar()
      cargar()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al agregar el producto')
    } finally {
      setGuardando(false)
    }
  }

  const onCategoriaCreada = (categoria, msg) => {
    setMensaje(msg)
    api.get('/categorias').then(r => {
      setCategorias(r.data)
      const nueva = r.data.find(c => c.nombre.toLowerCase() === (categoria.nombre || '').toLowerCase())
      if (nueva) {
        setForm(prev => ({ ...prev, idCategoria: String(nueva.idCategoria) }))
      } else if (categoria.idCategoria) {
        setForm(prev => ({ ...prev, idCategoria: String(categoria.idCategoria) }))
      }
    })
  }

  const onProveedorCreado = (proveedor, msg) => {
    setMensaje(msg)
    api.get('/proveedores').then(r => {
      setProveedores(r.data)
      const nuevo = r.data.find(p => p.nombre.toLowerCase() === (proveedor.nombre || '').toLowerCase())
      if (nuevo) {
        setForm(prev => ({ ...prev, idProveedor: String(nuevo.idProveedor) }))
      } else if (proveedor.idProveedor) {
        setForm(prev => ({ ...prev, idProveedor: String(proveedor.idProveedor) }))
      }
    })
  }

  const formatMoney = (n) =>
    `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '—'
    const d = new Date(fechaStr)
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const ultimosProductos = [...productos]
    .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
    .slice(0, 5)

  const renderSelectConAgregar = ({
    label, required, value, onChange, error, options, placeholder, onAgregar, valueKey, labelKey
  }) => (
    <div>
      <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`input cursor-pointer flex-1 ${error ? 'border-red-300' : ''}`}
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt[valueKey]} value={opt[valueKey]}>{opt[labelKey]}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={onAgregar}
          className="px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-sm font-medium flex items-center gap-1 whitespace-nowrap transition-colors"
          title="Crear nuevo"
        >
          <Plus size={14} /> Nuevo
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )

  return (
    <>
      <PageHeader title="Compras" />

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

      <Panel title="Agregar Nuevo Producto" icon={ShoppingBag} className="mb-4">
        <form onSubmit={agregarProducto}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Input
              label="Nombre del producto"
              value={form.nombre}
              onChange={setField('nombre')}
              placeholder="Ej: Cuaderno Profesional Scribe"
              required
              error={errores.nombre}
            />

            {renderSelectConAgregar({
              label: 'Proveedor',
              required: false,
              value: form.idProveedor,
              onChange: setField('idProveedor'),
              options: proveedores,
              placeholder: 'Selecciona un proveedor',
              onAgregar: () => setProveedorModalOpen(true),
              valueKey: 'idProveedor',
              labelKey: 'nombre'
            })}

            {renderSelectConAgregar({
              label: 'Categoría',
              required: true,
              value: form.idCategoria,
              onChange: setField('idCategoria'),
              error: errores.idCategoria,
              options: categorias,
              placeholder: 'Selecciona una categoría',
              onAgregar: () => setCategoriaModalOpen(true),
              valueKey: 'idCategoria',
              labelKey: 'nombre'
            })}

            <div>
              <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
                Unidad de medida <span className="text-red-500">*</span>
              </label>
              <select
                value={form.unidadMedida}
                onChange={(e) => setField('unidadMedida')(e.target.value)}
                className="input cursor-pointer w-full"
                required
              >
                {UNIDADES.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                {aceptaDecimales
                  ? '✓ Permite vender fracciones (ej: 2.5 metros)'
                  : '✓ Se vende en cantidades enteras'
                }
              </p>
            </div>

            <Input
              label={`Precio de Venta (MXN / ${form.unidadMedida})`}
              type="number"
              value={form.precioVenta}
              onChange={setField('precioVenta')}
              placeholder="Ej: 25.00"
              required
              step="0.01"
              min="0"
              error={errores.precioVenta}
            />

            <Input
              label={`Costo Unitario (MXN / ${form.unidadMedida})`}
              type="number"
              value={form.precioCompra}
              onChange={setField('precioCompra')}
              placeholder="Ej: 15.50"
              required
              step="0.01"
              min="0"
              error={errores.precioCompra}
            />

            <Input
              label="Fecha de Compra"
              type="date"
              value={form.fechaCompra}
              onChange={setField('fechaCompra')}
              hint="Informativa — el sistema usa la fecha de registro"
            />

            <Input
              label={`Cantidad Adquirida (${form.unidadMedida})`}
              type="number"
              value={form.cantidad}
              onChange={setField('cantidad')}
              placeholder={aceptaDecimales ? "Ej: 25.5" : "Ej: 100"}
              required
              min="0"
              step={aceptaDecimales ? "0.01" : "1"}
              error={errores.cantidad}
              hint={aceptaDecimales ? 'Acepta decimales' : 'Solo cantidades enteras'}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2 mt-5 pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={limpiar}
              className="btn-secondary"
              disabled={guardando}
            >
              <Eraser size={16} /> Limpiar Formulario
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={guardando}
            >
              <Plus size={16} />
              {guardando ? 'Agregando...' : 'Agregar Producto'}
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Últimos Productos Agregados" icon={History}>
        {ultimosProductos.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Sin productos registrados"
            description="Agrega tu primer producto usando el formulario de arriba"
          />
        ) : (
          <Table>
            <THead>
              <TH>Producto</TH>
              <TH>
                <span className="inline-flex items-center gap-1">
                  <Tag size={11} /> Categoría
                </span>
              </TH>
              <TH align="center">Unidad</TH>
              <TH align="right">Precio Venta</TH>
              <TH align="center">Stock</TH>
              <TH align="right">Fecha</TH>
            </THead>
            <TBody>
              {ultimosProductos.map(p => (
                <TR key={p.idProducto}>
                  <TD>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-[var(--color-accent-soft)] grid place-items-center text-[var(--color-accent)]">
                        <Package size={14} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{p.nombre}</p>
                        <p className="text-xs text-[var(--color-muted)] font-mono">
                          PROD{String(p.idProducto).padStart(3, '0')}
                        </p>
                      </div>
                    </div>
                  </TD>
                  <TD className="text-sm">{p.categoria || '—'}</TD>
                  <TD align="center">
                    <Badge color="default" size="sm">{p.unidadMedida || 'pieza'}</Badge>
                  </TD>
                  <TD align="right" className="font-semibold">
                    {formatMoney(p.precioVenta)}
                    <span className="text-xs text-[var(--color-muted)]"> / {p.unidadMedida || 'pieza'}</span>
                  </TD>
                  <TD align="center" className="font-semibold">
                    {Number(p.stockActual).toLocaleString('es-MX')}
                  </TD>
                  <TD align="right" className="text-sm text-[var(--color-muted)]">
                    {formatFecha(p.fechaRegistro)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Panel>

      <CategoriaModal
        open={categoriaModalOpen}
        categoriasExistentes={categorias}
        onClose={() => setCategoriaModalOpen(false)}
        onSuccess={onCategoriaCreada}
      />

      <ProveedorModal
        open={proveedorModalOpen}
        proveedoresExistentes={proveedores}
        onClose={() => setProveedorModalOpen(false)}
        onSuccess={onProveedorCreado}
      />
    </>
  )
}